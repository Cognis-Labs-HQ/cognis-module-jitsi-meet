import { importReuseModule } from "./reuse/resources.js";
import { JITSI_PIP_MINIMUM_SIZE } from "./constants.js";

const { apiFetch } = await importReuseModule("api-client.js");
const { createI18n } = await importReuseModule("i18n.js");
const i18n = await createI18n({
    componentStringBaseUrls: ["/static/modules/jitsi-meet/languages"],
});

const CAPABILITY = "voip:startCall";
const COMPONENT_UUID = "f055f2e5-227a-5fb4-b934-5397ec32cf2d";
const COMPONENT_ROUTE_ID = "module.jitsi.meet.meetings";

export async function resolveVoipCallAction(input = {}) {
    const roomId = String(input.room?.id ?? "").trim();
    const roomKind = String(input.room?.kind ?? "").trim();
    const members = Array.isArray(input.users) ? input.users : [];
    const supportedActions = Array.isArray(input.supportedActions)
        ? input.supportedActions
        : [];
    const supportsCallAction = ["component", "navigate"].some((action) =>
        supportedActions.includes(action),
    );
    const currentMembers = members.filter(
        (member) => member?.isCurrentUser === true,
    );
    if (
        input.source !== "messages" ||
        !supportsCallAction ||
        !["dm", "group"].includes(roomKind) ||
        !roomId ||
        members.length < 2 ||
        currentMembers.length !== 1
    ) {
        return null;
    }

    const response = await apiFetch(
        "/api/v1/modules/jitsi-meet/meetings/voip-call",
        {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                roomId,
            }),
        },
    );
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Request failed");
    }
    const meetingId = String(payload?.data?.id ?? "").trim();
    if (!meetingId) return null;
    if (payload.data.action === "navigate") {
        if (!supportedActions.includes("navigate")) return null;
        return {
            action: "navigate",
            url: `/meetings?meetingId=${encodeURIComponent(meetingId)}&start=1`,
        };
    }
    if (
        payload.data.action !== "component" ||
        !supportedActions.includes("component")
    )
        return null;
    return {
        action: "component",
        componentUuid: COMPONENT_UUID,
        routeId: COMPONENT_ROUTE_ID,
        mode: "overlay",
        borderless: true,
        minSize: JITSI_PIP_MINIMUM_SIZE,
        context: {
            autoStart: true,
            voipCall: true,
            disposableMeeting: true,
            meetingId,
            meetingSubject:
                String(input.meetingSubject ?? "").trim() ||
                i18n.t("module.jitsi_meet.voip.subject"),
            allParticipantsRequired: true,
            allowNavigation: true,
        },
    };
}

export function mountProvider(ctx) {
    const flowId = "jitsi-meet:startCall";
    ctx.registerFlow(flowId, ["resolveAction"]);
    ctx.extendFlow(
        flowId,
        "resolveAction",
        { id: "jitsi-meet:resolveCall" },
        async (stage) => {
            stage.data.action = await resolveVoipCallAction(stage.input);
        },
    );
    ctx.capabilities.contribute(CAPABILITY, async (input) => {
        const result = await ctx.runFlow(flowId, input);
        return result.data.action;
    });
}
