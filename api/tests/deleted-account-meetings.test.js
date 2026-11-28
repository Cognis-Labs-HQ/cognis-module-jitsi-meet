import test from "node:test";
import assert from "node:assert/strict";
import { JitsiMeetStore } from "../store.js";
import { profileIdentityFake } from "./profile-identity-fake.js";
import { registerPersistedMeetingRoutes } from "../routes/persisted-meeting/index.js";

for (const ownership of ["deleted", "bob", "departed"]) {
    test(`account deletion retains usable meetings with a surviving owner (${ownership})`, async () => {
        const meetings = new Map([
            [
                "keep",
                {
                    id: "keep",
                    classroom_id: null,
                    created_by: ownership === "bob" ? "bob" : "deleted",
                    chat_room_id: "room-keep",
                },
            ],
            ["delete", { id: "delete", classroom_id: null }],
        ]);
        const currentParticipants = [
            ...(ownership === "departed"
                ? []
                : [{ meeting_id: "keep", username: "deleted" }]),
            { meeting_id: "keep", username: "alice" },
            { meeting_id: "keep", username: "bob" },
            { meeting_id: "delete", username: "deleted" },
            { meeting_id: "delete", username: "alice" },
        ];
        const originalParticipants = currentParticipants.map((row) => ({
            ...row,
        }));
        const deletedCommands = [];
        const databaseExecutor = {
            async transaction(callback) {
                return callback(this);
            },
            async executeCommand(command) {
                const rowsFor = (rows) =>
                    rows.filter((row) =>
                        (command.where ?? []).every(
                            ({ column, value }) => row[column] === value,
                        ),
                    );
                if (command.option === "SELECT") {
                    if (command.table === "jitsi_meeting_participants") {
                        return { rows: rowsFor(currentParticipants) };
                    }
                    if (
                        command.table === "jitsi_meeting_original_participants"
                    ) {
                        return { rows: rowsFor(originalParticipants) };
                    }
                    if (command.table === "jitsi_meetings") {
                        return { rows: rowsFor([...meetings.values()]) };
                    }
                }
                if (command.option === "DELETE") {
                    deletedCommands.push(command);
                    const rows =
                        command.table === "jitsi_meeting_participants"
                            ? currentParticipants
                            : command.table ===
                                "jitsi_meeting_original_participants"
                              ? originalParticipants
                              : null;
                    if (rows) {
                        for (
                            let index = rows.length - 1;
                            index >= 0;
                            index -= 1
                        ) {
                            if (
                                (command.where ?? []).every(
                                    ({ column, value }) =>
                                        rows[index][column] === value,
                                )
                            ) {
                                rows.splice(index, 1);
                            }
                        }
                    }
                    if (command.table === "jitsi_meetings") {
                        meetings.delete(command.where[0].value);
                    }
                    return { rows: [] };
                }
                if (
                    command.option === "UPDATE" &&
                    command.table === "jitsi_meetings"
                ) {
                    Object.assign(
                        meetings.get(command.where[0].value),
                        command.set,
                    );
                    return { rows: [] };
                }
                return { rows: [] };
            },
        };
        const store = new JitsiMeetStore({
            profileIdentity: profileIdentityFake,
            db: databaseExecutor,
        });

        const result = await store.removeDeletedAccountFromMeetings("DELETED");

        assert.deepEqual(result, {
            updatedMeetingIds: ["keep"],
            deletedMeetingIds: ["delete"],
        });
        assert.deepEqual(
            originalParticipants.filter(
                ({ meeting_id }) => meeting_id === "keep",
            ),
            [
                { meeting_id: "keep", username: "alice" },
                { meeting_id: "keep", username: "bob" },
            ],
        );
        assert.equal(meetings.has("delete"), false);
        assert.ok(
            deletedCommands.some(
                ({ table, where }) =>
                    table === "jitsi_chat_calls" && where[0].value === "delete",
            ),
        );
        assert.ok(meetings.get("keep").participant_key);
        assert.equal(
            meetings.get("keep").created_by,
            ownership === "bob" ? "bob" : "alice",
        );
        assert.equal(meetings.get("keep").chat_room_id, "room-keep");
        assert.ok(
            deletedCommands.some(
                ({ table, where }) =>
                    table === "jitsi_meeting_original_participants" &&
                    where[0].column === "username",
            ),
        );

        let leave;
        const removed = [];
        registerPersistedMeetingRoutes({
            router: {
                post: (_path, handler) => {
                    leave = handler;
                },
            },
            store: {
                ensureSchema: async () => {},
                listActiveMeetings: async () => [],
                removeMeetingParticipant: async (...args) => removed.push(args),
            },
            profileStore: {
                getProfileByHandle: async (handle) =>
                    handle === "deleted"
                        ? null
                        : { accountId: `account-${handle}` },
            },
            profileIdentity: profileIdentityFake,
            requireAuth: () => ({ sub: "account-bob", role: "user" }),
            readJson: async () => ({}),
            resolveMeetingPayload: async () => ({
                meeting: {
                    id: "keep",
                    createdBy: meetings.get("keep").created_by,
                    chatRoomId: "room-keep",
                },
                requesterUsername: "bob",
                participants: ["alice", "bob"],
            }),
            groupChatMembership: { remove: async () => {} },
            sendJson: (res, status) => {
                res.status = status;
            },
            sendError: (res, status, code) => {
                Object.assign(res, { status, code });
            },
        });
        const response = {};
        await leave({}, response);
        assert.equal(response.status, 200);
        assert.deepEqual(removed, [["keep", "bob"]]);
    });
}
