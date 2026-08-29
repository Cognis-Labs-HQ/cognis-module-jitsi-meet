const DELEGATED_WHITEBOARD_CAPABILITIES = Object.freeze([
    "whiteboard:read",
    "whiteboard:write",
]);

function deniedAssociation() {
    return { associated: false, allowedCapabilities: [] };
}

export function createMeetingWhiteboardAssociationResolver({
    store,
    resolveShareGuestMeetingAccess,
}) {
    return async function resolveMeetingWhiteboardAssociation({
        claims,
        meetingResourceType,
        whiteboardResourceType,
        whiteboardId,
        requiredCapability,
    } = {}) {
        const normalizedWhiteboardId = String(whiteboardId ?? "").trim();
        if (
            meetingResourceType !== "meeting" ||
            whiteboardResourceType !== "whiteboard" ||
            !normalizedWhiteboardId ||
            !DELEGATED_WHITEBOARD_CAPABILITIES.includes(requiredCapability)
        ) {
            return deniedAssociation();
        }

        await store.ensureSchema();
        const meeting = await store.getActiveMeetingByWhiteboardId(
            normalizedWhiteboardId,
        );
        if (!meeting) return deniedAssociation();

        const guestAccess = await resolveShareGuestMeetingAccess({
            claims,
            meetingId: meeting.id,
            requiredCapability: "meeting:join",
        });
        if (!guestAccess.isGuest || !guestAccess.allowed) {
            return deniedAssociation();
        }

        return {
            associated: true,
            meetingId: meeting.id,
            allowedCapabilities: [...DELEGATED_WHITEBOARD_CAPABILITIES],
        };
    };
}

export function registerMeetingWhiteboardAssociationCapability(ctx, options) {
    const resolveAssociation =
        createMeetingWhiteboardAssociationResolver(options);
    ctx.capabilities.contribute(
        "meetings:resolveWhiteboardAssociation",
        resolveAssociation,
    );
    return resolveAssociation;
}
