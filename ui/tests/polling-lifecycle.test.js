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

test("confirmed entry resumes heartbeat and state polling despite stale authentication flags", (context) => {
    const originalInterval = globalThis.setInterval;
    const scheduled = [];
    globalThis.setInterval = (callback, delay) => {
        scheduled.push({ callback, delay });
        return scheduled.length;
    };
    context.after(() => {
        globalThis.setInterval = originalInterval;
    });
    const state = {
        meeting: {
            id: "same-meeting",
            waitingForAuthentication: true,
            state: { authRequired: true },
        },
        jitsiConferenceJoined: true,
        heartbeatTimer: null,
        stateRefreshTimer: null,
    };
    const handlers = createPreflightHandlers({
        root: {},
        state,
        callbacks: {},
        utils: {},
    });
    handlers.ensureMeetingTracking();
    handlers.ensureMeetingTracking();
    assert.equal(scheduled.length, 2);
    assert.notEqual(state.heartbeatTimer, null);
    assert.notEqual(state.stateRefreshTimer, null);
});

test("an available-meeting join cannot accept a different ID or start a replacement", async () => {
    let joins = 0;
    const requests = [];
    const state = {
        meeting: null,
        activeMeetings: [],
        persistedMeetings: [],
        allParticipants: [],
        selectedParticipants: [],
    };
    const handlers = createMeetingHandlers({
        root: { querySelector: () => null },
        state,
        allowParticipantlessJoin: true,
        i18n: { t: (key) => key },
        utils: { isMeetingActive: () => false, updateOverlay() {} },
        callbacks: {
            joinMeeting: async () => {
                joins += 1;
            },
        },
        apiFetch: async (url, init) => {
            requests.push({ url, input: JSON.parse(init.body) });
            return {
                ok: true,
                json: async () => ({ data: { id: "different-meeting" } }),
            };
        },
    });
    await handlers.joinMeetingById("selected-meeting");
    assert.equal(joins, 0);
    assert.equal(state.meeting, null);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].input.meetingId, "selected-meeting");
    assert.ok(!requests[0].url.endsWith("/create"));
});

test("authorized authentication wait keeps its existing meeting alive and joins that ID on completion", async (context) => {
    const originalInterval = globalThis.setInterval;
    const timers = [];
    globalThis.setInterval = (callback) => {
        timers.push(callback);
        return timers.length;
    };
    context.after(() => {
        globalThis.setInterval = originalInterval;
    });
    const state = {
        meeting: {
            id: "existing",
            waitingForAuthentication: true,
            state: { authRequired: true },
        },
        heartbeatTimer: null,
        stateRefreshTimer: null,
    };
    const joined = [];
    const handlers = createPreflightHandlers({
        root: {},
        state,
        i18n: { t: (key) => key },
        utils: {},
        apiFetch: async () => ({
            ok: true,
            json: async () => ({
                data: { state: { authCompletedAt: "2026-10-14T00:00:00Z" } },
            }),
        }),
        callbacks: {
            joinMeeting: async () => {
                joined.push(state.meeting.id);
                return { trackingAllowed: true };
            },
        },
    });
    handlers.ensureMeetingTracking({ pendingAuthentication: true });
    assert.equal(timers.length, 2);
    await handlers.loadMeetingState();
    assert.deepEqual(joined, ["existing"]);
    assert.equal(state.meeting.waitingForAuthentication, false);
    assert.equal(timers.length, 2);
});

test("an explicit deleted meeting selection recreates its known participant set and joins the canonical replacement", async () => {
    const calls = [];
    const joined = [];
    const state = {
        currentProfile: { handle: "alice" },
        meeting: null,
        activeMeetings: [],
        persistedMeetings: [
            {
                id: "deleted",
                participants: [{ username: "alice" }, { username: "bob" }],
            },
        ],
        allParticipants: [],
        selectedParticipants: [],
    };
    const handlers = createMeetingHandlers({
        root: { querySelector: () => null },
        state,
        i18n: { t: (key) => key },
        utils: { isMeetingActive: () => false, updateOverlay() {} },
        callbacks: {
            renderParticipants() {},
            updateCognisChat: async () => {},
            joinMeeting: async () => {
                joined.push(state.meeting.id);
                return { trackingAllowed: false };
            },
        },
        apiFetch: async (url, options) => {
            calls.push({ url, input: JSON.parse(options.body) });
            return url.endsWith("/get")
                ? Response.json(
                      { error: { code: "not_found" } },
                      { status: 404 },
                  )
                : Response.json({
                      data: {
                          id: "replacement",
                          participants: ["alice", "bob"],
                          state: {},
                      },
                  });
        },
    });
    await handlers.joinMeetingById("deleted");
    assert.deepEqual(joined, ["replacement"]);
    assert.deepEqual(calls[1].input, {
        participants: ["alice", "bob"],
        disposable: false,
    });
    assert.equal(calls.length, 2);
});

for (const status of [403, 503]) {
    test(`meeting recovery never recreates a ${status} failure`, async () => {
        let requests = 0;
        const state = {
            currentProfile: { handle: "alice" },
            meeting: null,
            activeMeetings: [],
            persistedMeetings: [
                { id: "known", participants: ["alice", "bob"] },
            ],
            allParticipants: [],
            selectedParticipants: [],
        };
        const handlers = createMeetingHandlers({
            root: { querySelector: () => null },
            state,
            i18n: { t: (key) => key },
            utils: { isMeetingActive: () => false, updateOverlay() {} },
            callbacks: {},
            apiFetch: async () => {
                requests += 1;
                return Response.json(
                    { error: { code: "forbidden" } },
                    { status },
                );
            },
        });
        await handlers.joinMeetingById("known");
        assert.equal(requests, 1);
    });
}

for (const outcome of ["failure", "success", "abort-rejection"]) {
    test(`leaving a direct Meetings page cancels polling and ignores late ${outcome}`, async (context) => {
        const { createDirectMountController } =
            await import("../app/route-root.js");
        const target = new EventTarget();
        const controller = createDirectMountController(target);
        const originalInterval = globalThis.setInterval;
        const originalClear = globalThis.clearInterval;
        let scheduled = 0;
        let cleared = 0;
        globalThis.setInterval = () => ++scheduled;
        globalThis.clearInterval = () => cleared++;
        context.after(() => {
            globalThis.setInterval = originalInterval;
            globalThis.clearInterval = originalClear;
        });
        let resolve;
        let reject;
        const pending = new Promise((complete, fail) => {
            resolve = complete;
            reject = fail;
        });
        const state = {
            activeMeetings: [{ id: "known" }],
            persistedMeetings: [],
            activeMeetingsRefreshTimer: null,
        };
        let requests = 0;
        const handlers = createMeetingHandlers({
            root: {
                querySelector: () =>
                    assert.fail("Detached DOM must not be touched"),
            },
            signal: controller.signal,
            state,
            callbacks: {},
            utils: {},
            i18n: { t: (key) => key },
            apiFetch: (_, options) => {
                assert.equal(options.signal, controller.signal);
                requests++;
                return pending;
            },
        });
        handlers.startActiveMeetingsPolling();
        const loading = handlers.loadActiveMeetings({
            resolveRequested: false,
        });
        const feedbackCount = feedback.length;
        target.dispatchEvent(new Event("cognis:route-will-change"));
        if (outcome === "abort-rejection")
            reject(new DOMException("Aborted", "AbortError"));
        else
            resolve(
                Response.json(
                    { data: [{ id: "late" }] },
                    { status: outcome === "failure" ? 400 : 200 },
                ),
            );
        await loading;
        handlers.startActiveMeetingsPolling();
        await handlers.loadActiveMeetings();
        assert.equal(scheduled, 1);
        assert.equal(cleared, 1);
        assert.equal(state.activeMeetingsRefreshTimer, null);
        assert.equal(requests, 2);
        assert.equal(feedback.length, feedbackCount);
        assert.deepEqual(state.activeMeetings, [{ id: "known" }]);
    });
}

test("a preflight failure arriving after page disposal cannot show feedback", async () => {
    const controller = new AbortController();
    const pending = deferred();
    const presentations = [];
    const state = {};
    const handlers = createPreflightHandlers({
        root: { querySelector: () => assert.fail("Detached page") },
        signal: controller.signal,
        state,
        callbacks: {},
        i18n: { t: (key) => key },
        utils: { setPreflightStatus: (...args) => presentations.push(args) },
        apiFetch: () => pending.promise,
    });
    const running = handlers.runPreflightCheck({ showErrors: true });
    const feedbackCount = feedback.length;
    controller.abort();
    pending.resolve({ ok: false, status: 400 });
    assert.equal(await running, false);
    assert.equal(await handlers.runPreflightCheck({ showErrors: true }), false);
    assert.equal(presentations.length, 1);
    assert.equal(feedback.length, feedbackCount);
});
