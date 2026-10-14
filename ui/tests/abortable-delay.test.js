import test from "node:test";
import assert from "node:assert/strict";
import { getEventListeners } from "node:events";
import { waitForRetry } from "../reuse/abortable-delay.js";

test("retry delay releases the abort listener after completion", async () => {
    const { signal } = new AbortController();
    await waitForRetry(signal, 0);
    assert.equal(getEventListeners(signal, "abort").length, 0);
});

test("aborting a delay releases its timer and listener immediately", async () => {
    const controller = new AbortController();
    const waiting = waitForRetry(controller.signal, 60_000);
    controller.abort();
    await waiting;
    assert.equal(getEventListeners(controller.signal, "abort").length, 0);
    await waitForRetry(controller.signal, 60_000);
    assert.equal(getEventListeners(controller.signal, "abort").length, 0);
});
