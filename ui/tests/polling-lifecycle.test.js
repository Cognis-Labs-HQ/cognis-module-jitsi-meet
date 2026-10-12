import test from "node:test";
import assert from "node:assert/strict";

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
                : undefined,
    },
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
