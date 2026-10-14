export async function commitMeetingCanvasState({
    store,
    meetingId,
    previousState,
    nextState,
    bindCanvas,
    synchronizeMembers,
    log,
}) {
    let release;
    let stage = "binding";
    try {
        if (nextState.whiteboardActive) {
            release = await bindCanvas();
            stage = "membership";
            await synchronizeMembers?.();
        }
        stage = "state";
        await store.updateMeetingState(meetingId, nextState);
    } catch (error) {
        if (release && previousState.whiteboardId !== nextState.whiteboardId) {
            try {
                await release();
            } catch (rollbackError) {
                log?.("error", "Meeting canvas claim rollback failed.", {
                    operation: "release_failed_canvas_claim",
                    meetingId,
                    whiteboardId: nextState.whiteboardId,
                    errorName: rollbackError?.name,
                });
            }
        }
        throw Object.assign(error, { whiteboardStage: stage });
    }
}
