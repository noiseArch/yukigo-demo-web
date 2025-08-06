import { ASTGrouped, YukigoParser } from "yukigo-core";
export declare class YukigoHaskellParser implements YukigoParser {
    errors: string[];
    constructor();
    parse(code: string): ASTGrouped;
}
