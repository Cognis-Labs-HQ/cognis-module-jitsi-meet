import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const LANGUAGES = ["de", "en", "id", "ja"];

function parseStrings(language) {
    const xml = readFileSync(
        resolve(ROOT, `ui/languages/${language}/strings.xml`),
        "utf8",
    );
    return new Map(
        [...xml.matchAll(/<string name="([^"]+)">([^<]*)<\/string>/g)].map(
            (match) => [match[1], match[2]],
        ),
    );
}

test("Prettier configuration matches the complete Cognis standard", () => {
    const configuration = JSON.parse(
        readFileSync(resolve(ROOT, ".prettierrc"), "utf8"),
    );
    assert.deepEqual(configuration, {
        tabWidth: 4,
        trailingComma: "all",
    });
    const lintScript = readFileSync(
        resolve(ROOT, "tooling/scripts/lint-placeholder.mjs"),
        "utf8",
    );
    assert.match(lintScript, /prettier --check \./);
});

test("manifest UI metadata uses localized strings", () => {
    const manifest = JSON.parse(
        readFileSync(resolve(ROOT, "manifest.json"), "utf8"),
    );
    assert.equal(
        manifest.ui.stringsBaseUrl,
        "/static/modules/jitsi-meet/languages",
    );
    for (const preference of manifest.ui.preferences) {
        assert.equal(typeof preference.labelKey, "string");
        assert.equal(typeof preference.descriptionKey, "string");
        assert.equal("label" in preference, false);
        assert.equal("description" in preference, false);
        for (const language of LANGUAGES) {
            const strings = parseStrings(language);
            assert.ok(strings.has(preference.labelKey));
            assert.ok(strings.has(preference.descriptionKey));
        }
    }
});

test("localized resources keep matching key sets", () => {
    const englishKeys = [...parseStrings("en").keys()].sort();
    for (const language of LANGUAGES.filter((entry) => entry !== "en")) {
        assert.deepEqual(
            [...parseStrings(language).keys()].sort(),
            englishKeys,
        );
    }
});

test("English titles use Title Case", () => {
    const violations = [];
    for (const [key, value] of parseStrings("en")) {
        if (!key.endsWith(".title") && !key.endsWith("page_title")) continue;
        const words = value.split(/\s+/).filter(Boolean);
        const isTitleCase = words.every((word) => {
            const stripped = word
                .replace(/^[^A-Za-z]*/, "")
                .replace(/[^A-Za-z]*$/, "");
            return !stripped || stripped[0] === stripped[0].toUpperCase();
        });
        if (!isTitleCase) violations.push(`${key}: ${value}`);
    }
    assert.deepEqual(violations, []);
});

test("browser code uses host clients for gateway-owned data", () => {
    for (const file of ["app.js", "jitsi-chat.js", "jitsi-helpers.js"]) {
        const source = readFileSync(resolve(ROOT, "ui", file), "utf8");
        assert.doesNotMatch(source, /\/api\/v1\/(?:social|files|share)\//);
    }
});
