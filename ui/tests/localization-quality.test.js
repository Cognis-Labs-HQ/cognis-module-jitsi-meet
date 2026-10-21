import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createMeetingAdminTemplates } from "../templates/admin-meetings.js";
import { createCollapsibleSectionComposer } from "./reuse/admin-disclosure.js";

const ROOT = resolve(import.meta.dirname, "../..");
const LANGUAGES = ["de", "en", "id", "ja"];

function strings(language) {
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

function sourceFiles(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        if (entry.name === "tests") return [];
        const path = resolve(directory, entry.name);
        return entry.isDirectory()
            ? sourceFiles(path)
            : entry.name.endsWith(".js")
              ? [path]
              : [];
    });
}

test("module string references and manifest labels exist in every locale", () => {
    const files = ["ui", "api", "cli"].flatMap((directory) => {
        const path = resolve(ROOT, directory);
        return existsSync(path) ? sourceFiles(path) : [];
    });
    files.push(resolve(ROOT, "manifest.json"));
    const references = new Set(
        files.flatMap((path) =>
            [
                ...readFileSync(path, "utf8").matchAll(
                    /["'](module\.jitsi_meet\.[a-z0-9_.-]+)["']/g,
                ),
            ].map((match) => match[1]),
        ),
    );
    assert.ok(references.size > 0);
    for (const language of LANGUAGES) {
        const catalog = strings(language);
        for (const key of references)
            assert.ok(
                catalog.get(key)?.trim(),
                `missing_translation:${language}:${key}`,
            );
    }
});

test("administration dynamic labels render against every real locale", () => {
    for (const language of LANGUAGES) {
        const catalog = strings(language);
        const i18n = {
            t(key) {
                if (key.startsWith("ui.reuse.")) return key;
                const value = catalog.get(key);
                assert.ok(
                    value?.trim(),
                    `missing_translation:${language}:${key}`,
                );
                return value;
            },
        };
        const templates = createMeetingAdminTemplates({
            i18n,
            escapeHtml: String,
            formatDateTime: String,
            createCollapsibleSectionComposer,
        });
        for (const filter of ["active", "all", "issues"]) {
            assert.ok(templates.renderPanel(filter));
            assert.ok(templates.renderRows([], filter));
        }
        const row = {
            id: "meeting",
            meetingName: "Meeting",
            meetingUrl: "https://meet.example/room",
            chatRoomId: "chat",
            whiteboardId: "canvas",
            participantCount: 2,
            issues: [
                "duplicateParticipants",
                "duplicateUrl",
                "sharedChatroom",
                "sharedWhiteboard",
            ],
        };
        for (const active of [false, true])
            assert.ok(templates.renderRows([{ ...row, active }]));
        assert.ok(templates.renderUpcomingRows([]));
        assert.ok(templates.renderUpcomingRows([row]));
        for (const action of ["terminate", "delete"])
            for (const kind of ["action", "confirm"])
                assert.ok(i18n.t(`module.jitsi_meet.admin.${kind}.${action}`));
    }
});

test("localized resources keep matching key sets", () => {
    const englishKeys = [...strings("en").keys()].sort();
    for (const language of LANGUAGES.filter((entry) => entry !== "en")) {
        assert.deepEqual([...strings(language).keys()].sort(), englishKeys);
    }
});

test("manifest preference localization keys exist in every language", () => {
    const manifest = JSON.parse(
        readFileSync(resolve(ROOT, "manifest.json"), "utf8"),
    );
    for (const preference of manifest.ui.preferences) {
        for (const language of LANGUAGES) {
            assert.ok(strings(language).has(preference.labelKey));
            assert.ok(strings(language).has(preference.descriptionKey));
        }
    }
});

test("manifest publishes the module locale bundle location", () => {
    const manifest = JSON.parse(
        readFileSync(resolve(ROOT, "manifest.json"), "utf8"),
    );
    assert.equal(
        manifest.ui?.stringsBaseUrl,
        "/static/modules/jitsi-meet/languages",
    );
});

test("English titles use Title Case", () => {
    const violations = [];
    for (const [key, value] of strings("en")) {
        if (!key.endsWith(".title") && !key.endsWith("page_title")) continue;
        const valid = value
            .split(/\s+/)
            .filter(Boolean)
            .every((word) => {
                const text = word
                    .replace(/^[^A-Za-z]*/, "")
                    .replace(/[^A-Za-z]*$/, "");
                return !text || text[0] === text[0].toUpperCase();
            });
        if (!valid) violations.push(`${key}: ${value}`);
    }
    assert.deepEqual(violations, []);
});
