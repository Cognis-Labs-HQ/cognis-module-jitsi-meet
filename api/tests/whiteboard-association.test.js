import test from "node:test";
import assert from "node:assert/strict";
import {
    createMeetingWhiteboardAssociationResolver,
    registerMeetingWhiteboardAssociationCapability,
} from "../whiteboard-association.js";
import { resolveShareGuestMeetingAccess } from "../reuse/meeting-access.js";

function createResolver({
    tokenResourceId = "meeting-1",
    associationMeetingId = "meeting-1",
    associationActive = true,
} = {}) {
    const tokenRecord = {
        resourceType: "meeting",
        resourceId: tokenResourceId,
        grantedCapabilities: ["meeting:join"],
    };
    return createMeetingWhiteboardAssociationResolver({
        store: {
            async ensureSchema() {},
            async getActiveMeetingByWhiteboardId(whiteboardId) {
                if (whiteboardId !== "board-1" || !associationActive) {
                    return null;
                }
                return { id: associationMeetingId };
            },
        },
        resolveShareGuestMeetingAccess: (request) =>
            resolveShareGuestMeetingAccess({
                ...request,
                getShareTokenById: async (shareId) =>
                    shareId === "share-1" ? tokenRecord : null,
            }),
    });
}

test("real meeting share claims resolve the active whiteboard association", async () => {
    const resolveAssociation = createResolver();

    assert.deepEqual(
        await resolveAssociation({
            claims: { sub: "share:share-1:guest-session-1" },
            meetingResourceType: "meeting",
            whiteboardResourceType: "whiteboard",
            whiteboardId: "board-1",
            requiredCapability: "whiteboard:write",
        }),
        {
            associated: true,
            meetingId: "meeting-1",
            allowedCapabilities: ["whiteboard:read", "whiteboard:write"],
        },
    );
});

test("the ctx capability resolves a real meeting share claim end to end", async () => {
    const capabilities = new Map();
    const resolveShareAccess = (request) =>
        resolveShareGuestMeetingAccess({
            ...request,
            getShareTokenById: async (shareId) =>
                shareId === "share-1"
                    ? {
                          resourceType: "meeting",
                          resourceId: "meeting-1",
                          grantedCapabilities: ["meeting:join"],
                      }
                    : null,
        });
    registerMeetingWhiteboardAssociationCapability(
        {
            capabilities: {
                contribute(capabilityId, capability) {
                    capabilities.set(capabilityId, capability);
                },
            },
        },
        {
            store: {
                async ensureSchema() {},
                async getActiveMeetingByWhiteboardId(whiteboardId) {
                    return whiteboardId === "board-1"
                        ? { id: "meeting-1" }
                        : null;
                },
            },
            resolveShareGuestMeetingAccess: resolveShareAccess,
        },
    );

    const capability = capabilities.get(
        "meetings:resolveWhiteboardAssociation",
    );
    assert.equal(typeof capability, "function");
    assert.equal(
        (
            await capability({
                claims: { sub: "share:share-1:guest-session-1" },
                meetingResourceType: "meeting",
                whiteboardResourceType: "whiteboard",
                whiteboardId: "board-1",
                requiredCapability: "whiteboard:read",
            })
        ).meetingId,
        "meeting-1",
    );
});

test("association resolution denies mismatched shares and inactive mappings", async () => {
    const request = {
        claims: { sub: "share:share-1:guest-session-1" },
        meetingResourceType: "meeting",
        whiteboardResourceType: "whiteboard",
        whiteboardId: "board-1",
        requiredCapability: "whiteboard:read",
    };

    assert.deepEqual(
        await createResolver({ tokenResourceId: "meeting-2" })(request),
        { associated: false, allowedCapabilities: [] },
    );
    assert.deepEqual(
        await createResolver({ associationActive: false })(request),
        { associated: false, allowedCapabilities: [] },
    );
    assert.deepEqual(
        await createResolver()({
            ...request,
            claims: { sub: "account-1" },
        }),
        { associated: false, allowedCapabilities: [] },
    );
});
