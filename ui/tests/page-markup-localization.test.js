import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

globalThis[Symbol.for("cognis.uiCtx")] = {
    capabilities: {
        get: (name) => {
            assert.equal(name, "ui:reuse");
            return {
                importModule: async (path) => {
                    assert.equal(path, "escape-html.js");
                    return { escapeHtml: (value) => String(value) };
                },
            };
        },
    },
};
const { createMeetingPageElements } = await import("../page-elements.js");

function catalog(locale) {
    const xml = readFileSync(
        new URL(`../languages/${locale}/strings.xml`, import.meta.url),
        "utf8",
    );
    return new Map(
        [...xml.matchAll(/<string name="([^"]+)">([^<]*)<\/string>/g)].map(
            (match) => [match[1], match[2]],
        ),
    );
}

test("meeting page elements render with every real module locale", () => {
    for (const locale of ["en", "de", "id", "ja"]) {
        const strings = catalog(locale);
        const i18n = {
            t(key) {
                if (key.startsWith("ui.reuse.")) return key;
                const value = strings.get(key);
                assert.ok(
                    value?.trim(),
                    `missing_translation:${locale}:${key}`,
                );
                return value;
            },
        };
        for (const shareView of [false, true]) {
            const elements = createMeetingPageElements(i18n, shareView);
            const markup = elements.map((element) => element.render()).join("");
            assert.ok(
                markup.includes(
                    strings.get("module.jitsi_meet.overlay.authenticate"),
                ),
            );
            assert.match(markup, /id="jitsi-auth-btn"/);
        }
    }
});

test("meeting rendering propagates a missing authentication translation", () => {
    const strings = catalog("en");
    const key = "module.jitsi_meet.overlay.authenticate";
    strings.delete(key);
    const i18n = {
        t(name) {
            if (name === key) throw new Error(`missing_translation:${name}`);
            return strings.get(name) ?? name;
        },
    };
    const stage = createMeetingPageElements(i18n, true).find(
        (element) => element.id === "jitsi-stage",
    );
    assert.throws(() => stage.render(), {
        message: `missing_translation:${key}`,
    });
});
