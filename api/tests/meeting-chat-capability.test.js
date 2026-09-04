import test from "node:test";
import assert from "node:assert/strict";
import { createGetMeetingChatCapability } from "../meeting-chat-capability.js";
import { profileIdentityFake } from "./profile-identity-fake.js";

function createCapability({ authorized = true } = {}) {
    const accessRequests = [];
    const capability = createGetMeetingChatCapability({
        store: {
            async ensureSchema() {},
            async getMeetingById(meetingId) {
                return meetingId === "meeting-1"
                    ? {
                          id: meetingId,
                          createdBy: "alice",
                          chatRoomId: "chat-1",
                      }
                    : null;
            },
        },
        profileStore: {
            async getProfile(accountId) {
                return accountId === "account-alice"
                    ? { handle: "alice" }
                    : null;
            },
        },
        profileIdentity: profileIdentityFake,
        canAccessMeeting: async (request) => {
            accessRequests.push(request);
            return authorized;
        },
        listClassroomParticipantHandles: async () => [],
        log() {},
    });
    return { accessRequests, capability };
}

test("getMeetingChat returns chat IDs only to authenticated authorized participants", async () => {
    const allowed = createCapability();
    assert.equal(
        await allowed.capability({
            claims: { sub: "account-alice" },
            meetingId: "meeting-1",
        }),
        "chat-1",
    );
    assert.equal(allowed.accessRequests.length, 1);
    assert.equal(allowed.accessRequests[0].requesterAccountId, "account-alice");

    const denied = createCapability({ authorized: false });
    assert.equal(
        await denied.capability({
            claims: { sub: "account-alice" },
            meetingId: "meeting-1",
        }),
        null,
    );
    assert.equal(await denied.capability({ meetingId: "meeting-1" }), null);
    assert.equal(
        await denied.capability({
            claims: { sub: "account-alice" },
            meetingId: "missing",
        }),
        null,
    );
});
