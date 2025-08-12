import { AST, ASTGrouped, BodyExpression, Constructor, ControlFlowConditional, DataExpression, Expression, FieldExpression, Primitive, Record as RecordNode, SymbolPrimitive } from "yukigo-core";
import { CompositionExpression, ApplicationExpression, FunctionTypeSignature, TypeAlias, Pattern, TypeNode, LambdaExpression, FunctionDeclaration, InfixApplicationExpression, GuardedFunctionDeclaration, UnguardedFunctionDeclaration } from "yukigo-core";
interface BaseMooToken {
    type: string;
    value: string;
    text: string;
    toString: () => string;
    offset: number;
    lineBreaks: number;
    line: number;
    col: number;
}
interface ListToken {
    type: "list";
    body: Expression[];
    start: BaseMooToken;
    end: BaseMooToken;
}
type Token = BaseMooToken | ListToken;
declare function parseFunction(token: {
    type: "function";
    name: SymbolPrimitive;
    params: Pattern[];
    body: Expression;
    return: Expression;
    attributes: string[];
}): FunctionDeclaration;
declare function parseFunctionType(token: [SymbolPrimitive, TypeNode]): FunctionTypeSignature;
declare function parseTypeAlias(token: [SymbolPrimitive, TypeNode]): TypeAlias;
declare function parseExpression(token: BodyExpression): Expression;
declare function parseLambda(token: [Pattern[], Expression]): LambdaExpression;
declare function parseCompositionExpression(token: [SymbolPrimitive, SymbolPrimitive]): CompositionExpression;
declare function parseApplication(token: [BodyExpression, Expression | BodyExpression]): ApplicationExpression;
declare function parseInfixApplication(token: [SymbolPrimitive, BodyExpression, BodyExpression]): InfixApplicationExpression;
declare function parseDataExpression(token: [SymbolPrimitive, FieldExpression[]]): DataExpression;
declare function parseDataDeclaration(token: [SymbolPrimitive, Constructor[]]): RecordNode;
declare function parseConditional(token: [Expression, Expression, Expression]): ControlFlowConditional;
declare function parsePrimary(token: Token): Primitive;
export declare function groupFunctionDeclarations(ast: AST): ASTGrouped;
export declare function isGuardedBody(declaration: Omit<FunctionDeclaration, "name" | "type">): declaration is GuardedFunctionDeclaration;
export declare function isUnguardedBody(declaration: Omit<FunctionDeclaration, "name" | "type">): declaration is UnguardedFunctionDeclaration;
export { parseFunction, parsePrimary, parseExpression, parseConditional, parseCompositionExpression, parseTypeAlias, parseDataDeclaration, parseFunctionType, parseInfixApplication, parseApplication, parseDataExpression, parseLambda, };
