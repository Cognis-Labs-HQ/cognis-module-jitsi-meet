import test from "node:test";
import assert from "node:assert/strict";
import { createCollapsibleSectionComposer } from "./reuse/admin-disclosure.js";
import { createMeetingAdminTemplates } from "../templates/admin-meetings.js";

const i18n = { t: (key) => key };
const templates = createMeetingAdminTemplates({
    i18n,
    escapeHtml: String,
    formatDateTime: String,
    createCollapsibleSectionComposer,
});
for (const filter of ["active", "all", "issues"]) {
    test(`${filter} meeting filter has its own empty message`, () => {
        assert.match(
            templates.renderRows([], filter),
            new RegExp(`meetings.empty.${filter}`),
        );
    });
}

globalThis.HTMLElement = class {};

class Table extends HTMLElement {
    innerHTML = "";
    openReferences = new Set();
    querySelectorAll() {
        return [...this.openReferences].map((id) => ({
            dataset: { meetingReference: id },
        }));
    }
}
class Root extends HTMLElement {
    isConnected = true;
    table = new Table();
    querySelector() {
        return this.table;
    }
    querySelectorAll() {
        return [];
    }
    contains() {
        return true;
    }
}
const activeRoot = new Root();
const upcomingRoot = new Root();
globalThis.document = {
    querySelector: (selector) =>
        selector.includes("upcoming") ? upcomingRoot : activeRoot,
};
let rows = [
    { id: "meeting", chatRoomId: "chat", participantCount: 1, active: true },
];
const upcomingResponses = [];
const reuse = {
    "timestamp.js": { formatDateTime: String },
    "popup.js": { openPopup: () => assert.fail("No popup expected") },
    "page-styles.js": { ensurePageStylesheet: async () => {} },
    "collapsible-section-composer.js": { createCollapsibleSectionComposer },
};
globalThis[Symbol.for("cognis.uiCtx")] = {
    capabilities: {
        get: (id) =>
            id === "ui:reuse"
                ? { importModule: async (path) => reuse[path] }
                : id === "jitsi-meet:administration"
                  ? {
                        listAdminMeetings: async () => rows,
                        listUpcomingAdminMeetings: async () =>
                            upcomingResponses.length
                                ? upcomingResponses.shift()
                                : rows,
                    }
                  : () => assert.fail("No feedback expected"),
    },
};
const { createAdminSection } = await import("../admin-meetings-section.js");
const settle = () => new Promise((resolve) => setImmediate(resolve));

test("polling preserves expanded References in both meeting tables and releases handlers", async (context) => {
    const originalInterval = globalThis.setInterval;
    const originalClear = globalThis.clearInterval;
    const timers = new Map();
    globalThis.setInterval = (callback) => {
        const id = timers.size + 1;
        timers.set(id, callback);
        return id;
    };
    globalThis.clearInterval = (id) => timers.delete(id);
    context.after(() => {
        globalThis.setInterval = originalInterval;
        globalThis.clearInterval = originalClear;
    });
    const section = createAdminSection({ i18n, escapeHtml: String });
    section.subComposerOptions.onRender();
    await settle();
    activeRoot.table.openReferences.add("meeting");
    upcomingRoot.table.openReferences.add("meeting");
    rows = [{ ...rows[0], participantCount: 2 }];
    for (const poll of timers.values()) poll();
    await settle();
    for (const root of [activeRoot, upcomingRoot]) {
        assert.match(
            root.table.innerHTML,
            /data-meeting-reference="meeting" open/,
        );
        assert.match(root.table.innerHTML, /collapsible-section-summary/);
    }
    const details = { open: true };
    const toggle = { closest: () => details };
    let prevented = false;
    activeRoot.onkeydown({
        key: "Enter",
        target: { closest: () => toggle },
        preventDefault: () => {
            prevented = true;
        },
    });
    assert.equal(details.open, false);
    assert.equal(prevented, true);
    section.subComposerOptions.onUnmount();
    assert.equal(timers.size, 0);
    assert.equal(activeRoot.onclick, null);
    assert.equal(upcomingRoot.onkeydown, null);
});

test("an older upcoming-meeting poll cannot overwrite newer schedules", async (context) => {
    const originalInterval = globalThis.setInterval;
    const originalClear = globalThis.clearInterval;
    const polls = [];
    globalThis.setInterval = (callback) => {
        polls.push(callback);
        return polls.length;
    };
    globalThis.clearInterval = () => {};
    context.after(() => {
        globalThis.setInterval = originalInterval;
        globalThis.clearInterval = originalClear;
    });
    const section = createAdminSection({ i18n, escapeHtml: String });
    section.subComposerOptions.onRender();
    await settle();
    let resolveOld;
    let resolveNew;
    upcomingResponses.push(
        new Promise((resolve) => {
            resolveOld = resolve;
        }),
        new Promise((resolve) => {
            resolveNew = resolve;
        }),
    );
    polls[1]();
    polls[1]();
    resolveNew([{ ...rows[0], id: "latest" }]);
    await settle();
    const markup = upcomingRoot.table.innerHTML;
    assert.match(markup, /latest/);
    resolveOld([{ ...rows[0], id: "superseded" }]);
    await settle();
    assert.equal(upcomingRoot.table.innerHTML, markup);
    section.subComposerOptions.onUnmount();
});
