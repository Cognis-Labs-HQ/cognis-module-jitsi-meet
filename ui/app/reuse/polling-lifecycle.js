import { uiCtx } from "../../reuse/resources.js";
import { logUi } from "../../reuse/feedback.js";

export const isMeetingOffline = () =>
    uiCtx.capabilities.get("offline:state")?.isOffline() === true;

/** Background polling belongs to its page, and never survives an offline transition. */
export function bindMeetingPolling(signal, stop) {
    if (!signal) return;
    signal.addEventListener("abort", stop, { once: true });
    window.addEventListener?.(
        "cognis:connectivity-changed",
        () => {
            if (isMeetingOffline()) stop();
        },
        { signal },
    );
}

export async function runMeetingPoll(operation, task, stop) {
    if (isMeetingOffline()) return stop();
    try {
        await task();
    } catch (error) {
        stop();
        logUi(
            isMeetingOffline() || error?.name === "AbortError"
                ? "info"
                : "error",
            "Meeting polling interrupted; polling stopped.",
            {
                component: "module:jitsi-meet",
                operation,
                errorName: error?.name,
            },
        );
    }
}
