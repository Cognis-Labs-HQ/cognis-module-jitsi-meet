import { importReuseModule } from "../reuse/resources.js";

const { apiFetch } = await importReuseModule("api-client.js");

export function mountProvider(ctx) {
    const registerScopedUiActions = ctx.capabilities.get("ui:scopedActions");
    if (typeof registerScopedUiActions !== "function")
        throw new Error("Scoped UI actions are unavailable.");
    const request = async (action, input) => {
        const mutation = ["delete", "terminate"].includes(action);
        const suffix = action === "list" ? "" : `/${action}`;
        const response = await apiFetch(
            `/api/v1/modules/jitsi-meet/admin/meetings${suffix}`,
            {
                signal: ctx.signal,
                ...(mutation
                    ? {
                          method: "POST",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify(input),
                      }
                    : {}),
            },
        );
        if (!response.ok)
            throw new Error("Meeting administration request failed.");
        return (await response.json()).data;
    };
    ctx.capabilities.contribute(
        "jitsi-meet:administration",
        registerScopedUiActions(ctx, "jitsi-meet", {
            listAdminMeetings: () => request("list"),
            listUpcomingAdminMeetings: () => request("upcoming"),
            deleteAdminMeeting: (input) => request("delete", input),
            terminateAdminMeeting: (input) => request("terminate", input),
        }),
    );
}
