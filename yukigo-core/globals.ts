import {
  ApplicationExpression,
  CompositionExpression,
  FunctionDeclaration,
  FunctionGroup,
  FunctionTypeSignature,
  InfixApplicationExpression,
  LambdaExpression,
  TypeAlias,
  TypeNode,
} from "./paradigms/functional.js";

export type Modify<T, R> = Omit<T, keyof R> & R;

// Universal primitive value types

export type YukigoPrimitive =
  | "YuNumber"
  | "YuString"
  | "YuChar"
  | "YuBoolean"
  | "YuList"
  | "YuNull"
  | "YuUndefined"
  | "YuSymbol";

export type PrimitiveValue =
  | number
  | boolean
  | string
  | symbol
  | null
  | undefined;

// Primitives

/**
 * Base interface for all primitive values
 */
export interface BasePrimitive {
  type: YukigoPrimitive;
  value: PrimitiveValue | PrimitiveValue[];
  loc: SourceLocation;
}

export interface NumberPrimitive extends BasePrimitive {
  type: "YuNumber";
  numericType: string;
  value: number;
}

export interface BooleanPrimitive extends BasePrimitive {
  type: "YuBoolean";
  value: string;
}

export interface CharPrimitive extends BasePrimitive {
  type: "YuChar";
  value: string;
}
export interface StringPrimitive extends BasePrimitive {
  type: "YuString";
  value: string;
}

export interface NullPrimitive extends BasePrimitive {
  type: "YuNull";
  value: null;
}

export interface UndefinedPrimitive extends BasePrimitive {
  type: "YuUndefined";
  value: undefined;
}

export interface SymbolPrimitive extends BasePrimitive {
  type: "YuSymbol";
  value: string;
  description?: string;
}

export interface ListPrimitive {
  type: "YuList";
  elements: Expression[];
  loc: SourceLocation;
}

export type Primitive =
  | NumberPrimitive
  | BooleanPrimitive
  | CharPrimitive
  | StringPrimitive
  | NullPrimitive
  | UndefinedPrimitive
  | SymbolPrimitive
  | ListPrimitive;

/**
 * Source location information
 */
export interface SourceLocation {
  start: Position;
  end: Position;
}

export interface Position {
  line: number;
  column: number;
  offset: number;
}

// Operators

/**
 * Base interface for all operations
 */
export interface BaseOperation {
  type: string;
  operator: string;
  right: Expression;
  left: Expression;
  loc: SourceLocation;
}

export interface ArithmeticOperation extends BaseOperation {
  type: "Arithmetic";
  operator: "+" | "-" | "*" | "/" | "%" | "**";
}

export interface ComparisonOperation extends BaseOperation {
  type: "Comparison";
  operator: "==" | "!=" | "===" | "!==" | "<" | ">" | "<=" | ">=";
}

export interface LogicalOperation extends BaseOperation {
  type: "logical";
  operator: "&&" | "||" | "??";
}

export interface BitwiseOperation extends BaseOperation {
  type: "bitwise";
  operator: "&" | "|" | "^" | "~" | "<<" | ">>" | ">>>";
}

export interface TransformOperation {
  type: "Transform";
  operator: "map";
  function: Expression;
  list: Expression;
  loc: SourceLocation;
}
export interface SelectOperation {
  type: "Select";
  operator: "filter";
  function: Expression;
  list: Expression;
  loc: SourceLocation;
}

export interface ConcatOperation {
  type: "Concat";
  operator: string;
  left: Expression;
  right: Expression;
}

export type StringOperation = ConcatOperation;

export type Operation =
  | ArithmeticOperation
  | ComparisonOperation
  | LogicalOperation
  | BitwiseOperation
  | StringOperation;

// Collections

/**
 * Base collection interface
 */
export interface BaseCollection {
  type: string;
  elements: Expression[];
  loc: SourceLocation;
}

export interface ArrayCollection extends BaseCollection {
  type: "array";
}

// Not implemented yet
export interface SetCollection extends BaseCollection {
  type: "set";
}
// Not implemented yet
export interface MapCollection {
  type: "map";
  entries: MapEntry[];
  loc: SourceLocation;
}
export interface MapEntry {
  key: Expression;
  value: Expression;
}

// Expressions

export interface TupleExpression {
  type: "TupleExpression";
  elements: Expression[];
}

export interface FieldExpression {
  type: "FieldExpression";
  name: SymbolPrimitive;
  expression: Expression;
}

export interface DataExpression {
  type: "DataExpression";
  name: SymbolPrimitive;
  contents: FieldExpression[];
}
export interface ConsExpression {
  type: "ConsExpression";
  head: Expression;
  tail: Expression;
}

export interface ControlFlowConditional {
  type: "IfThenElse";
  condition: Expression;
  then: Expression;
  else: Expression;
}

export type BodyExpression =
  | Primitive
  | Operation
  | TupleExpression
  | ControlFlowConditional
  | ConsExpression
  | DataExpression
  | CompositionExpression
  | LambdaExpression
  | ApplicationExpression
  | InfixApplicationExpression;

export type Expression = {
  type: "Expression";
  body: BodyExpression;
};

export interface Field {
  type: "Field";
  name: SymbolPrimitive | undefined;
  value: TypeNode;
}

export interface Constructor {
  name: string;
  fields: Field[];
}

export interface Record {
  type: "Record";
  name: SymbolPrimitive;
  contents: Constructor[];
}

export type AST = (TypeAlias | FunctionTypeSignature | FunctionDeclaration)[];
export type ASTGrouped = (TypeAlias | FunctionTypeSignature | FunctionGroup)[];

export interface YukigoParser {
  errors?: string[]
  parse: (code: string) => ASTGrouped;
}

type Visitor = {
  [nodeType: string]: (node: any, parent?: any) => void;
};

export function traverse(node: any, visitor: Visitor, parent?: any) {
  if (!node || typeof node !== "object") return;
  if (node.type && visitor[node.type]) {
    visitor[node.type](node, parent);
  }
  if (visitor["*"]) {
    visitor["*"](node, parent);
  }
  for (const key in node) {
    if (key === "type") continue;
    const child = node[key];
    if (Array.isArray(child)) {
      child.forEach((c) => traverse(c, visitor, node));
    } else if (typeof child === "object" && child !== null) {
      traverse(child, visitor, node);
    }
  }
}
