import test from "node:test";
import assert from "node:assert/strict";
import { resolveWhiteboardServerAvailability } from "../whiteboard-availability.js";

function availabilityResponse(available) {
    return {
        ok: true,
        async json() {
            return { data: { available } };
        },
    };
}

test("Whiteboard availability retries while an enabled provider is registering", async () => {
    let requests = 0;
    const retryDelays = [];
    const requestOptions = [];
    const available = await resolveWhiteboardServerAvailability({
        apiFetch: async (_url, options) => {
            requests += 1;
            requestOptions.push(options);
            return availabilityResponse(requests === 4);
        },
        signal: new AbortController().signal,
        waitForRetry: async (_signal, delayMs) => retryDelays.push(delayMs),
    });

    assert.equal(available, true);
    assert.equal(requests, 4);
    assert.deepEqual(retryDelays, [250, 500, 1_000]);
    assert.ok(requestOptions.every(({ cache }) => cache === "no-store"));
});

test("Whiteboard availability stops retrying when its mount is aborted", async () => {
    const abortController = new AbortController();
    let requests = 0;
    const available = await resolveWhiteboardServerAvailability({
        apiFetch: async () => {
            requests += 1;
            abortController.abort();
            return availabilityResponse(false);
        },
        signal: abortController.signal,
    });

    assert.equal(available, false);
    assert.equal(requests, 1);
});
