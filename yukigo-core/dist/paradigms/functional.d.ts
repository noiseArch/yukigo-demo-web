import { BodyExpression, BooleanPrimitive, CharPrimitive, Expression, NumberPrimitive, StringPrimitive, SymbolPrimitive } from "../globals.js";
interface BaseFunctionDeclaration {
    type: "function";
    name: SymbolPrimitive;
    parameters: Pattern[];
    attributes: string[];
}
export interface GuardedFunctionDeclaration extends BaseFunctionDeclaration {
    body: Guard[];
    return: Guard[];
}
export interface UnguardedFunctionDeclaration extends BaseFunctionDeclaration {
    body: Expression;
    return: Expression;
}
export interface Guard {
    condition: Expression;
    body: Expression;
    return: Expression;
}
export type FunctionDeclaration = GuardedFunctionDeclaration | UnguardedFunctionDeclaration;
export interface FunctionGroup {
    type: "function";
    name: SymbolPrimitive;
    contents: Omit<FunctionDeclaration, "name" | "type">[];
}
export interface FunctionTypeSignature {
    type: "TypeSignature";
    name: SymbolPrimitive;
    constraints: Constraint[];
    inputTypes: TypeNode[];
    returnType: TypeNode;
}
export interface WildcardPattern {
    type: "WildcardPattern";
    name: "_";
}
export interface LiteralPattern {
    type: "LiteralPattern";
    name: NumberPrimitive | CharPrimitive | StringPrimitive | BooleanPrimitive;
}
export interface VariablePattern {
    type: "VariablePattern";
    name: SymbolPrimitive;
}
export interface ConstructorPattern {
    type: "ConstructorPattern";
    constructor: string;
    patterns: Pattern[];
}
export interface ListPattern {
    type: "ListPattern";
    elements: Pattern[];
}
export interface ConsPattern {
    type: "ConsPattern";
    head: Pattern;
    tail: Pattern;
}
export interface AsPattern {
    type: "AsPattern";
    alias: VariablePattern | WildcardPattern;
    pattern: Pattern;
}
export interface TuplePattern {
    type: "TuplePattern";
    elements: Pattern[];
}
export type Pattern = VariablePattern | LiteralPattern | WildcardPattern | ConstructorPattern | ListPattern | ConsPattern | AsPattern | TuplePattern;
export interface FunctionExpression {
    type: "function_expression";
    name: SymbolPrimitive;
    parameters: SymbolPrimitive[];
}
export interface CompositionExpression {
    type: "CompositionExpression";
    left: SymbolPrimitive;
    right: SymbolPrimitive;
}
export interface LambdaExpression {
    type: "LambdaExpression";
    parameters: Pattern[];
    body: Expression;
}
export interface InfixApplicationExpression {
    type: "InfixApplication";
    operator: SymbolPrimitive;
    left: Expression;
    right: Expression;
}
export interface ApplicationExpression {
    type: "Application";
    function: Expression;
    parameter: Expression | BodyExpression;
}
export interface TypeAlias {
    type: "TypeAlias";
    name: SymbolPrimitive;
    value: TypeNode;
}
export type TypeVar = {
    type: "TypeVar";
    name: string;
};
export type TypeConstructor = {
    type: "TypeConstructor";
    name: string;
};
export type Constraint = {
    type: "Constraint";
    className: string;
    params: TypeNode[];
};
export type ConstrainedType = {
    type: "ConstrainedType";
    context: Constraint[];
    body: TypeNode;
};
export type FunctionType = {
    type: "FunctionType";
    from: TypeNode[];
    to: TypeNode;
};
export type TypeApplication = {
    type: "TypeApplication";
    base: TypeNode;
    args: TypeNode[];
};
export type ListType = {
    type: "ListType";
    element: TypeNode;
};
export type TupleType = {
    type: "TupleType";
    elements: TypeNode[];
};
export type DataType = {
    type: "DataType";
    name: string;
    constructors: {
        name: string;
        fields: TypeNode[];
    }[];
};
export type IfTheElseType = {
    type: "IfTheElseType";
    condition: TypeNode;
    then: TypeNode;
    else: TypeNode;
};
export type TypeNode = TypeVar | TypeConstructor | Constraint | ConstrainedType | FunctionType | TypeApplication | ListType | TupleType | DataType | IfTheElseType;
export {};
