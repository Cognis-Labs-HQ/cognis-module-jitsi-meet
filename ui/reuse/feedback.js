/**
 * Resolves the host-owned logging and feedback capabilities used by this module.
 *
 * @example
 * `showToast(i18n.t("module.jitsi_meet.saved"), { variant: "success" });`
 *
 * @param {string} capabilityName
 * @returns {Function}
 */
import { uiCtx } from "/static/reuse/ui-ctx.js";

function requireCapability(capabilityName) {
    const capability = uiCtx.capabilities.get(capabilityName);
    if (typeof capability !== "function") {
        throw new Error(`Required UI capability unavailable: ${capabilityName}`);
    }
    return capability;
}

export const logUi = (level, message, meta = {}) =>
    requireCapability("ui:log")(level, message, meta);
export const showToast = (message, options = {}) =>
    requireCapability("ui:showToast")(message, options);
export const openErrorPopup = (options = {}) =>
    requireCapability("ui:openErrorPopup")(options);
