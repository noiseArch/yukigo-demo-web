import { ASTGrouped, Record as RecordNode } from "yukigo-core";
import { FunctionGroup, FunctionTypeSignature, TypeAlias } from "yukigo-core";
import { traverse } from "yukigo-core";

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

type InspectionHandlerMap = {
  [key: string]: (
    ast: ASTGrouped,
    args: Record<string, any>
  ) => { result: boolean };
};

export class ASTAnalyzer {
  private ast: ASTGrouped;
  private typeCheckers: Map<string, (ast: ASTGrouped) => TypeError[]> =
    new Map();

  constructor(ast: ASTGrouped) {
    this.ast = ast;
  }

  registerTypeChecker(
    language: string,
    checker: (ast: ASTGrouped) => TypeError[]
  ) {
    this.typeCheckers.set(language, checker);
  }
  private inspectionHandlers: InspectionHandlerMap = {
    HasBinding: (ast, args) => {
      const bindingName = args.name;
      let found = false;
      traverse(ast, {
        function: (node: FunctionGroup) => {
          if (node.name && node.name.value === bindingName) {
            found = true;
          }
        },
        TypeAlias: (node: TypeAlias) => {
          if (node.name && node.name.value === bindingName) {
            found = true;
          }
        },
        Record: (node: RecordNode) => {
          if (node.name && node.name.value === bindingName) {
            found = true;
          }
        },
        TypeSignature: (node: FunctionTypeSignature) => {
          if (node.name && node.name.value === bindingName) {
            found = true;
          }
        },
      });
      return {
        result: found,
      };
    },
    UsesGuards: (ast, args) => {
      const functionName = args.name;
      let usesGuards = false;
      traverse(ast, {
        function: (node: FunctionGroup) => {
          if (node.name && node.name.value === functionName) {
            if (Array.isArray(node.contents)) {
              for (const content of node.contents) {
                if (
                  content.attributes &&
                  content.attributes.includes("GuardedBody")
                ) {
                  usesGuards = true;
                  break;
                }
              }
            }
          }
        },
      });
      return {
        result: usesGuards,
      };
    },

    UsesAnonymousVariable: (ast, args) => {
      const functionName = args.name;
      let usesAnonymous = false;
      traverse(ast, {
        function: (node: FunctionGroup) => {
          if (node.name && node.name.value === functionName) {
            traverse(node, {
              WildcardPattern() {
                usesAnonymous = true;
              },
            });
          }
        },
      });
      return {
        result: usesAnonymous,
      };
    },

    HasPatternMathing: (ast, args) => {
      const functionName = args.name;
      let hasPatternMathing = false;
      traverse(ast, {
        function: (node: FunctionGroup) => {
          if (node.name.value === functionName && node.contents.length > 1) {
            hasPatternMathing = true;
          }
        },
      });
      return {
        result: hasPatternMathing,
      };
    },

    Uses: (ast, args) => {
      const functionName = args.name;
      const usageName = args.usage;
      let uses = false;
      traverse(ast, {
        function: (node: FunctionGroup) => {
          if (node.name.value === functionName) {
            traverse(node, {
              "*"(symbolNode) {
                if (symbolNode.value && symbolNode.value === usageName)
                  uses = true;
              },
            });
          }
        },
      });
      return {
        result: uses,
      };
    },

    HasLambdaExpression: (ast, args) => {
      const functionName = args.name;
      let hasLambdaExpression = false;
      traverse(ast, {
        function: (node: FunctionGroup) => {
          if (node.name.value === functionName) {
            traverse(node, {
              LambdaExpression() {
                hasLambdaExpression = true;
              },
            });
          }
        },
      });
      return {
        result: hasLambdaExpression,
      };
    },

    HasArithmetic: (ast, args) => {
      const functionName = args.name;
      let hasArithmetic = false;
      traverse(ast, {
        function: (node: FunctionGroup) => {
          if (node.name.value === functionName) {
            traverse(node, {
              Arithmetic() {
                hasArithmetic = true;
              },
            });
          }
        },
      });
      return {
        result: hasArithmetic,
      };
    },

    HasComposition: (ast, args) => {
      const functionName = args.name;
      let hasComposition = false;
      traverse(ast, {
        function: (node: FunctionGroup) => {
          if (node.name && node.name.value === functionName) {
            traverse(node, {
              CompositionExpression() {
                hasComposition = true;
              },
            });
          }
        },
      });
      return {
        result: hasComposition,
      };
    },
  };

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
  public registerInspection(
    name: string,
    handler: (
      ast: ASTGrouped,
      args: Record<string, any>
    ) => { result: boolean; details?: string }
  ) {
    this.inspectionHandlers[name] = handler;
  }

  private runInspection(rule: InspectionRule): AnalysisResult {
    const handler = this.inspectionHandlers[rule.inspection];
    if (!handler) {
      return {
        rule,
        passed: false,
        error: "Unknown inspection",
      };
    }

    try {
      const { result } = handler(this.ast, rule.args || {});
      const passed = result === rule.expected;
      return {
        rule,
        passed,
        actual: result,
      };
    } catch (error) {
      return {
        rule,
        passed: false,
      };
    }
  }

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
  public analyze(rules: InspectionRule[]): AnalysisResult[] {
    const results: AnalysisResult[] = [];
    for (const rule of rules) {
      results.push(this.runInspection(rule));
    }
    return results;
  }
}
