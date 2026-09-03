import { uiCtx } from "./reuse/resources.js";

const CAPABILITY = "voip:startCall";
const COMPONENT_UUID = "f055f2e5-227a-5fb4-b934-5397ec32cf2d";
const STAGE_ID = "jitsi-messages-call-stage";

async function startMessagesCall(input = {}) {
    if (input.source !== "messages" || input.presentation !== "pip") {
        throw new Error("Unsupported video-call request.");
    }
    const roomId = String(input.room?.id ?? "").trim();
    const members = Array.isArray(input.users) ? input.users : [];
    if (!roomId || members.length < 2) {
        throw new Error("A chatroom with at least two members is required.");
    }
    document.getElementById(STAGE_ID)?.remove();
    const stage = document.createElement("section");
    stage.id = STAGE_ID;
    stage.className = "jitsi-messages-call-stage";
    stage.style.minHeight = "28rem";
    stage.style.width = "100%";
    const messageView =
        document.querySelector(".messages-thread") ??
        document.querySelector(".messages-layout") ??
        document.querySelector("main");
    if (!(messageView instanceof HTMLElement)) {
        throw new Error("Messages call stage is unavailable.");
    }
    messageView.append(stage);
    const spawn = uiCtx.capabilities.get("component-pages:spawn");
    const handle = await spawn?.({
        componentUuid: COMPONENT_UUID,
        routeId: "module.jitsi.meet.meetings",
        elementId: STAGE_ID,
        context: {
            autoStart: true,
            messagesCall: true,
            messagesCallRequest: {
                roomId,
                memberAccountIds: members.map((member) => member.accountId),
            },
        },
        borderless: true,
    });
    if (!handle) stage.remove();
    return Boolean(handle);
}

if (typeof uiCtx.capabilities.get(CAPABILITY) !== "function") {
    uiCtx.capabilities.contribute(CAPABILITY, startMessagesCall);
}
