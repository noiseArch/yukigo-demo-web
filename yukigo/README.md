# ❄️ Yukigo (WIP)

> A universal, multi-language, multi-paradigm code analyzer highly inspired in [mulang](https://github.com/mumuki/mulang)

## Components

### **Abstract Semantic Tree:**

This is the intermediate representation of any language. Allows us to analyse the semantics of the code independently of the paradigm or the language.

### **Inspector:**

We provide a set of built-in expectations for analysing code. Also allows to define custom expectations at runtime.

### **Translator:**
> This is a concept, not implemented yet

Translation AST-to-Typescript, this allows us to have an equivalent code to run input-output tests everywhere.

### **Tester:**
> This is a concept, not implemented yet

Runs tests on the Typescript translated code using ...

# Usage

## Installation

We will be using Haskell as the target language in this example.

```
npm install yukigo yukigo-haskell-parser
```

or

```
yarn add yukigo yukigo-haskell-parser
```

## Example

```ts
import { ASTAnalyzer } from "yukigo";
import { YukigoHaskellParser } from "yukigo-haskell-parser";

const code = `
type Number = Int
doble :: Number -> Number
doble x = x * 2`;

const expectations = [
  {
    inspection: "HasBinding",
    args: { name: "doble" },
    expected: true,
  },
  {
    inspection: "UsesGuards",
    args: { name: "doble" },
    expected: false,
  },
];

const parser = new YukigoHaskellParser();
const ast = parser.parse(code);

const analyser = new ASTAnalyzer(ast);
const results = analyser.analyze(exp);

console.log(results);
// [
//   {
//     rule: {
//       inspection: "HasBinding",
//       args: { name: "doble" },
//       expected: true,
//     },
//     passed: true,
//     actual: true,
//   },
//   {
//     rule: {
//       inspection: "UsesGuards",
//       args: { name: "doble" },
//       expected: false,
//     },
//     passed: false,
//     actual: false,
//   },
// ];
```

## Example with Mulang's Inspections (in a YAML file)

```ts
import { ASTAnalyzer, translateMulangToInspectionRules } from "yukigo";
import { YukigoHaskellParser } from "yukigo-haskell-parser";

const code = `
squareList :: [Int] -> [Int]
squareList xs = map (\n -> n * n) xs

square :: Int -> Int
square n = n * n

squareList2 :: [Int] -> [Int]
squareList2 = map square
`;

// Assuming the expectations are in a yaml file. Implement a way to load the actual file.
const mulangInspections = `
expectations:
- !ruby/hash:ActiveSupport::HashWithIndifferentAccess
  binding: squareList
  inspection: HasBinding
- !ruby/hash:ActiveSupport::HashWithIndifferentAccess
  binding: squareList
  inspection: HasLambdaExpression
- !ruby/hash:ActiveSupport::HashWithIndifferentAccess
  binding: square
  inspection: HasArithmetic
- !ruby/hash:ActiveSupport::HashWithIndifferentAccess
  binding: doble
  inspection: Not:HasBinding
- !ruby/hash:ActiveSupport::HashWithIndifferentAccess
  binding: square
  inspection: Uses:n
- !ruby/hash:ActiveSupport::HashWithIndifferentAccess
  binding: squareList2
  inspection: Uses:map
`;

const expectations = translateMulangToInspectionRules(mulangInspections);

const parser = new YukigoHaskellParser();
const ast = parser.parse(code);

const analyser = new ASTAnalyzer(ast);
const results = analyser.analyze(exp);

console.log(results);
// [
//   {
//     rule: { inspection: "HasBinding", args: [Object], expected: true },
//     passed: true,
//     actual: true,
//   },
//   {
//     rule: {
//       inspection: "HasLambdaExpression",
//       args: [Object],
//       expected: true,
//     },
//     passed: true,
//     actual: true,
//   },
//   {
//     rule: { inspection: "HasArithmetic", args: [Object], expected: true },
//     passed: true,
//     actual: true,
//   },
//   {
//     rule: { inspection: "HasBinding", args: [Object], expected: false },
//     passed: true,
//     actual: false,
//   },
//   {
//     rule: { inspection: "Uses", args: [Object], expected: true },
//     passed: true,
//     actual: true,
//   },
//   {
//     rule: { inspection: "Uses", args: [Object], expected: true },
//     passed: true,
//     actual: true,
//   },
// ];
```

# Current repositories

- yukigo-core: A set of utils and type definitions to build parsers
- yukigo-haskell-parser
- yukigo-cli

# How to make a parser

A yukigo's parser is a class that implements the interface `YukigoParser` which exposes a public method called `parse` like this:
```ts
parse: (code: string) => AST
```

The package `yukigo-core` has all the current supported AST nodes.
For the grammar, you can use a tool like Jison or Nearley.

Here's a tutorial for implementing a small custom language.
