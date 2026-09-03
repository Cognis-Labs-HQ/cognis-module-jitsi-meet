import { uiCtx } from "./reuse/resources.js";

const CAPABILITY = "voip:startCall";
const COMPONENT_UUID = "f055f2e5-227a-5fb4-b934-5397ec32cf2d";
const COMPONENT_ROUTE_ID = "module.jitsi.meet.meetings";

export function resolveMessagesCallAction(input = {}) {
    const roomId = String(input.room?.id ?? "").trim();
    const roomKind = String(input.room?.kind ?? "").trim();
    const members = Array.isArray(input.users) ? input.users : [];
    const supportsComponent = Array.isArray(input.supportedActions)
        ? input.supportedActions.includes("component")
        : false;
    const currentMembers = members.filter(
        (member) => member?.isCurrentUser === true,
    );
    if (
        input.source !== "messages" ||
        !supportsComponent ||
        !["dm", "group"].includes(roomKind) ||
        !roomId ||
        members.length < 2 ||
        currentMembers.length !== 1
    ) {
        return null;
    }

    return {
        action: "component",
        componentUuid: COMPONENT_UUID,
        routeId: COMPONENT_ROUTE_ID,
        mode: "overlay",
        borderless: true,
        context: {
            autoStart: true,
            messagesCall: true,
            messagesCallRequest: {
                roomId,
                memberAccountIds: members.map((member) => member.accountId),
            },
        },
    };
}

if (typeof uiCtx.capabilities.get(CAPABILITY) !== "function") {
    uiCtx.capabilities.contribute(CAPABILITY, resolveMessagesCallAction);
}
