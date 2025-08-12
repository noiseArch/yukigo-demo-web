import { Project, SourceFile } from "ts-morph";
import {
  ASTGrouped,
  ArithmeticOperation,
  FunctionGroup,
  FunctionTypeSignature,
  LiteralPattern,
  SymbolPrimitive,
  NumberPrimitive,
  ApplicationExpression,
  TypeNode,
  VariablePattern,
  FunctionDeclaration,
  StringPrimitive,
  BooleanPrimitive,
  CharPrimitive,
  ConcatOperation,
  Primitive,
  ListPrimitive,
  traverse,
  TypeAlias,
  Record as RecordNode,
  DataExpression,
  LambdaExpression,
  ControlFlowConditional,
  UnguardedFunctionDeclaration,
  ComparisonOperation,
  InfixApplicationExpression,
  CompositionExpression,
} from "yukigo-core";

export class Translator {
  private ast: ASTGrouped;
  private project: Project;
  private sourceFile: SourceFile;
  private recordSignature: Map<string, RecordNode> = new Map();
  private typeSignatures: Map<string, FunctionTypeSignature> = new Map();

  constructor(ast: ASTGrouped) {
    this.ast = ast;
    this.project = new Project({ useInMemoryFileSystem: true });
    this.sourceFile = this.project.createSourceFile("output.ts", "", {
      overwrite: true,
    });
  }

  public translate(): string {
    traverse(this.ast, {
      TypeAlias: (node: TypeAlias) => {
        this.sourceFile.addTypeAlias({
          name: node.name.value,
          type: this.translateTypeNode(node.value),
        });
      },
      Record: (node: RecordNode) => {
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
                statements: constructor.fields.map(
                  (field) => `this.${field.name.value} = ${field.name.value}`
                ),
              },
            ],
          });
        });
      },
      TypeSignature: (node: FunctionTypeSignature) => {
        this.typeSignatures.set(node.name.value, node);
      },
      function: (node: FunctionGroup) => {
        const functionName = node.name.value;
        const signature = this.typeSignatures.get(functionName);
        if (!signature) {
          throw new Error(
            `Missing type signature for function: ${functionName}`
          );
        }

        const genericClause =
          node.contents.find((c) =>
            c.parameters.every((p) => p.type === "VariablePattern")
          ) || node.contents[node.contents.length - 1];
        const paramNames = genericClause.parameters.map((p, i) =>
          p.type === "WildcardPattern" ? `p${i}` : this.translateNode(p)
        );
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
          if (
            clause.parameters.every(
              (p) =>
                p.type === "VariablePattern" || p.type === "WildcardPattern"
            )
          ) {
            if (
              (clause as unknown as UnguardedFunctionDeclaration).body.body &&
              (clause as unknown as UnguardedFunctionDeclaration).body.body
                .type === "IfThenElse"
            ) {
              const body = this.translateNode(clause.body);
              func.addStatements(`${body};`);
            } else {
              const body = this.translateNode(clause.body);
              func.addStatements(`return ${body};`);
            }
          } else {
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

  private translateNode(node: any): string {
    if (!node || !node.type) return "";

    switch (node.type) {
      case "Expression":
        return this.translateNode(node.body);
      case "Arithmetic":
        return this.translateArithmetic(node as ArithmeticOperation);
      case "InfixApplication":
        return this.translateInfixApplication(
          node as InfixApplicationExpression
        );
      case "Application":
        return this.translateApplication(node as ApplicationExpression);
      case "CompositionExpression":
        return this.translateCompositionExpression(
          node as CompositionExpression
        );
      case "DataExpression":
        return this.translateDataExpression(node as DataExpression);
      case "LambdaExpression":
        return this.translateLambdaExpression(node as LambdaExpression);
      case "IfThenElse":
        return this.translateIfThenElse(node as ControlFlowConditional);
      case "Concat":
        return this.translateConcat(node as ConcatOperation);
      case "Comparison":
        return this.translateComparison(node as ComparisonOperation);
      case "YuSymbol":
      case "YuNumber":
      case "YuString":
      case "YuChar":
      case "YuBoolean":
      case "YuList":
        return this.translateYuPrimitive(node as Primitive);
      case "LiteralPattern":
        return this.translateNode((node as LiteralPattern).name);
      case "VariablePattern":
        return this.translateNode((node as VariablePattern).name);
      default:
        console.warn(`Unknown node type: ${node.type}`);
        return "";
    }
  }

  private buildCondition(
    clause: Omit<FunctionDeclaration, "name" | "type">,
    paramNames: string[]
  ): string {
    const conditions: string[] = [];
    clause.parameters.forEach((param, i) => {
      if (param.type === "LiteralPattern") {
        const literalValue = this.translateNode(param.name);
        conditions.push(`${paramNames[i]} === ${literalValue}`);
      }
    });
    return conditions.join(" && ");
  }

  private translateTypeNode(typeNode: TypeNode): string {
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

  private translateDataExpression(node: DataExpression) {
    return `new ${node.name.value}(${node.contents
      .map((field) => this.translateNode(field.expression))
      .join(", ")})`;
  }

  private translateLambdaExpression(node: LambdaExpression) {
    return `((${node.parameters
      .map((p) => this.translateNode(p))
      .join(", ")}) => ${this.translateNode(node.body)})`;
  }

  private translateIfThenElse(node: ControlFlowConditional) {
    let IfStatement = `if (${this.translateNode(
      node.condition.body
    )}) {\n    return ${this.translateNode(node.then.body)};\n}`;
    if (node.else)
      IfStatement += `else {\n return ${this.translateNode(
        node.else.body
      )};\n}`;
    return IfStatement;
  }

  private translateArithmetic(node: ArithmeticOperation): string {
    const left = this.translateNode(node.left);
    const right = this.translateNode(node.right);
    return `${left} ${node.operator} ${right}`;
  }
  private translateComparison(node: ComparisonOperation): string {
    const left = this.translateNode(node.left);
    const right = this.translateNode(node.right);
    return `${left} ${node.operator} ${right}`;
  }
  private translateConcat(node: ConcatOperation): string {
    const left = this.translateNode(node.left);
    const right = this.translateNode(node.right);
    return `${left} + ${right}`;
  }

  private translateCompositionExpression(node: CompositionExpression): string {
    const left = this.translateNode(node.left);
    const right = this.translateNode(node.right);
    return `${left}(${right})`;
  }

  private translateApplication(node: ApplicationExpression): string {
    const args: string[] = [];
    let current: any = node;

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
  private translateInfixApplication(node: InfixApplicationExpression): string {
    const left = node.left;
    const right = node.right;
    const op = node.operator;

    return `${this.translateNode(op)}(${this.translateNode(
      left
    )}, ${this.translateNode(right)})`;
  }

  private translateYuPrimitive(node: Primitive): string {
    if (node.type == "YuList")
      return `[${node.elements
        .map((el) => this.translateNode(el))
        .join(", ")}]`;
    if (node.type === "YuBoolean")
      return node.value === "True" ? "true" : "false";
    return node.value.toString();
  }
}
