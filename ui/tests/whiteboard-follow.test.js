import test from "node:test";
import assert from "node:assert/strict";

globalThis[Symbol.for("cognis.uiCtx")] = {
    capabilities: { get: () => ({ importModule() {} }) },
};
const { synchronizeWhiteboardOpen } = await import("../whiteboard-provider.js");

for (const automaticOpen of [true, false]) {
    test(`${automaticOpen ? "automatic" : "manual"} account opening synchronizes access before mounting`, async () => {
        const requests = [];
        const response = { ok: true };
        const signal = new AbortController().signal;
        const returned = await synchronizeWhiteboardOpen(
            async (...args) => {
                requests.push(args);
                return response;
            },
            {
                meetingId: "meeting-1",
                whiteboardId: "board-1",
                disposable: false,
                automaticOpen,
                signal,
            },
        );
        assert.equal(returned, response);
        assert.equal(
            requests[0][0],
            "/api/v1/modules/jitsi-meet/whiteboard/state",
        );
        assert.deepEqual(JSON.parse(requests[0][1].body), {
            meetingId: "meeting-1",
            whiteboardId: "board-1",
            disposable: false,
            active: true,
            followExisting: automaticOpen,
        });
        assert.equal(requests[0][1].signal, signal);
    });
}

test("automatic link guests follow delegation without requesting account membership", async () => {
    assert.equal(
        await synchronizeWhiteboardOpen(
            () =>
                assert.fail(
                    "Delegated guest should not request account membership",
                ),
            {
                automaticOpen: true,
                shareAccessToken: "guest-token",
            },
        ),
        null,
    );
});

test("a closed or replaced board cancels automatic mounting instead of showing a failure", async () => {
    await assert.rejects(
        synchronizeWhiteboardOpen(
            async () => ({
                ok: false,
                status: 409,
                json: async () => ({
                    error: { code: "whiteboard_state_changed" },
                }),
            }),
            { automaticOpen: true },
        ),
        { name: "AbortError" },
    );
});

test("an explicit guest open carries its scoped token to the server", async () => {
    let requestOptions;
    await synchronizeWhiteboardOpen(
        async (_path, options) => {
            requestOptions = options;
            return { ok: true };
        },
        {
            automaticOpen: false,
            shareAccessToken: "guest-token",
            meetingId: "meeting-1",
            whiteboardId: "board-1",
            disposable: false,
        },
    );
    assert.equal(requestOptions.accessToken, "guest-token");
    assert.equal(JSON.parse(requestOptions.body).followExisting, false);
});
