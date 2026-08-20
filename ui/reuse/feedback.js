/**
 * Resolves Cognis-owned logging and feedback capabilities for module browser code.
 *
 * Public exports:
 * - `logUi()` forwards structured operational events to the server log.
 * - `showToast()` displays transient host-themed feedback.
 * - `openErrorPopup()` displays the host runtime-error reporting popup.
 *
 * @example
 * `showToast(i18n.t("module.jitsi_meet.saved"), { variant: "success" });`
 *
 * @param {string} capabilityName - Required public UI capability name.
 * @returns {Function} Host-provided capability function.
 */
import { uiCtx } from "/static/reuse/ui-ctx.js";

function requireFeedbackCapability(capabilityName) {
    const capability = uiCtx.capabilities.get(capabilityName);
    if (typeof capability !== "function") {
        throw new Error(
            `Required UI capability unavailable: ${capabilityName}`,
        );
    }
    return capability;
}

export function logUi(level, message, meta = {}) {
    return requireFeedbackCapability("ui:log")(level, message, {
        ...meta,
        component: "module:jitsi-meet",
    });
}

export function showToast(message, options = {}) {
    return requireFeedbackCapability("ui:showToast")(message, options);
}

export function openErrorPopup(options = {}) {
    return requireFeedbackCapability("ui:openErrorPopup")(options);
}
