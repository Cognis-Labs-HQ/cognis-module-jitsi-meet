import test from "node:test";
import assert from "node:assert/strict";

const feedback = [];
const reuseModules = {
    "api-client.js": {
        apiFetch: () => assert.fail("Use the injected API client"),
    },
    "value-normalizers.js": {
        normalizeUsername: (value) =>
            String(value ?? "")
                .trim()
                .toLowerCase(),
    },
    "escape-html.js": { escapeHtml: (value) => String(value ?? "") },
    "popup.js": { openPopup: () => assert.fail("No popup expected") },
};
globalThis[Symbol.for("cognis.uiCtx")] = {
    capabilities: {
        get: (capabilityId) =>
            capabilityId === "ui:reuse"
                ? {
                      async importModule(path) {
                          assert.ok(Object.hasOwn(reuseModules, path), path);
                          return reuseModules[path];
                      },
                  }
                : capabilityId === "ui:log" || capabilityId === "ui:showToast"
                  ? (...args) => feedback.push(args)
                  : undefined,
    },
};
globalThis.window = {
    location: { href: "http://localhost/meetings" },
    history: { replaceState() {} },
};
globalThis.HTMLElement = class {};
globalThis.HTMLButtonElement = class extends HTMLElement {};
const { createPreflightHandlers } = await import("../app/participants.js");
const { createMeetingHandlers } = await import("../app/meetings-list.js");

function deferred() {
    let resolve;
    const promise = new Promise((complete) => {
        resolve = complete;
    });
    return { promise, resolve };
}

for (const change of ["switch", "abort"]) {
    for (const status of [
        { endedAt: "2026-10-12" },
        { sessionActive: false },
    ]) {
        test(`late state response cannot reset a meeting after ${change}: ${JSON.stringify(status)}`, async () => {
            const pending = deferred();
            const controller = new AbortController();
            const state = { meeting: { id: "old-meeting" } };
            let resets = 0;
            const handlers = createPreflightHandlers({
                root: {},
                state,
                signal: controller.signal,
                apiFetch: () => pending.promise,
                callbacks: {
                    resetMeetingState: async () => {
                        resets += 1;
                    },
                },
            });
            const polling = handlers.loadMeetingState();
            if (change === "switch") state.meeting = { id: "new-meeting" };
            else controller.abort();
            pending.resolve({
                ok: true,
                json: async () => ({ data: { state: status, ...status } }),
            });
            await polling;
            assert.equal(resets, 0);
        });
    }
}

test("a superseded persisted response cannot overwrite newer lists while its body is loading", async () => {
    const oldBody = deferred();
    const bodyStarted = deferred();
    const state = { activeMeetings: [], persistedMeetings: [] };
    let requests = 0;
    const handlers = createMeetingHandlers({
        root: { querySelector: () => null },
        state,
        callbacks: {},
        utils: {},
        apiFetch: async () => {
            requests += 1;
            return {
                ok: true,
                json:
                    requests === 2
                        ? async () => {
                              bodyStarted.resolve();
                              return oldBody.promise;
                          }
                        : async () => ({
                              data: requests > 2 ? [{ id: "new-meeting" }] : [],
                          }),
            };
        },
    });
    const older = handlers.loadActiveMeetings({ resolveRequested: false });
    await bodyStarted.promise;
    await handlers.loadActiveMeetings({ resolveRequested: false });
    oldBody.resolve({ data: [{ id: "old-meeting" }] });
    await older;
    assert.deepEqual(state.persistedMeetings, [{ id: "new-meeting" }]);
    assert.deepEqual(state.activeMeetings, [{ id: "new-meeting" }]);
});

for (const outcome of ["auth", "failure", "cancel"]) {
    test(`meeting selection cannot replace an in-flight join: ${outcome}`, async () => {
        const pending = deferred();
        const state = {
            meeting: null,
            activeMeetings: [],
            persistedMeetings: [],
            allParticipants: [],
            selectedParticipants: [],
        };
        let requests = 0;
        const handlers = createMeetingHandlers({
            root: { querySelector: () => null },
            state,
            allowParticipantlessJoin: true,
            utils: { isMeetingActive: () => false, updateOverlay() {} },
            i18n: { t: (key) => key },
            callbacks: {
                renderParticipants() {},
                updateCognisChat: async () => {},
                joinMeeting: async () => ({ trackingAllowed: false }),
            },
            apiFetch: () => {
                requests += 1;
                return pending.promise;
            },
        });
        const joining = handlers.joinMeetingById("first");
        await handlers.joinMeetingById("second");
        assert.equal(requests, 1);
        if (outcome === "cancel") state.meetingTransition = null;
        pending.resolve({
            ok: true,
            json: async () => ({
                data:
                    outcome === "failure"
                        ? null
                        : {
                              id: "first",
                              participants: [],
                              state: { authRequired: true },
                          },
            }),
        });
        await joining;
        assert.equal(state.meetingTransition, null);
        if (outcome === "auth") {
            await handlers.joinMeetingById("second");
            assert.equal(requests, 1);
            assert.equal(state.meeting.id, "first");
        } else assert.equal(state.meeting, null);
    });
}

test("failed meeting discovery stops polling and preserves previous results", async (context) => {
    const originalSetInterval = globalThis.setInterval;
    const originalClearInterval = globalThis.clearInterval;
    let timerCreated = 0;
    let timerCleared = 0;
    globalThis.setInterval = () => ++timerCreated;
    globalThis.clearInterval = () => {
        timerCleared += 1;
    };
    context.after(() => {
        globalThis.setInterval = originalSetInterval;
        globalThis.clearInterval = originalClearInterval;
    });
    const state = {
        activeMeetings: [{ id: "known-active" }],
        persistedMeetings: [{ id: "known-persisted" }],
        activeMeetingsRefreshTimer: null,
    };
    const handlers = createMeetingHandlers({
        root: { querySelector: () => null },
        state,
        callbacks: {},
        utils: {},
        i18n: { t: (key) => key },
        apiFetch: async () => ({ ok: false, status: 400 }),
    });
    handlers.startActiveMeetingsPolling();
    await handlers.loadActiveMeetings({ resolveRequested: false });
    handlers.startActiveMeetingsPolling();
    assert.equal(timerCreated, 1);
    assert.equal(timerCleared, 1);
    assert.deepEqual(state.activeMeetings, [{ id: "known-active" }]);
    assert.deepEqual(state.persistedMeetings, [{ id: "known-persisted" }]);
    assert.ok(
        feedback.some(
            ([message]) => message === "module.jitsi_meet.meetings.load.failed",
        ),
    );
});

function alonePromptFixture({
    joined = true,
    participants = ["alice"],
    profile = { handle: "alice" },
} = {}) {
    const state = {
        meeting: { id: "meeting", participants, state: {} },
        currentProfile: profile,
        jitsiConferenceJoined: joined,
        alonePromptBlockedUntil: 0,
        alonePromptMeetingId: "",
        alonePromptDismissedMeetingId: "",
    };
    const presentations = [];
    const utils = {
        isMeetingActive: () => true,
        updateOverlay: (input) => presentations.push(input),
    };
    const handlers = createMeetingHandlers({
        root: {},
        state,
        callbacks: {},
        utils,
        i18n: { t: (key) => key },
    });
    return { state, utils, handlers, presentations };
}

for (const participants of [[], ["alice"], ["alice", "bob"]]) {
    test(`confirmed lone participant gets the prompt with ${participants.length} membership records`, () => {
        const { handlers, presentations } = alonePromptFixture({
            participants,
        });
        assert.equal(
            handlers.updateAloneParticipantPrompt(["Alice", "alice"]),
            true,
        );
        assert.equal(presentations.at(-1).visible, true);
        assert.equal(presentations.at(-1).showAlonePrompt, true);
        assert.equal(presentations.at(-1).showAuth, false);
        assert.equal(presentations.at(-1).canStart, false);
    });
}

test("alone prompt respects confirmed entry, the grace period, dismissal and returning participants", () => {
    const { state, handlers, presentations } = alonePromptFixture({
        joined: false,
    });
    assert.equal(handlers.updateAloneParticipantPrompt(["alice"]), false);
    assert.equal(presentations.length, 0);
    state.jitsiConferenceJoined = true;
    state.alonePromptBlockedUntil = Date.now() + 60000;
    assert.equal(handlers.updateAloneParticipantPrompt(["alice"]), false);
    state.alonePromptBlockedUntil = 0;
    assert.equal(handlers.updateAloneParticipantPrompt(["alice"]), true);
    state.alonePromptDismissedMeetingId = "meeting";
    assert.equal(handlers.updateAloneParticipantPrompt(["alice"]), false);
    assert.equal(presentations.at(-1).visible, false);
    handlers.updateAloneParticipantPrompt(["alice", "bob"]);
    assert.equal(state.alonePromptDismissedMeetingId, "");
    assert.equal(handlers.updateAloneParticipantPrompt(["alice"]), true);
    assert.equal(
        handlers.updateAloneParticipantPrompt(["alice", "bob"]),
        false,
    );
    assert.equal(presentations.at(-1).visible, false);
});

test("alone prompt uses the local username fallback and never prompts for another account", () => {
    const { handlers } = alonePromptFixture({ profile: { username: "alice" } });
    assert.equal(handlers.shouldPromptLocalUserAlone(["bob"]), false);
    assert.equal(handlers.shouldPromptLocalUserAlone([]), false);
    assert.equal(handlers.shouldPromptLocalUserAlone(["alice"]), true);
});

for (const auth of [
    { authRequired: true },
    { authCompletedAt: "2026-10-14T00:00:00Z" },
]) {
    test(`confirmed conference polling keeps the alone prompt ahead of stale auth state ${JSON.stringify(auth)}`, async () => {
        const { state, handlers, presentations, utils } = alonePromptFixture();
        const polling = createPreflightHandlers({
            root: {},
            state,
            utils,
            i18n: { t: (key) => key },
            apiFetch: async () => ({
                ok: true,
                json: async () => ({
                    data: { state: auth, activeParticipants: ["alice"] },
                }),
            }),
            callbacks: {
                updateAloneParticipantPrompt:
                    handlers.updateAloneParticipantPrompt,
            },
        });
        await polling.loadMeetingState();
        assert.equal(presentations.length, 1);
        assert.equal(presentations[0].showAlonePrompt, true);
        assert.equal(presentations[0].showAuth, false);
    });
}
