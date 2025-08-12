import { Constraint, Position } from "yukigo-core";
import { SourceLocation, SymbolPrimitive, FunctionTypeSignature, TypeNode, Pattern, Expression, FunctionGroup, NumberPrimitive, CharPrimitive, StringPrimitive } from "yukigo-core";
export declare const location: (start: Position, end: Position) => SourceLocation;
export declare const position: (line: number, column: number, offset: number) => Position;
export declare const symbol: (value: string, loc: SourceLocation) => SymbolPrimitive;
export declare const typeCon: (name: string) => TypeNode;
export declare const typeSig: (name: string, location: SourceLocation, inputs: TypeNode[], output: TypeNode, constraints?: Constraint[]) => FunctionTypeSignature;
export declare const litPattern: (primitive: NumberPrimitive | CharPrimitive | StringPrimitive) => Pattern;
export declare const number: (value: number, loc: SourceLocation) => NumberPrimitive;
export declare const char: (value: string, loc: SourceLocation) => CharPrimitive;
export declare const str: (value: string, loc: SourceLocation) => StringPrimitive;
export declare const expr: (body: any) => Expression;
export declare const funcGroup: (name: string, loc: SourceLocation, ...declarations: any[]) => FunctionGroup;
export declare const func: (parameters: Pattern[], body: Expression, attributes: string[], ret?: Expression) => {
    parameters: Pattern[];
    body: Expression;
    return: Expression;
    attributes: string[];
};
