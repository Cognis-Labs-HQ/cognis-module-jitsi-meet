import test from "node:test";
import assert from "node:assert/strict";
import {
    claimRouteRoot,
    createDirectMountController,
} from "../app/route-root.js";

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

for (const event of ["cognis:route-will-change", "pagehide"]) {
    test(`direct Meetings mount is disposed on ${event}`, () => {
        const target = new EventTarget();
        const controller = createDirectMountController(target);
        const root = createRoot();
        let cleanups = 0;
        controller.signal.addEventListener("abort", () => cleanups++);
        claimRouteRoot(root, controller.signal);
        target.dispatchEvent(
            new Event("cognis:route-before-navigate", { cancelable: true }),
        );
        assert.equal(controller.signal.aborted, false);
        target.dispatchEvent(new Event(event));
        target.dispatchEvent(new Event(event));
        assert.equal(controller.signal.aborted, true);
        assert.equal(cleanups, 1);
        assert.equal(root.classList.contains("jitsi-route-root"), false);
        const next = createDirectMountController(target);
        assert.equal(next.signal.aborted, false);
        next.abort();
    });
}
