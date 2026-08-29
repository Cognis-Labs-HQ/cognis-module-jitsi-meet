const DELEGATED_WHITEBOARD_CAPABILITIES = Object.freeze([
    "whiteboard:read",
    "whiteboard:write",
]);

function deniedDelegation() {
    return { authorized: false };
}

export function createMeetingWhiteboardDelegationResolver({ store }) {
    return async function resolveMeetingWhiteboardDelegation({
        source,
        target,
    } = {}) {
        const sourceResourceId = String(source?.resourceId ?? "");
        const targetResourceId = String(target?.resourceId ?? "");
        if (
            source?.resourceType !== "meeting" ||
            !sourceResourceId ||
            sourceResourceId.trim() !== sourceResourceId ||
            target?.resourceType !== "whiteboard" ||
            !targetResourceId ||
            targetResourceId.trim() !== targetResourceId
        ) {
            return deniedDelegation();
        }

        await store.ensureSchema();
        const meeting =
            await store.getActiveMeetingByWhiteboardId(targetResourceId);
        if (!meeting || meeting.id !== sourceResourceId) {
            return deniedDelegation();
        }

        return {
            authorized: true,
            sourceResourceType: source.resourceType,
            sourceResourceId,
            sourceCapability: "meeting:join",
            resourceType: target.resourceType,
            resourceId: targetResourceId,
            allowedCapabilities: [...DELEGATED_WHITEBOARD_CAPABILITIES],
        };
    };
}

export function registerMeetingWhiteboardDelegationHook(ctx, { store }) {
    if (!ctx.flow.exists("resolve-share-delegated-access")) return false;
    const resolveDelegation = createMeetingWhiteboardDelegationResolver({
        store,
    });
    ctx.flow.extend(
        "resolve-share-delegated-access",
        "resolve-delegation",
        { id: "jitsi-meet:resolve-whiteboard-delegation" },
        (stageCtx) => resolveDelegation(stageCtx.input ?? {}),
    );
    return true;
}
