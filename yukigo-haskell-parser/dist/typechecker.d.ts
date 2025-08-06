import { ASTGrouped } from "yukigo-core";
export declare class TypeChecker {
    private errors;
    private signatureMap;
    private recordMap;
    private typeAliasMap;
    check(ast: ASTGrouped): string[];
    private buildGlobalEnvironment;
    private inferType;
    private unify;
    private unifyLists;
    private typeEquals;
    private typeEqualsList;
    private resolveTypeAlias;
    private bindVariable;
    private isTypeInfinite;
    private resolvePatterns;
    private mapTypeNodePrimitives;
    private applySubstitution;
    private walkTypeNode;
    private formatType;
}
