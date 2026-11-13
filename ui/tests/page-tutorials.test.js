import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mountProvider } from "../tutorials/details-provider.js";

test("page tutorials preserve scoped publication, administrator boundaries and four-language text", async () => {
    const controller = new AbortController();
    let contribution,
        released = false;
    const ctx = {
        signal: controller.signal,
        capabilities: {
            get: (id) => {
                assert.equal(id, "ui:reuse");
                return {
                    importModule: async (path) => {
                        assert.equal(path, "tutorials/pages.js");
                        return {
                            mountTutorialProvider: async (scope, options) => {
                                assert.equal(scope, ctx);
                                contribution = options;
                                return () => {
                                    released = true;
                                };
                            },
                        };
                    },
                };
            },
        },
    };
    const dispose = await mountProvider(ctx);
    const plays = contribution.guides.flatMap((guide) => guide.definitions);
    assert.equal(plays.length, 2);
    assert.ok(
        contribution.guides
            .filter((guide) =>
                guide.definitions.some(
                    (play) => play.page === "/administration",
                ),
            )
            .every((guide) => guide.minRole === "admin"),
    );
    for (const play of plays)
        for (const step of play.steps)
            assert.equal(step.highlightNext, true, `${play.id}:${step.id}`);
    for (const locale of ["en", "de", "id", "ja"]) {
        const xml = readFileSync(
            new URL(`../languages/${locale}/strings.xml`, import.meta.url),
            "utf8",
        );
        for (const play of plays) {
            const keys = [
                play.titleKey,
                ...play.steps.flatMap((step) => [step.titleKey, step.bodyKey]),
            ];
            for (const key of keys)
                assert.ok(xml.includes(`name="${key}"`), `${locale}:${key}`);
        }
    }
    dispose();
    assert.equal(released, true);
});
