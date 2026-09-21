export async function verifyMeetingWhiteboard({
    fetchBoardData,
    meeting,
    whiteboardId,
    expectedCreator = "",
    expectedCreatorAccountId = "",
    expectedCreators = [],
}) {
    if (typeof fetchBoardData !== "function") return false;
    const whiteboard = await fetchBoardData(whiteboardId);
    if (
        String(whiteboard?.id ?? "").trim() !== whiteboardId ||
        String(whiteboard?.title ?? "").trim() !== meeting.meetingName
    ) {
        return false;
    }
    const creator = String(whiteboard?.createdBy ?? "").trim();
    const creatorAccountId = String(
        whiteboard?.createdByAccountId ?? "",
    ).trim();
    if (
        expectedCreatorAccountId &&
        creatorAccountId !== expectedCreatorAccountId
    ) {
        return false;
    }
    if (expectedCreator && creator !== expectedCreator) return false;
    return expectedCreators.length === 0 || expectedCreators.includes(creator);
}
