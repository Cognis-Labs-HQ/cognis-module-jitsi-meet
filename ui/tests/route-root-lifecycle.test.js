import test from "node:test";
import assert from "node:assert/strict";
import { claimRouteRoot } from "../app/route-root.js";

function createRoot() {
    const classes = new Set();
    return {
        classList: {
            add: (className) => classes.add(className),
            contains: (className) => classes.has(className),
            remove: (className) => classes.delete(className),
        },
    };
}

test("an already-aborted Meetings mount does not claim the persistent route root", () => {
    const root = createRoot();
    const controller = new AbortController();
    controller.abort();

    assert.equal(claimRouteRoot(root, controller.signal), false);
    assert.equal(root.classList.contains("jitsi-route-root"), false);
});

test("aborting an active Meetings mount releases the persistent route root", () => {
    const root = createRoot();
    const controller = new AbortController();

    assert.equal(claimRouteRoot(root, controller.signal), true);
    assert.equal(root.classList.contains("jitsi-route-root"), true);
    controller.abort();
    assert.equal(root.classList.contains("jitsi-route-root"), false);
});
