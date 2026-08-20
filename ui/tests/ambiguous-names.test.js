import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const SCAN_ROOTS = ["api", "ui", "cli", "tooling"].map((path) =>
    resolve(ROOT, path),
);
const ALLOWED_NAMES = new Set([
    "x",
    "y",
    "w",
    "h",
    "_",
    "id",
    "i",
    "j",
    "k",
    "r",
    "c",
]);
const DECLARATION = /^\s*(?:const|let|var)\s+([a-zA-Z]{1,2})\s*=/;

function walk(directory) {
    return readdirSync(directory).flatMap((name) => {
        const path = join(directory, name);
        return statSync(path).isDirectory() ? walk(path) : [path];
    });
}

test("source avoids ambiguous short variable names", () => {
    const violations = [];
    for (const root of SCAN_ROOTS) {
        for (const path of walk(root)) {
            if (!path.endsWith(".js") && !path.endsWith(".mjs")) continue;
            readFileSync(path, "utf8")
                .split("\n")
                .forEach((line, index) => {
                    const name = DECLARATION.exec(line)?.[1];
                    if (name && !ALLOWED_NAMES.has(name)) {
                        violations.push(
                            `${relative(ROOT, path)}:${index + 1}: ${name}`,
                        );
                    }
                });
        }
    }
    assert.deepEqual(violations, []);
});
