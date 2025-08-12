import * as ts from "typescript";
import { assert } from "chai";
export class Tester {
    test(code, tests) {
        const jsCode = this.transpile(code);
        const jsTests = this.transpile(tests);
        const suites = [];
        let currentSuite = null;
        const describe = (name, fn) => {
            const suite = { name, tests: [] };
            suites.push(suite);
            const prevSuite = currentSuite;
            currentSuite = suite;
            fn();
            currentSuite = prevSuite;
        };
        const it = (name, fn) => {
            if (!currentSuite)
                throw new Error("it() called outside describe()");
            let testResult = {
                name,
                status: "passed",
            };
            try {
                fn();
            }
            catch (error) {
                testResult.status = "failed";
                testResult.error = error.message;
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
            const execute = new Function(...Object.keys(context), `${jsCode}\n${jsTests}`);
            execute(...Object.values(context));
        }
        catch (e) {
            suites.push({
                name: "Execution Error",
                tests: [
                    {
                        name: "Global Error",
                        status: "failed",
                        error: e.message,
                    },
                ],
            });
        }
        return suites;
    }
    transpile(code) {
        return ts.transpileModule(code, {
            compilerOptions: {
                target: ts.ScriptTarget.ES2024,
                module: ts.ModuleKind.None,
            },
        }).outputText;
    }
}
