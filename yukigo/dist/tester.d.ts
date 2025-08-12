interface TestResult {
    name: string;
    status: "passed" | "failed";
    error?: string;
}
interface TestSuite {
    name: string;
    tests: TestResult[];
}
export declare class Tester {
    test(code: string, tests: string): TestSuite[];
    private transpile;
}
export {};
