import assert from "node:assert/strict";
import test from "node:test";
import { createRuntime } from "../../api/tests/reuse/guest-admission-fixture.js";
import { createMeetingPayload } from "../../api/reuse/meeting-access.js";

let apiFetch;
const resources = {
    "api-client.js": { apiFetch: (...args) => apiFetch(...args) },
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
globalThis.window = new EventTarget();
const { loadMessageUiResources } = await import("../jitsi-helpers.js");
const { resolveWhiteboardServerContract } =
    await import("../whiteboard-provider.js");
const { createPreflightHandlers } = await import("../app/participants.js");

test("guest bootstrap and Whiteboard discovery use their registered target-authorized routes", async () => {
    const runtime = createRuntime();
    runtime.capabilities.set("whiteboard:fetchBoardData", async () => ({}));
    runtime.capabilities.set("whiteboard:sourceBinding", {
        bind() {},
        release() {},
    });
    const calls = [];
    apiFetch = async (path, options = {}) => {
        const url = new URL(path, "http://localhost");
        assert.ok(!path.includes("synthetic-guest-token"));
        calls.push({ path, options });
        const response = await runtime.request(
            "get",
            url.pathname.replace("/api/v1/modules/jitsi-meet", ""),
            {
                guest: options.accessToken === "synthetic-guest-token",
                meetingId: url.searchParams.get("meetingId"),
            },
        );
        return Response.json(response.body, { status: response.status });
    };
    const options = {
        meetingId: "meeting-1",
        accessToken: "synthetic-guest-token",
    };
    const uiResources = await loadMessageUiResources(options);
    assert.deepEqual(uiResources.languageBaseUrls, [
        "/static/modules/jitsi-meet/languages",
    ]);
    assert.equal(
        (await resolveWhiteboardServerContract(apiFetch, undefined, options))
            .available,
        true,
    );
    assert.equal(calls.length, 2);
    assert.equal(runtime.state.requests.length, 2);
    assert.ok(
        runtime.state.requests.every(
            (entry) =>
                entry.resourceId === "meeting-1" &&
                entry.requiredCapability === "meeting:join",
        ),
    );
    assert.equal(
        (
            await resolveWhiteboardServerContract(apiFetch, undefined, {
                ...options,
                meetingId: "other",
            })
        ).available,
        false,
    );
    runtime.state.grant = false;
    assert.equal(
        (await resolveWhiteboardServerContract(apiFetch, undefined, options))
            .available,
        false,
    );
});

test("the guest mount's final preflight does not invoke global account setup", async () => {
    const signal = new AbortController().signal;
    const state = { shareAccessToken: "synthetic-guest-token" };
    const handlers = createPreflightHandlers({
        root: {},
        signal,
        state,
        i18n: {},
        apiFetch: () =>
            assert.fail("global preflight must remain account-only"),
        callbacks: {},
        utils: {},
    });
    assert.equal(await handlers.runPreflightCheck(), false);
    assert.equal(state.preflightPassed, undefined);
});

test("guest meeting payload never inherits the creator's authentication authority", async () => {
    const payload = await createMeetingPayload({
        store: {
            canCurrentUserInitiateAuth: () => true,
            buildMeetingPayload: (_meeting, _participants, _state, extra) =>
                extra,
        },
        meeting: { id: "meeting-1" },
        state: { authRequired: true },
        participants: [],
        requesterUsername: "owner",
        guest: true,
        meetingPassword: "target-meeting-password",
    });
    assert.equal(payload.canAuthenticate, false);
    assert.equal(payload.waitingForAuthentication, true);
    assert.equal(payload.meetingPassword, "target-meeting-password");
});
