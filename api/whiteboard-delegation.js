import { verifyMeetingWhiteboard } from "./whiteboard-verification.js";

const DELEGATED_WHITEBOARD_CAPABILITIES = Object.freeze([
    "whiteboard:read",
    "whiteboard:write",
]);

function deniedDelegation() {
    return { authorized: false };
}

export function createMeetingWhiteboardDelegationResolver({
    store,
    fetchBoardData,
    log,
}) {
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
        try {
            const authorizedCreators = new Set([
                meeting.createdBy,
                ...(await store.listParticipants(meeting.id)),
            ]);
            if (
                !(await verifyMeetingWhiteboard({
                    fetchBoardData,
                    meeting,
                    whiteboardId: targetResourceId,
                    expectedCreators: Array.from(authorizedCreators),
                }))
            ) {
                return deniedDelegation();
            }
        } catch (error) {
            log?.("error", "Whiteboard delegation verification failed.", {
                component: "jitsi-meet-module",
                operation: "verify_whiteboard_delegation",
                meetingId: sourceResourceId,
                whiteboardId: targetResourceId,
                error: error instanceof Error ? error.message : String(error),
            });
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
    const systemCtx = ctx.getCapability?.("system:ctx");
    const resolveDelegation = createMeetingWhiteboardDelegationResolver({
        store,
        fetchBoardData: (...args) => {
            const providerFetchBoardData =
                ctx.getCapability?.("whiteboard:fetchBoardData") ??
                systemCtx?.getCapability?.("whiteboard:fetchBoardData");
            if (typeof providerFetchBoardData !== "function") {
                throw new Error(
                    "Whiteboard provider verification is unavailable.",
                );
            }
            return providerFetchBoardData(...args);
        },
        log: ctx.log,
    });
    ctx.flow.extend(
        "resolve-share-delegated-access",
        "resolve-delegation",
        { id: "jitsi-meet:resolve-whiteboard-delegation" },
        (stageCtx) => resolveDelegation(stageCtx.input ?? {}),
    );
    return true;
}
