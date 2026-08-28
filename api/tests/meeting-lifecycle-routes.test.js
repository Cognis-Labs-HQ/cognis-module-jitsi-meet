import test from "node:test";
import assert from "node:assert/strict";
import {
    deleteDisposableMeeting,
    registerMeetingLifecycleRoutes,
} from "../meeting-lifecycle-routes.js";

function createRecorder() {
    return {
        status: 0,
        body: null,
        writeHead(status) {
            this.status = status;
        },
        end(body) {
            this.body = body ? JSON.parse(body) : null;
        },
    };
}

test("disposable meeting deletion erases its creator's associated chat", async () => {
    const operations = [];
    const meeting = { id: "meeting-1", chatRoomId: "chat-1" };

    await deleteDisposableMeeting({
        meeting,
        ownerAccountId: "account-1",
        deleteResourceShares: async (input) => {
            operations.push(["delete_shares", input]);
        },
        deleteChatRoom: async (input) => {
            operations.push(["delete_chat", input]);
        },
        store: {
            deleteMeeting: async (meetingId) => {
                operations.push(["delete_meeting", meetingId]);
            },
        },
        log: (level, message, metadata) => {
            operations.push(["log", level, message, metadata]);
        },
    });

    assert.deepEqual(operations, [
        [
            "delete_shares",
            {
                ownerAccountId: "account-1",
                resourceType: "meeting",
                resourceId: "meeting-1",
            },
        ],
        ["delete_chat", { roomId: "chat-1", ownerAccountId: "account-1" }],
        ["delete_meeting", "meeting-1"],
        [
            "log",
            "info",
            "Disposable meeting data deleted.",
            {
                component: "jitsi-meet-module",
                operation: "delete_disposable_meeting",
                meetingId: "meeting-1",
                chatRoomId: "chat-1",
                ownerAccountId: "account-1",
            },
        ],
    ]);
});

test("a chat deletion failure preserves the disposable meeting record", async () => {
    const deletedMeetingIds = [];
    const logs = [];

    await assert.rejects(
        deleteDisposableMeeting({
            meeting: { id: "meeting-1", chatRoomId: "chat-1" },
            ownerAccountId: "account-1",
            deleteChatRoom: async () => {
                throw new Error("messages unavailable");
            },
            store: {
                deleteMeeting: async (meetingId) => {
                    deletedMeetingIds.push(meetingId);
                },
            },
            log: (...entry) => logs.push(entry),
        }),
        /messages unavailable/,
    );

    assert.deepEqual(deletedMeetingIds, []);
    assert.equal(logs[0][0], "error");
    assert.equal(logs[0][2].operation, "delete_disposable_meeting_chat");
    assert.equal(logs[0][2].meetingId, "meeting-1");
    assert.equal(logs[0][2].chatRoomId, "chat-1");
});
