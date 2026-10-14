/** Bind a meeting through provider-owned authorization and compare-and-set. */
export async function bindMeetingCanvasSource(
    ctx,
    fetchBoardData,
    meetingId,
    whiteboardId,
) {
    const binding = ctx.getCapability("whiteboard:sourceBinding");
    if (
        typeof binding?.bind !== "function" ||
        typeof binding?.release !== "function"
    )
        throw new Error("Whiteboard source binding is unavailable.");
    const board = await fetchBoardData(whiteboardId);
    const input = {
        whiteboardId,
        sourceType: "meeting",
        sourceId: meetingId,
        actorAccountId: board?.createdByAccountId,
    };
    await binding.bind(input);
    return () => binding.release(input);
}
