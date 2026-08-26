/**
 * Resolves host-supplied clients for data owned by Cognis gateways.
 *
 * @example
 * `await messagesClient().listRoomMessages(roomId);`
 *
 * @param {string} capabilityName
 * @returns {object}
 */
import { uiCtx } from "./resources.js";

function requireClient(capabilityName) {
    const client = uiCtx.capabilities.get(capabilityName);
    if (!client || typeof client !== "object") {
        throw new Error(
            `Required UI capability unavailable: ${capabilityName}`,
        );
    }
    return client;
}

export const messagesClient = () => requireClient("social:messagesUiClient");
export const profileClient = () => requireClient("social:profileUiClient");
export const filesClient = () => requireClient("files:uiClient");
export const shareClient = () => requireClient("share:uiClient");
