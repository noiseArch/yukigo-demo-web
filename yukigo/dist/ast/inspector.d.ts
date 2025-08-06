import { ASTGrouped } from "yukigo-core";
export type InspectionRule = {
    inspection: string;
    args?: Record<string, any>;
    expected: boolean;
};
export type AnalysisResult = {
    rule: InspectionRule;
    passed: boolean;
    actual?: any;
    error?: string;
};
export declare class ASTAnalyzer {
    private ast;
    private typeCheckers;
    constructor(ast: ASTGrouped);
    registerTypeChecker(language: string, checker: (ast: ASTGrouped) => TypeError[]): void;
    private inspectionHandlers;
    /**
     * Registers a new custom inspection handler.
     * @param name The name of the inspection (e.g., "HasArithmetic").
     * @param handler The function that implements the inspection logic.
     *
     * @example
     * // Implementation of HasArithmetic inspection
     * const analyzer = new ASTAnalyzer(ast);
     * analyzer.registerInspection("HasArithmetic", (ast, args) => {
     *   let hasArithmetic = false;
     *   traverse(ast, {
     *     function: (node: FunctionGroup) => {
     *       if (node.name.value === args.name) {
     *         traverse(node, {
     *           Arithmetic() {
     *             hasArithmetic = true;
     *           },
     *         });
     *       }
     *     },
     *   });
     *   return {
     *     result: hasArithmetic
     *   };
     * });
     */
    registerInspection(name: string, handler: (ast: ASTGrouped, args: Record<string, any>) => {
        result: boolean;
        details?: string;
    }): void;
    private runInspection;
    /**
     * Runs a list of inspection rules against the AST.
     * @param rules The array of inspection rules to run.
     * @returns An array of analysis results.
     * @example
     * const rules: InspectionRule[] = [
     *  {
     *    inspection: "HasBinding",
     *    args: { name: "minimoEntre" },
     *    expected: false,
     *  },
     *  {
     *    inspection: "HasBinding",
     *    args: { name: "squareList" },
     *    expected: true,
     *  }
     * ]
     * const analyzer = new ASTAnalyzer(ast);
     * const analysisResults = analyzer.analyze(expectations);
     */
    analyze(rules: InspectionRule[]): AnalysisResult[];
}
