import test from "node:test";
import assert from "node:assert/strict";
import { deleteMeetingResources } from "../reuse/meeting-resource-cleanup.js";

function cleanupInput() {
    const operations = [];
    return {
        operations,
        input: {
            meeting: { id: "meeting-1", chatRoomId: "room-1" },
            whiteboardId: "board-1",
            ownerAccountId: "owner-account",
            resolveWhiteboardDeletion: () => async (parameters) =>
                operations.push(["board", parameters]),
            deleteChatroom: async (parameters) =>
                operations.push(["chat", parameters]),
            deleteResourceShares: async (parameters) =>
                operations.push(["shares", parameters]),
        },
    };
}

test("shared meeting cleanup uses owner-authorized providers before shares", async () => {
    const { input, operations } = cleanupInput();
    await deleteMeetingResources(input);
    assert.deepEqual(operations, [
        ["board", { whiteboardId: "board-1", actorAccountId: "owner-account" }],
        ["chat", { roomId: "room-1", actorAccountId: "owner-account" }],
        [
            "shares",
            {
                ownerAccountId: "owner-account",
                resourceType: "meeting",
                resourceId: "meeting-1",
            },
        ],
    ]);
});

test("provider failure prevents later cleanup and propagates for the owning transaction", async () => {
    const { input, operations } = cleanupInput();
    input.resolveWhiteboardDeletion = () => async () => {
        throw new Error("permission denied");
    };
    await assert.rejects(deleteMeetingResources(input), /permission denied/);
    assert.deepEqual(operations, []);
});
