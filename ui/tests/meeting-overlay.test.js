import assert from "node:assert/strict";
import test from "node:test";

class Element {
    isConnected = true;
    hidden = false;
    classList = { contains: () => false, add() {}, remove() {} };
    controls = new Map();
    querySelector(selector) {
        return this.controls.get(selector) ?? null;
    }
    closest(selector) {
        return this.parentElement?.className === selector.slice(1)
            ? this.parentElement
            : null;
    }
    append(child) {
        child.parentElement = this;
        child.isConnected = true;
    }
}
globalThis.HTMLElement = Element;
globalThis.HTMLButtonElement = Element;
globalThis[Symbol.for("cognis.uiCtx")] = {
    capabilities: {
        get: () => ({
            importModule: () => assert.fail("No external resources expected"),
        }),
    },
};
const { createMountUtilities } = await import("../app/mount-surface.js");

test("overlay updates stay on the floating meeting and update its controls", () => {
    const root = new Element();
    const frameWrap = new Element();
    root.controls.set(".jitsi-stage-frame-wrap", frameWrap);
    const floatingFrame = new Element();
    floatingFrame.className = "jitsi-stage-frame";
    const overlay = new Element();
    floatingFrame.append(overlay);
    for (const id of [
        "message",
        "loading",
        "loading-indicator",
        "loading-text",
        "start-btn",
        "auth-btn",
        "reclaim-btn",
        "leave-alone-btn",
        "remain-alone-btn",
    ]) {
        overlay.controls.set(
            `#jitsi-${id === "message" ? "overlay-message" : id}`,
            new Element(),
        );
    }
    const staleMessage = new Element();
    root.controls.set("#jitsi-overlay-message", staleMessage);
    const state = {
        meetingOverlay: overlay,
        meetingFrameWrap: frameWrap,
        preflightStatus: "idle",
    };
    state.meeting = { id: "meeting" };
    state.jitsiApi = {};
    floatingFrame.childElementCount = 2;
    const utilities = createMountUtilities({ root, state });
    assert.equal(utilities.isMeetingEmbedMissing(), false);
    utilities.updateOverlay({
        message: "Remain in the meeting?",
        showAlonePrompt: true,
        visible: true,
    });
    assert.equal(overlay.parentElement, floatingFrame);
    assert.equal(staleMessage.textContent, undefined);
    assert.equal(
        overlay.querySelector("#jitsi-overlay-message").textContent,
        "Remain in the meeting?",
    );
    assert.equal(overlay.querySelector("#jitsi-leave-alone-btn").hidden, false);
    assert.equal(overlay.querySelector("#jitsi-auth-btn").hidden, true);
    utilities.setPreflightStatus("passed", "Ready");
    assert.equal(
        overlay.querySelector("#jitsi-loading-text").textContent,
        "Ready",
    );
    overlay.isConnected = false;
    utilities.updateOverlay({ message: "Meeting ended" });
    assert.equal(overlay.parentElement, frameWrap);
});
