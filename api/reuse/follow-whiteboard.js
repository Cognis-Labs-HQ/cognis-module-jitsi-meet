import { bindMeetingCanvasSource } from "./whiteboard-source-binding.js";
import { updateMeetingWhiteboardMembership } from "./whiteboard-membership.js";

const FLOW_ID = "jitsi-meet:followWhiteboard";

export function registerFollowWhiteboard(ctx, dependencies) {
    const { store } = dependencies;
    ctx.registerFlow({
        id: FLOW_ID,
        description: "Authorize access to an already-open meeting Whiteboard.",
        stages: [
            "verify-mapping",
            "claim-source",
            "grant-membership",
            "confirm-mapping",
        ],
    });
    return async (input) => {
        const verifyMapping = async () => {
            const state = await store.getMeetingState(input.meeting.id);
            if (
                state.whiteboardActive !== true ||
                state.endedAt ||
                state.screenSharingActive ||
                state.whiteboardId !== input.whiteboardId ||
                state.whiteboardDisposable !== input.disposable
            ) {
                const error = new Error(
                    "The meeting Whiteboard is no longer open.",
                );
                error.code = "whiteboard_state_changed";
                throw error;
            }
            return state;
        };
        const result = await ctx.flow.run(FLOW_ID, input, {
            handlers: {
                "verify-mapping": verifyMapping,
                "claim-source": () =>
                    bindMeetingCanvasSource(
                        ctx,
                        dependencies.fetchBoardData,
                        input.meeting.id,
                        input.whiteboardId,
                    ),
                "grant-membership": async ({ stageResults }) => {
                    if (!ctx.flow.exists(FLOW_ID))
                        throw new Error(
                            "Whiteboard access flow is unavailable.",
                        );
                    if (!input.shareGuest) {
                        await updateMeetingWhiteboardMembership({
                            ...dependencies,
                            operation: "add",
                            state: stageResults["verify-mapping"][0],
                            userAccountId: input.requesterAccountId,
                        });
                    }
                },
                "confirm-mapping": verifyMapping,
            },
        });
        if (!result.stageResults?.["confirm-mapping"]?.[0])
            throw new Error("Whiteboard access was not confirmed.");
        ctx.log?.("info", "Meeting Whiteboard access confirmed.", {
            operation: "follow_meeting_whiteboard",
            meetingId: input.meeting.id,
            whiteboardId: input.whiteboardId,
            requesterAccountId: input.requesterAccountId,
        });
        return {
            whiteboardOpen: true,
            whiteboardId: input.whiteboardId,
            whiteboardDisposable: input.disposable,
        };
    };
}
