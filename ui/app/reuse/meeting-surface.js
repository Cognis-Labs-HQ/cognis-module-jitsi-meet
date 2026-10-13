import { placeMeetingOverlayForActiveWindow } from "../../whiteboard-control.js";

export function resolveMeetingSurface(root, state) {
    const overlay =
        placeMeetingOverlayForActiveWindow(root) ??
        root.querySelector("#jitsi-overlay") ??
        state.meetingOverlay;
    if (overlay instanceof HTMLElement) {
        if (!overlay.isConnected) {
            const frameWrap =
                root.querySelector(".jitsi-stage-frame-wrap") ??
                state.meetingFrameWrap;
            frameWrap?.append(overlay);
        }
        state.meetingOverlay = overlay;
    }
    const frame =
        overlay?.closest(".jitsi-stage-frame") ??
        root.querySelector("#jitsi-meeting-frame");
    return {
        overlay,
        query: (selector) =>
            selector === "#jitsi-overlay"
                ? overlay
                : selector === "#jitsi-meeting-frame"
                  ? frame
                  : (overlay?.querySelector(selector) ??
                    root.querySelector(selector)),
    };
}
