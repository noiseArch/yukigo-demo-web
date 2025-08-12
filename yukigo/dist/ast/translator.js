import { Project } from "ts-morph";
import { traverse, } from "yukigo-core";
export class Translator {
    ast;
    project;
    sourceFile;
    recordSignature = new Map();
    typeSignatures = new Map();
    constructor(ast) {
        this.ast = ast;
        this.project = new Project({ useInMemoryFileSystem: true });
        this.sourceFile = this.project.createSourceFile("output.ts", "", {
            overwrite: true,
        });
    }
    translate() {
        traverse(this.ast, {
            TypeAlias: (node) => {
                this.sourceFile.addTypeAlias({
                    name: node.name.value,
                    type: this.translateTypeNode(node.value),
                });
            },
            Record: (node) => {
                node.contents.forEach((constructor) => {
                    this.recordSignature.set(constructor.name, {
                        type: "Record",
                        name: node.name,
                        contents: [constructor],
                    });
                    this.sourceFile.addInterface({
                        name: node.name.value,
                        properties: constructor.fields.map((field) => ({
                            name: field.name.value,
                            type: this.translateTypeNode(field.value),
                        })),
                    });
                    this.sourceFile.addClass({
                        name: constructor.name,
                        implements: [node.name.value],
                        properties: constructor.fields.map((field) => ({
                            name: field.name.value,
                            type: this.translateTypeNode(field.value),
                        })),
                        ctors: [
                            {
                                parameters: constructor.fields.map((field) => ({
                                    name: field.name.value,
                                    type: this.translateTypeNode(field.value),
                                })),
                                statements: constructor.fields.map((field) => `this.${field.name.value} = ${field.name.value}`),
                            },
                        ],
                    });
                });
            },
            TypeSignature: (node) => {
                this.typeSignatures.set(node.name.value, node);
            },
            function: (node) => {
                const functionName = node.name.value;
                const signature = this.typeSignatures.get(functionName);
                if (!signature) {
                    throw new Error(`Missing type signature for function: ${functionName}`);
                }
                const genericClause = node.contents.find((c) => c.parameters.every((p) => p.type === "VariablePattern")) || node.contents[node.contents.length - 1];
                const paramNames = genericClause.parameters.map((p, i) => p.type === "WildcardPattern" ? `p${i}` : this.translateNode(p));
                const func = this.sourceFile.addFunction({
                    name: functionName,
                });
                signature.inputTypes.forEach((type, i) => {
                    func.addParameter({
                        name: paramNames[i],
                        type: this.translateTypeNode(type),
                    });
                });
                func.setReturnType(this.translateTypeNode(signature.returnType));
                node.contents.forEach((clause) => {
                    // The general case (VariablePattern) acts as the final 'else'
                    if (clause.parameters.every((p) => p.type === "VariablePattern" || p.type === "WildcardPattern")) {
                        if (clause.body.body &&
                            clause.body.body
                                .type === "IfThenElse") {
                            const body = this.translateNode(clause.body);
                            func.addStatements(`${body};`);
                        }
                        else {
                            const body = this.translateNode(clause.body);
                            func.addStatements(`return ${body};`);
                        }
                    }
                    else {
                        // Specific literal patterns become 'if' statements
                        const condition = this.buildCondition(clause, paramNames);
                        const body = this.translateNode(clause.body);
                        func.addStatements(`if (${condition}) {\n    return ${body};\n}`);
                    }
                });
            },
        });
        this.sourceFile.formatText();
        return this.sourceFile.getFullText();
    }
    translateNode(node) {
        if (!node || !node.type)
            return "";
        switch (node.type) {
            case "Expression":
                return this.translateNode(node.body);
            case "Arithmetic":
                return this.translateArithmetic(node);
            case "InfixApplication":
                return this.translateInfixApplication(node);
            case "Application":
                return this.translateApplication(node);
            case "CompositionExpression":
                return this.translateCompositionExpression(node);
            case "DataExpression":
                return this.translateDataExpression(node);
            case "LambdaExpression":
                return this.translateLambdaExpression(node);
            case "IfThenElse":
                return this.translateIfThenElse(node);
            case "Concat":
                return this.translateConcat(node);
            case "Comparison":
                return this.translateComparison(node);
            case "YuSymbol":
            case "YuNumber":
            case "YuString":
            case "YuChar":
            case "YuBoolean":
            case "YuList":
                return this.translateYuPrimitive(node);
            case "LiteralPattern":
                return this.translateNode(node.name);
            case "VariablePattern":
                return this.translateNode(node.name);
            default:
                console.warn(`Unknown node type: ${node.type}`);
                return "";
        }
    }
    buildCondition(clause, paramNames) {
        const conditions = [];
        clause.parameters.forEach((param, i) => {
            if (param.type === "LiteralPattern") {
                const literalValue = this.translateNode(param.name);
                conditions.push(`${paramNames[i]} === ${literalValue}`);
            }
        });
        return conditions.join(" && ");
    }
    translateTypeNode(typeNode) {
        switch (typeNode.type) {
            case "TypeConstructor":
                switch (typeNode.name) {
                    case "Double":
                    case "Float":
                    case "Int":
                        return "number";
                    case "Char":
                    case "String":
                        return "string";
                    case "Bool":
                    case "Boolean":
                        return "boolean";
                    default:
                        return typeNode.name;
                }
            case "FunctionType":
                return `(${typeNode.from
                    .map((type, i) => `p${i}: ${this.translateTypeNode(type)}`)
                    .join(", ")}) => ${this.translateTypeNode(typeNode.to)}`;
            case "TypeVar":
            default:
                return "any";
        }
    }
    translateDataExpression(node) {
        return `new ${node.name.value}(${node.contents
            .map((field) => this.translateNode(field.expression))
            .join(", ")})`;
    }
    translateLambdaExpression(node) {
        return `((${node.parameters
            .map((p) => this.translateNode(p))
            .join(", ")}) => ${this.translateNode(node.body)})`;
    }
    translateIfThenElse(node) {
        let IfStatement = `if (${this.translateNode(node.condition.body)}) {\n    return ${this.translateNode(node.then.body)};\n}`;
        if (node.else)
            IfStatement += `else {\n return ${this.translateNode(node.else.body)};\n}`;
        return IfStatement;
    }
    translateArithmetic(node) {
        const left = this.translateNode(node.left);
        const right = this.translateNode(node.right);
        return `${left} ${node.operator} ${right}`;
    }
    translateComparison(node) {
        const left = this.translateNode(node.left);
        const right = this.translateNode(node.right);
        return `${left} ${node.operator} ${right}`;
    }
    translateConcat(node) {
        const left = this.translateNode(node.left);
        const right = this.translateNode(node.right);
        return `${left} + ${right}`;
    }
    translateCompositionExpression(node) {
        const left = this.translateNode(node.left);
        const right = this.translateNode(node.right);
        return `${left}(${right})`;
    }
    translateApplication(node) {
        const args = [];
        let current = node;
        // handle nested/curried application
        while (current && current.type === "Application") {
            args.unshift(this.translateNode(current.parameter));
            current = current.function.body;
        }
        const functionName = this.translateNode(current);
        const isConstructor = this.recordSignature.has(functionName);
        const call = `${functionName}(${args.join(", ")})`;
        return isConstructor ? `new ${call}` : call;
    }
    translateInfixApplication(node) {
        const left = node.left;
        const right = node.right;
        const op = node.operator;
        return `${this.translateNode(op)}(${this.translateNode(left)}, ${this.translateNode(right)})`;
    }
    translateYuPrimitive(node) {
        if (node.type == "YuList")
            return `[${node.elements
                .map((el) => this.translateNode(el))
                .join(", ")}]`;
        if (node.type === "YuBoolean")
            return node.value === "True" ? "true" : "false";
        return node.value.toString();
    }
}
