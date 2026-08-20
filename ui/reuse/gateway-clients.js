/**
 * Resolves host-supplied browser clients for gateway-owned data without
 * coupling this module to gateway routes or implementations.
 *
 * @example
 * const messages = requireGatewayClient("social:messagesUiClient");
 * const response = await messages.listRoomMessages(roomId, options);
 *
 * @param {string} capabilityName - Public UI capability name.
 * @returns {object} The host-provided gateway client.
 */
import { uiCtx } from "/static/reuse/ui-ctx.js";

export function requireGatewayClient(capabilityName) {
    const client = uiCtx.capabilities.get(capabilityName);
    if (!client || typeof client !== "object") {
        throw new Error(
            `Required UI capability unavailable: ${capabilityName}`,
        );
    }
    return client;
}

export function messagesClient() {
    return requireGatewayClient("social:messagesUiClient");
}

export function profileClient() {
    return requireGatewayClient("social:profileUiClient");
}

export function filesClient() {
    return requireGatewayClient("files:uiClient");
}

export function shareClient() {
    return requireGatewayClient("share:uiClient");
}
