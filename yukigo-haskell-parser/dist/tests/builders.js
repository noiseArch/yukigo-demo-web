export const location = (start, end) => ({
    start,
    end,
});
export const position = (line, column, offset) => ({
    line,
    column,
    offset,
});
// Symbol builder
export const symbol = (value, loc) => ({
    type: "YuSymbol",
    value,
    loc,
});
// Type constructors
export const typeCon = (name) => ({
    type: "TypeConstructor",
    name,
});
// Function type signature
export const typeSig = (name, location, inputs, output, constraints = []) => ({
    type: "TypeSignature",
    name: symbol(name, location),
    constraints,
    inputTypes: inputs,
    returnType: output,
});
// Literal pattern builder
export const litPattern = (primitive) => ({
    type: "LiteralPattern",
    name: primitive,
});
// Primitive builders
export const number = (value, loc) => ({
    type: "YuNumber",
    numericType: "number",
    value,
    loc,
});
export const char = (value, loc) => ({
    type: "YuChar",
    value,
    loc,
});
export const str = (value, loc) => ({
    type: "YuString",
    value,
    loc,
});
// Expression wrapper
export const expr = (body) => ({
    type: "Expression",
    body,
});
// Function group builder
export const funcGroup = (name, loc, ...declarations) => ({
    type: "function",
    name: symbol(name, loc),
    contents: declarations,
});
// function builder
export const func = (parameters, body, attributes, ret) => ({
    parameters,
    body,
    return: ret || body,
    attributes: attributes,
});
