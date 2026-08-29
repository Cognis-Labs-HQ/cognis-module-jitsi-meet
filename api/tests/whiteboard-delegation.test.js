import test from "node:test";
import assert from "node:assert/strict";
import {
    createMeetingWhiteboardDelegationResolver,
    registerMeetingWhiteboardDelegationHook,
} from "../whiteboard-delegation.js";

function createResolver({
    associationMeetingId = "meeting-1",
    associationActive = true,
} = {}) {
    return createMeetingWhiteboardDelegationResolver({
        store: {
            async ensureSchema() {},
            async getActiveMeetingByWhiteboardId(whiteboardId) {
                if (whiteboardId !== "board-1" || !associationActive) {
                    return null;
                }
                return {
                    id: associationMeetingId,
                    meetingName: "Planning",
                    createdBy: "alice",
                };
            },
            async listParticipants() {
                return ["alice"];
            },
        },
        fetchBoardData: async () => ({
            id: "board-1",
            title: "Planning",
            createdBy: "alice",
        }),
    });
}

const DELEGATION_REQUEST = Object.freeze({
    source: { resourceType: "meeting", resourceId: "meeting-1" },
    target: { resourceType: "whiteboard", resourceId: "board-1" },
});

test("active meeting mappings authorize generic whiteboard delegation", async () => {
    assert.deepEqual(await createResolver()(DELEGATION_REQUEST), {
        authorized: true,
        sourceResourceType: "meeting",
        sourceResourceId: "meeting-1",
        sourceCapability: "meeting:join",
        resourceType: "whiteboard",
        resourceId: "board-1",
        allowedCapabilities: ["whiteboard:read", "whiteboard:write"],
    });
});

test("delegation denies mismatched resources and inactive mappings", async () => {
    const denied = { authorized: false };
    assert.deepEqual(
        await createResolver({ associationMeetingId: "meeting-2" })(
            DELEGATION_REQUEST,
        ),
        denied,
    );
    assert.deepEqual(
        await createResolver({ associationActive: false })(DELEGATION_REQUEST),
        denied,
    );
    assert.deepEqual(
        await createResolver()({
            ...DELEGATION_REQUEST,
            source: { resourceType: "file", resourceId: "meeting-1" },
        }),
        denied,
    );
    assert.deepEqual(
        await createResolver()({
            ...DELEGATION_REQUEST,
            target: { resourceType: "canvas", resourceId: "board-1" },
        }),
        denied,
    );
    assert.deepEqual(
        await createResolver()({
            ...DELEGATION_REQUEST,
            target: { resourceType: "whiteboard", resourceId: " board-1" },
        }),
        denied,
    );
});

test("delegation denies mappings not verified by the whiteboard provider", async () => {
    const resolveDelegation = createMeetingWhiteboardDelegationResolver({
        store: {
            async ensureSchema() {},
            async getActiveMeetingByWhiteboardId() {
                return {
                    id: "meeting-1",
                    meetingName: "Planning",
                    createdBy: "alice",
                };
            },
            async listParticipants() {
                return ["alice"];
            },
        },
        fetchBoardData: async () => ({
            id: "board-1",
            title: "Unrelated board",
            createdBy: "alice",
        }),
    });
    assert.deepEqual(await resolveDelegation(DELEGATION_REQUEST), {
        authorized: false,
    });
});

test("Jitsi extends the generic delegated-access flow", async () => {
    const hooks = [];
    let providerFetchBoardData;
    const systemCtx = {
        getCapability(capabilityId) {
            if (capabilityId !== "whiteboard:fetchBoardData") return null;
            return providerFetchBoardData;
        },
    };
    const ctx = {
        getCapability(capabilityId) {
            return capabilityId === "system:ctx" ? systemCtx : null;
        },
        flow: {
            exists: (flowId) => flowId === "resolve-share-delegated-access",
            extend(flowId, stageId, hook, handler) {
                hooks.push({ flowId, stageId, hook, handler });
            },
        },
    };
    const registered = registerMeetingWhiteboardDelegationHook(ctx, {
        store: {
            async ensureSchema() {},
            async getActiveMeetingByWhiteboardId() {
                return {
                    id: "meeting-1",
                    meetingName: "Planning",
                    createdBy: "alice",
                };
            },
            async listParticipants() {
                return ["alice"];
            },
        },
    });

    assert.equal(registered, true);
    assert.equal(hooks.length, 1);
    assert.deepEqual(
        {
            flowId: hooks[0].flowId,
            stageId: hooks[0].stageId,
            hookId: hooks[0].hook.id,
        },
        {
            flowId: "resolve-share-delegated-access",
            stageId: "resolve-delegation",
            hookId: "jitsi-meet:resolve-whiteboard-delegation",
        },
    );
    providerFetchBoardData = async () => ({
        id: "board-1",
        title: "Planning",
        createdBy: "alice",
    });
    assert.equal(
        (await hooks[0].handler({ input: DELEGATION_REQUEST })).authorized,
        true,
    );
});
