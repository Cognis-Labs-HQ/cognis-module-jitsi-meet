import test from "node:test";
import assert from "node:assert/strict";
import {
    readFileSync,
    existsSync,
    readdirSync,
    mkdtempSync,
    mkdirSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import {
    validateMarkdown,
    languages,
    documents,
    validateBundle,
    referenceIssues,
} from "../../scripts/reuse/documentation/validate.js";
import structure from "../../scripts/reuse/documentation/structure.json" with { type: "json" };
import { markdown } from "./fixtures/documentation.js";

const root = resolve(import.meta.dirname, "../..");

for (const language of languages) {
    for (const kind of Object.keys(documents)) {
        test(`${language} ${kind} rejects missing, duplicated and reordered sections`, () => {
            const valid = markdown(kind, language);
            const sections = structure[language][kind];
            for (const heading of sections) {
                const block = `## ${heading}\n\nConcrete instructions and expected behavior.\n`;
                for (const invalid of [
                    valid.replace(block, ""),
                    valid + "\n" + block,
                ])
                    assert.ok(
                        validateMarkdown(invalid, kind, language).length,
                        invalid,
                    );
            }
            for (let index = 1; index < sections.length; index++) {
                const invalid = valid
                    .replace(`## ${sections[index - 1]}\n`, "## SWAP\n")
                    .replace(
                        `## ${sections[index]}\n`,
                        `## ${sections[index - 1]}\n`,
                    )
                    .replace("## SWAP\n", `## ${sections[index]}\n`);
                assert.ok(
                    validateMarkdown(invalid, kind, language).some((issue) =>
                        issue.startsWith("Required H2 order:"),
                    ),
                );
            }
        });

        test(`${language} ${kind} rejects content and heading layout bypasses`, () => {
            const valid = markdown(kind, language);
            for (const intro of [
                "<!-- Invisible introduction -->",
                "- A list is not an introductory paragraph.",
                "### Hidden Subsection",
                "```txt\nOnly code\n```",
                "    Only indented code",
            ])
                assert.ok(
                    validateMarkdown(
                        valid.replace(
                            "A useful introduction for the component.",
                            intro,
                        ),
                        kind,
                        language,
                    ).includes("Missing introductory paragraph"),
                );
            for (const invalid of [
                valid.replace(
                    "Concrete instructions and expected behavior.",
                    "<!-- Hidden section text -->",
                ),
                valid + "\n### Empty Subsection\n\n<!-- Nothing visible -->\n",
                valid + "\n#### Skipped Level\n\nDetails.\n",
                valid.replace("# Example", "# " + "x".repeat(31)),
                valid.replace("# Example", "#  "),
                valid.replace("# Example\n\n", "# Example\n"),
                valid.replace(
                    `## ${structure[language][kind][0]}`,
                    `  ## ${structure[language][kind][0]}`,
                ),
                valid + "\nHidden Heading\n==============\n",
                valid + "\n<h2>Unregistered Heading</h2>\n",
                valid + "\n<div><h2>Unregistered Heading</h2></div>\n",
                valid.replace(
                    "Concrete instructions and expected behavior.",
                    "~~~txt\n\n~~~",
                ),
                valid + "\n<!-- Unclosed comment\n",
                valid + "\n~~~js\ncontent\n~~~not-a-closing-fence\n",
            ])
                assert.ok(
                    validateMarkdown(invalid, kind, language).length,
                    invalid,
                );
        });
    }
}

test("Info rejects both code fence styles while technical examples remain opaque", () => {
    for (const language of languages) {
        for (const fence of ["```", "~~~"]) {
            const example = `\n${fence}md\n# Embedded Title\n## Embedded Section\n<!-- comment example -->\n${fence}\n`;
            assert.ok(
                validateMarkdown(
                    markdown("readme", language) + example,
                    "readme",
                    language,
                ).some((issue) =>
                    issue.startsWith("README is for non-technical"),
                ),
            );
            for (const kind of ["usage", "technical"])
                assert.deepEqual(
                    validateMarkdown(
                        markdown(kind, language) + example,
                        kind,
                        language,
                    ),
                    [],
                );
        }
        assert.deepEqual(
            validateMarkdown(
                markdown("technical", language) +
                    "\n<!-- ## Commented Heading -->\n",
                "technical",
                language,
            ),
            [],
        );
        assert.deepEqual(
            validateMarkdown(
                markdown("technical", language) +
                    "\nUse `<!--` and `<h2>` as literal syntax examples.\n",
                "technical",
                language,
            ),
            [],
        );
    }
});

test("the installed module publishes a complete strictly validated bundle", () => {
    assert.deepEqual(validateBundle(root), []);
});

test("every authoring template uses the role headings and requires real content", () => {
    for (const language of languages)
        for (const [kind, name] of Object.entries(documents)) {
            const text = readFileSync(
                resolve(root, `.github/documentation/${name}.${language}.md`),
                "utf8",
            );
            assert.deepEqual(
                [...text.matchAll(/^## (.+)$/gm)].map((match) => match[1]),
                structure[language][kind],
            );
            assert.ok(
                validateMarkdown(text, kind, language).includes(
                    "Unfilled documentation template",
                ),
            );
        }
});

test("bundle validation rejects missing locales, case variants, foreign pointers and undeclared manuals", (context) => {
    const directory = mkdtempSync(resolve(tmpdir(), "cognis-module-docs-"));
    context.after(() => rmSync(directory, { recursive: true, force: true }));
    mkdirSync(resolve(directory, "docs"));
    const pointers = Object.fromEntries(
        Object.entries(documents).map(([kind, name]) => [
            kind,
            `docs/${name}.en.md`,
        ]),
    );
    const publish = (documentation = pointers) =>
        writeFileSync(
            resolve(directory, "manifest.json"),
            JSON.stringify({ documentation }),
        );
    publish();
    for (const [kind, name] of Object.entries(documents))
        for (const language of languages)
            writeFileSync(
                resolve(directory, "docs", `${name}.${language}.md`),
                markdown(kind, language),
            );
    assert.deepEqual(validateBundle(directory), []);
    for (const [kind, name] of Object.entries(documents)) {
        publish({ ...pointers, [kind]: `../foreign/${name}.en.md` });
        assert.ok(
            validateBundle(directory).some((issue) =>
                issue.startsWith(`Invalid documentation.${kind}`),
            ),
        );
        publish();
        for (const language of languages) {
            const canonical = resolve(
                directory,
                "docs",
                `${name}.${language}.md`,
            );
            rmSync(canonical);
            assert.ok(
                validateBundle(directory).some((issue) =>
                    issue.startsWith(`${name}.${language}.md:`),
                ),
            );
            writeFileSync(canonical, markdown(kind, language));
            for (const variant of [
                `${name.toLowerCase()}.${language}.md`,
                `${name}.${language}.MD`,
                `${name}.${language.toUpperCase()}.md`,
            ]) {
                const path = resolve(directory, "docs", variant);
                writeFileSync(path, markdown(kind, language));
                assert.ok(
                    validateBundle(directory).some((issue) =>
                        issue.startsWith("Unregistered document:"),
                    ),
                    variant,
                );
                rmSync(path);
            }
        }
    }
    const journal = resolve(directory, "docs", "journal.en.md");
    writeFileSync(journal, "# Journal\n");
    assert.ok(
        validateBundle(directory).some((issue) =>
            issue.startsWith("Unregistered document:"),
        ),
    );
    rmSync(journal);
    assert.deepEqual(validateBundle(directory), []);
});

test("documentation references follow current source and real owned files", () => {
    const manifest = JSON.parse(
        readFileSync(resolve(root, "manifest.json"), "utf8"),
    );
    const repository = manifest.repository.replace(/\.git$/, "");
    const check = (text) =>
        referenceIssues(text, root, repository, resolve(root, "docs"));
    assert.deepEqual(
        check(`[Source](${repository}/blob/HEAD/manifest.json)`),
        [],
    );
    assert.deepEqual(check("[Usage](USAGE.en.md)"), []);
    assert.ok(
        check(`[Source](${repository}/blob/HEAD/missing-source.js)`).length,
    );
    assert.ok(
        check(`[Source](${repository}/blob/master/manifest.json)`).length,
    );
    assert.ok(check("[Manual](missing.en.md)").length);
    assert.ok(check("[Source](%ZZ)").length);
});

test("changelog link labels use concise commit references", () => {
    const directory = resolve(root, "docs/changelog");
    if (!existsSync(directory)) return;
    for (const name of readdirSync(directory)) {
        if (!name.endsWith(".md")) continue;
        const text = readFileSync(resolve(directory, name), "utf8");
        for (const match of text.matchAll(/\[([^\]\n]+)\](?=\()/g))
            assert.doesNotMatch(match[1], /[a-f0-9]{40,}/i, name);
    }
});
