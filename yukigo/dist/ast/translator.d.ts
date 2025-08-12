import { ASTGrouped } from "yukigo-core";
export declare class Translator {
    private ast;
    private project;
    private sourceFile;
    private recordSignature;
    private typeSignatures;
    constructor(ast: ASTGrouped);
    translate(): string;
    private translateNode;
    private buildCondition;
    private translateTypeNode;
    private translateDataExpression;
    private translateLambdaExpression;
    private translateIfThenElse;
    private translateArithmetic;
    private translateComparison;
    private translateConcat;
    private translateCompositionExpression;
    private translateApplication;
    private translateInfixApplication;
    private translateYuPrimitive;
}
