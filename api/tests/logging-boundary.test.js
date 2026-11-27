import { sourceFiles } from "../../tooling/reuse/source-files.js";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("module JavaScript routes diagnostics through host capabilities and command reports through terminal streams", () => {
    assert.deepEqual(
        sourceFiles(root, {
            excludeDirectories: [
                "node_modules",
                ".git",
                "tests",
                "fixtures",
                "data",
                "assets",
            ],
        })
            .filter((file) => /\.(?:js|mjs|cjs)$/.test(file))
            .flatMap((path) =>
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
