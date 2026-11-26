import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import { parsers } from "prettier/plugins/babel";

const root = resolve(import.meta.dirname, "../..");

function nativeConsoleNodes(source) {
    const found = [];
    function visit(node) {
        if (!node || typeof node !== "object") return;
        if (node.type === "Identifier" && node.name === "console")
            found.push(node.start);
        if (
            (node.type === "ImportDeclaration" ||
                node.type === "ExportNamedDeclaration") &&
            ["console", "node:console"].includes(node.source?.value)
        )
            found.push(node.start);
        if (
            ["MemberExpression", "OptionalMemberExpression"].includes(
                node.type,
            ) &&
            node.computed &&
            node.property?.value === "console"
        )
            found.push(node.start);
        for (const value of Object.values(node)) {
            if (Array.isArray(value)) value.forEach(visit);
            else if (value && typeof value === "object") visit(value);
        }
    }
    visit(parsers.babel.parse(source));
    return found;
}

function sources(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        if (
            [
                "node_modules",
                ".git",
                "tests",
                "fixtures",
                "data",
                "assets",
            ].includes(entry.name)
        )
            return [];
        const path = resolve(directory, entry.name);
        return entry.isDirectory()
            ? sources(path)
            : /\.(?:js|mjs|cjs)$/.test(entry.name)
              ? [path]
              : [];
    });
}

test("module JavaScript routes diagnostics through host capabilities and command reports through terminal streams", () => {
    assert.deepEqual(
        sources(root).flatMap((path) =>
            nativeConsoleNodes(readFileSync(path, "utf8")).map(
                (offset) => `${relative(root, path)}:${offset}`,
            ),
        ),
        [],
    );
});

test("native console guard catches direct calls, aliases, computed globals and imports without matching message text", () => {
    for (const source of [
        "console.warn('x')",
        "const output = console; output.log('x')",
        "window['console'].error('x')",
        "import output from 'node:console';",
    ])
        assert.ok(nativeConsoleNodes(source).length, source);
    assert.deepEqual(
        nativeConsoleNodes(
            "const message = 'console.warn'; const object = { message };",
        ),
        [],
    );
});
