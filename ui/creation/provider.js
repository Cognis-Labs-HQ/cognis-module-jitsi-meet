import { importReuseModule } from "../reuse/resources.js";

const { apiFetch } = await importReuseModule("api-client.js");

/** Meeting URLs and request payloads remain owned by the installed meeting provider. */
export function mountProvider(ctx) {
    const registerActions = ctx.capabilities.get("ui:scopedActions");
    if (typeof registerActions !== "function")
        throw new Error("scoped_ui_actions_unavailable");
    const log = ctx.capabilities.get("ui:log");
    const actions = registerActions(ctx, "jitsi-meet:creation", {
        create: async ({
            participants = [],
            scheduledAt = null,
            signal,
        } = {}) => {
            if (!Array.isArray(participants))
                throw new Error("meeting_participants_invalid");
            try {
                const response = await apiFetch(
                    "/api/v1/modules/jitsi-meet/meetings/create",
                    {
                        method: "POST",
                        signal: signal
                            ? AbortSignal.any([ctx.signal, signal])
                            : ctx.signal,
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ participants, scheduledAt }),
                    },
                );
                if (!response.ok) throw new Error("meeting_creation_failed");
                const data = (await response.json()).data;
                if (typeof data?.id !== "string" || !data.id.trim())
                    throw new Error("meeting_creation_result_invalid");
                return {
                    meetingId: data.id,
                    navigationUrl: `/meetings?meetingId=${encodeURIComponent(data.id)}`,
                };
            } catch (error) {
                if (!ctx.signal.aborted && !signal?.aborted)
                    await log?.("error", "Meeting creation failed.", {
                        component: "jitsi-meet",
                        operation: "createMeeting",
                        errorName:
                            error instanceof Error
                                ? error.name
                                : "UnknownError",
                    });
                throw error;
            }
        },
    });
    ctx.capabilities.contribute("meetings:createMeeting", actions.create);
}
