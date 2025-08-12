import * as ts from "typescript";
import { assert } from "chai";

interface TestResult {
  name: string;
  status: "passed" | "failed";
  error?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
}

export class Tester {
  public test(code: string, tests: string): TestSuite[] {
    const jsCode = this.transpile(code);
    const jsTests = this.transpile(tests);

    const suites: TestSuite[] = [];
    let currentSuite: TestSuite | null = null;

    const describe = (name: string, fn: () => void) => {
      const suite: TestSuite = { name, tests: [] };
      suites.push(suite);
      const prevSuite = currentSuite;
      currentSuite = suite;
      fn();
      currentSuite = prevSuite;
    };

    const it = (name: string, fn: () => void) => {
      if (!currentSuite) throw new Error("it() called outside describe()");

      let testResult: TestResult = {
        name,
        status: "passed",
      };
      try {
        fn();
      } catch (error) {
        testResult.status = "failed";
        testResult.error = (error as Error).message;
      }

      currentSuite.tests.push(testResult);
    };

    const context = {
      describe,
      it,
      assert,
      console,
    };

    try {
      const execute = new Function(
        ...Object.keys(context),
        `${jsCode}\n${jsTests}`
      );
      execute(...Object.values(context));
    } catch (e) {
      suites.push({
        name: "Execution Error",
        tests: [
          {
            name: "Global Error",
            status: "failed",
            error: (e as Error).message,
          },
        ],
      });
    }

    return suites;
  }

  private transpile(code: string): string {
    return ts.transpileModule(code, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2024,
        module: ts.ModuleKind.None,
      },
    }).outputText;
  }
}
