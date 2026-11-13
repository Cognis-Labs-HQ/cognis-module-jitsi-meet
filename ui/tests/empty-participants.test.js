import assert from "node:assert/strict";
import test from "node:test";

const resources = {
    "api-client.js": {},
    "popup.js": {},
    "value-normalizers.js": { normalizeUsername: String },
    "escape-html.js": { escapeHtml: String },
};
globalThis[Symbol.for("cognis.uiCtx")] = {
    capabilities: {
        get(id) {
            if (id === "ui:reuse")
                return { importModule: async (path) => resources[path] };
            if (id === "ui:profileAvatarRenderer")
                return { hydrate: async () => {} };
            if (id === "ui:log") return () => {};
        },
    },
};
class Element {
    children = [];
    disabled = false;
    classList = { toggle() {} };
    replaceChildren(...children) {
        this.children = children;
    }
}
globalThis.HTMLElement = Element;
globalThis.HTMLButtonElement = class extends Element {};
globalThis.window = new EventTarget();
globalThis.document = { createElement: () => new Element() };
const { createPreflightHandlers } = await import("../app/participants.js");

for (const alive of [true, false]) {
    test(`empty participants retain the finder and update Start after preflight (${alive})`, async () => {
        const pool = new Element();
        const finder = new HTMLButtonElement();
        pool.children = [finder];
        const controls = new Map([
            ["#jitsi-available-participants", pool],
            ["#jitsi-find-participants-btn", finder],
            ["#jitsi-staged-participants", new Element()],
            [".jitsi-participants-pane", new Element()],
        ]);
        const root = {
            querySelector: (selector) =>
                selector === "#jitsi-find-participants-btn"
                    ? pool.children.includes(finder)
                        ? finder
                        : null
                    : controls.get(selector),
        };
        const state = {
            availableParticipants: [],
            selectedParticipants: [],
            preflightPassed: false,
        };
        const overlays = [];
        const controller = new AbortController();
        const handlers = createPreflightHandlers({
            root,
            state,
            signal: controller.signal,
            i18n: { t: (key) => key },
            apiFetch: async () => Response.json({ data: { alive } }),
            callbacks: {
                lobbyMessageKey: () =>
                    "module.jitsi.meet.overlay.select.participants",
                renderActiveMeetings() {},
            },
            utils: {
                isMeetingActive: () => false,
                updateOverlay: (options) => overlays.push(options),
                setPreflightStatus: (status) => {
                    state.preflightStatus = status;
                    state.preflightPassed = status === "passed";
                },
            },
        });
        handlers.renderParticipants();
        assert.equal(overlays.at(-1).canStart, false);
        assert.equal(await handlers.runPreflightCheck(), alive);
        assert.equal(overlays.at(-1).canStart, alive);
        assert.equal(
            root.querySelector("#jitsi-find-participants-btn"),
            finder,
        );
        handlers.renderParticipants();
        assert.equal(overlays.at(-1).canStart, alive);
        assert.equal(finder.disabled, false);
        assert.equal(pool.children.length, 2);
        controller.abort();
    });
}
