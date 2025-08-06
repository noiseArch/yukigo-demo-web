export function traverse(node, visitor, parent) {
    if (!node || typeof node !== "object")
        return;
    if (node.type && visitor[node.type]) {
        visitor[node.type](node, parent);
    }
    if (visitor["*"]) {
        visitor["*"](node, parent);
    }
    for (const key in node) {
        if (key === "type")
            continue;
        const child = node[key];
        if (Array.isArray(child)) {
            child.forEach((c) => traverse(c, visitor, node));
        }
        else if (typeof child === "object" && child !== null) {
            traverse(child, visitor, node);
        }
    }
}
