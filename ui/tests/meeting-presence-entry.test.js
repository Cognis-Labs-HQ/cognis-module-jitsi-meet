import assert from "node:assert/strict";
import test from "node:test";

const modules = {
    "api-client.js": {
        apiFetch: () =>
            assert.fail("No API request expected during event binding"),
    },
    "escape-html.js": { escapeHtml: String },
    "popup.js": { openPopup: () => assert.fail("No popup expected") },
    "value-normalizers.js": {
        resolveUrlOrigin: (value) => new URL(value).origin,
        resolveUrlHost: (value) => new URL(value).host,
        normalizeUsername: (value) =>
            String(value ?? "")
                .trim()
                .toLowerCase(),
    },
};
globalThis[Symbol.for("cognis.uiCtx")] = {
    capabilities: {
        get: (id) =>
            id === "ui:reuse"
                ? { importModule: async (path) => modules[path] }
                : undefined,
    },
};
globalThis.HTMLElement = class {};
const frame = new HTMLElement();
const storage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.localStorage = storage;
globalThis.document = {
    cookie: "",
    querySelector: (selector) =>
        selector.startsWith("script") ? { addEventListener() {} } : null,
    body: { getAttribute: () => "dark" },
    documentElement: { getAttribute: () => "dark" },
};
class JitsiApi {
    listeners = new Map();
    addEventListener(name, callback) {
        this.listeners.set(name, callback);
    }
}
globalThis.window = { JitsiMeetExternalAPI: JitsiApi, localStorage: storage };
const { createEmbedHandlers } = await import("../app/meeting-room.js");
const { createPreflightHandlers } = await import("../app/participants.js");

test("the actual conference-joined event starts recurring tracking after authentication", async (context) => {
    const interval = globalThis.setInterval;
    const timers = [];
    globalThis.setInterval = (callback, delay) => {
        timers.push({ callback, delay });
        return timers.length;
    };
    context.after(() => {
        globalThis.setInterval = interval;
    });
    const state = {
        meeting: {
            id: "meeting",
            meetingName: "Stable-Room",
            meetingUrl: "https://meet.example/Stable-Room",
            waitingForAuthentication: true,
            state: { authRequired: true },
        },
        currentProfile: {},
        heartbeatTimer: null,
        stateRefreshTimer: null,
    };
    let heartbeats = 0;
    const tracking = createPreflightHandlers({ root: {}, state });
    const handlers = createEmbedHandlers({
        root: { querySelector: () => frame },
        state,
        i18n: { t: (key) => key },
        utils: { syncShareButtonAvailability() {}, updateOverlay() {} },
        callbacks: {
            closeMeetingEmbed() {},
            renderParticipants() {},
            getParticipantId: (entry) => entry.id,
            currentUserIsJitsiModerator: () => false,
            keepPresenceAlive: async () => {
                heartbeats += 1;
            },
            ensureMeetingTracking: tracking.ensureMeetingTracking,
        },
    });
    await handlers.openMeetingEmbed();
    assert.equal(timers.length, 0);
    const api = state.jitsiApi;
    api.listeners.get("videoConferenceJoined")({ id: "local" });
    assert.equal(state.jitsiConferenceJoined, true);
    assert.equal(heartbeats, 1);
    assert.equal(timers.length, 2);
    api.listeners.get("videoConferenceJoined")({ id: "local" });
    assert.equal(timers.length, 2);
});
