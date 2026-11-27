import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import { sourceFiles } from "../../tooling/reuse/source-files.js";
import { ambiguousNameIssues } from "../../tooling/reuse/ambiguous-names.js";

const root = resolve(import.meta.dirname, "../..");
const fixtures = JSON.parse(
    readFileSync(
        new URL("./fixtures/naming-cases.json", import.meta.url),
        "utf8",
    ),
);

test("all module bindings and table aliases use descriptive names", () => {
    const violations = [];
    for (const file of sourceFiles(root)) {
        if (!/\.[cm]?[jt]sx?$/.test(file)) continue;
        for (const issue of ambiguousNameIssues(readFileSync(file, "utf8")))
            violations.push(
                `${relative(root, file)}:${issue.line}: ambiguous ${issue.kind} '${issue.name}'`,
            );
    }
    assert.deepEqual(violations, [], violations.join("\n"));
});

for (const fixture of fixtures) {
    test(`binding names: ${fixture.name}`, () => {
        assert.deepEqual(
            ambiguousNameIssues(fixture.source).map((issue) => issue.name),
            fixture.names,
        );
    });
}

test("naming diagnostics identify exact source positions", () => {
    const fixture = fixtures.find((entry) => entry.name === "multiline export");
    assert.deepEqual(ambiguousNameIssues(fixture.source), [
        { name: "el", line: 3, offset: 14, kind: "binding" },
    ]);
});

test("invalid source cannot silently pass naming inspection", () => {
    assert.throws(() => ambiguousNameIssues("const = ;"));
});
