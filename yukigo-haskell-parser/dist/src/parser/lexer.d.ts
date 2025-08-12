export declare const HaskellLexerConfig: {
    EOF: string;
    anonymousVariable: string;
    WS: RegExp;
    comment: RegExp;
    number: RegExp;
    char: RegExp;
    string: RegExp;
    backtick: string;
    lparen: string;
    rparen: string;
    lbracket: string;
    rbracket: string;
    lsquare: string;
    rsquare: string;
    comma: string;
    dot: string;
    semicolon: string;
    typeArrow: string;
    typeEquals: string;
    colon: string;
    question: string;
    arrow: string;
    strictEquals: string;
    notEquals: string;
    lessThanEquals: string;
    lessThan: string;
    greaterThanEquals: string;
    greaterThan: string;
    equals: string;
    assign: string;
    bool: {
        match: string[];
    };
    op: RegExp;
    constructor: {
        match: RegExp;
        type: any;
    };
    variable: {
        match: RegExp;
        type: any;
    };
    NL: {
        match: RegExp;
        lineBreaks: boolean;
    };
};
export declare const HSLexer: any;
