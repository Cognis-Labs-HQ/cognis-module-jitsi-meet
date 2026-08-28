import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { JitsiMeetStore } from "../store.js";

function createMockJitsiDb({
    meetingRows = [],
    participantRows = [],
    presenceRows = [],
    stateRows = [],
} = {}) {
    const storedMeetingRows = [...meetingRows];
    const storedParticipantRows = [...participantRows];
    const storedPresenceRows = [...presenceRows];
    const storedStateRows = [...stateRows];
    const insertedMeetingRows = [];

    return {
        insertedMeetingRows,
        async ensureTable() {},
        async transaction(callback) {
            return callback(this);
        },
        async executeCommand(command) {
            if (
                command.option === "UPDATE" &&
                command.table === "jitsi_meetings"
            ) {
                const meetingId = command.where?.find(
                    (whereEntry) => whereEntry.column === "id",
                )?.value;
                const meetingRow = storedMeetingRows.find(
                    (storedMeetingRow) => storedMeetingRow.id === meetingId,
                );
                Object.assign(meetingRow ?? {}, command.set);
                return { rows: [] };
            }

            if (
                command.option === "UPDATE" &&
                command.table === "jitsi_meeting_participants"
            ) {
                const meetingId = command.where?.find(
                    (whereEntry) => whereEntry.column === "meeting_id",
                )?.value;
                const username = command.where?.find(
                    (whereEntry) => whereEntry.column === "username",
                )?.value;
                const participantRow = storedParticipantRows.find(
                    (row) =>
                        row.meeting_id === meetingId &&
                        row.username === username,
                );
                Object.assign(participantRow ?? {}, command.set);
                return { rows: [] };
            }

            if (
                command.option === "SELECT" &&
                command.table === "jitsi_meetings" &&
                !command.where
            ) {
                return { rows: storedMeetingRows };
            }

            if (
                command.option === "SELECT" &&
                command.table === "jitsi_meetings" &&
                command.where?.some(
                    (whereEntry) => whereEntry.column === "participant_key",
                )
            ) {
                const participantKey = command.where.find(
                    (whereEntry) => whereEntry.column === "participant_key",
                )?.value;
                return {
                    rows: storedMeetingRows.filter(
                        (meetingRow) =>
                            meetingRow.participant_key === participantKey,
                    ),
                };
            }

            if (
                command.option === "SELECT" &&
                command.table === "jitsi_meetings" &&
                command.where?.some((whereEntry) => whereEntry.column === "id")
            ) {
                const meetingId = command.where.find(
                    (whereEntry) => whereEntry.column === "id",
                )?.value;
                return {
                    rows: storedMeetingRows.filter(
                        (meetingRow) => meetingRow.id === meetingId,
                    ),
                };
            }

            if (
                command.option === "SELECT" &&
                command.table === "jitsi_meeting_participants"
            ) {
                const meetingId = command.where?.find(
                    (whereEntry) => whereEntry.column === "meeting_id",
                )?.value;
                return {
                    rows: storedParticipantRows
                        .filter(
                            (participantRow) =>
                                participantRow.meeting_id === meetingId,
                        )
                        .map((participantRow) => ({ ...participantRow })),
                };
            }

            if (
                command.option === "SELECT" &&
                command.table === "jitsi_meeting_presence"
            ) {
                const meetingId = command.where?.find(
                    (whereEntry) => whereEntry.column === "meeting_id",
                )?.value;
                return {
                    rows: storedPresenceRows.filter(
                        (presenceRow) => presenceRow.meeting_id === meetingId,
                    ),
                };
            }

            if (
                command.option === "SELECT" &&
                command.table === "jitsi_meeting_state"
            ) {
                const meetingId = command.where?.find(
                    (whereEntry) => whereEntry.column === "meeting_id",
                )?.value;
                return {
                    rows: storedStateRows.filter(
                        (stateRow) => stateRow.meeting_id === meetingId,
                    ),
                };
            }

            if (
                command.option === "INSERT" &&
                command.table === "jitsi_meetings"
            ) {
                insertedMeetingRows.push(command.values);
                storedMeetingRows.push(command.values);
                return { rows: [] };
            }

            if (
                command.option === "INSERT" &&
                command.table === "jitsi_meeting_participants"
            ) {
                storedParticipantRows.push(command.values);
                return { rows: [] };
            }

            if (
                command.option === "INSERT" &&
                command.table === "jitsi_meeting_state"
            ) {
                return { rows: [] };
            }

            return { rows: [] };
        },
    };
}

test("schema initialization is shared across concurrent store instances", async () => {
    const ensuredTables = [];
    let releaseFirstTable;
    const firstTableBlocked = new Promise((resolve) => {
        releaseFirstTable = resolve;
    });
    const databaseExecutor = {
        async ensureTable(definition) {
            ensuredTables.push(definition.name);
            if (ensuredTables.length === 1) await firstTableBlocked;
        },
        async executeCommand() {
            return { rows: [] };
        },
    };
    const firstStore = new JitsiMeetStore({ db: databaseExecutor });
    const secondStore = new JitsiMeetStore({ db: databaseExecutor });

    const firstInitialization = firstStore.ensureSchema();
    await Promise.resolve();
    const secondInitialization = secondStore.ensureSchema();
    releaseFirstTable();
    await Promise.all([firstInitialization, secondInitialization]);

    assert.deepEqual(ensuredTables, [
        "jitsi_module_config",
        "jitsi_meetings",
        "jitsi_meeting_participants",
        "jitsi_meeting_state",
        "jitsi_meeting_presence",
    ]);
});

test("schema initialization can retry after a failed create", async () => {
    let ensureAttempts = 0;
    const databaseExecutor = {
        async ensureTable() {
            ensureAttempts += 1;
            if (ensureAttempts === 1) throw new Error("create raced");
        },
        async executeCommand() {
            return { rows: [] };
        },
    };
    const store = new JitsiMeetStore({ db: databaseExecutor });

    await assert.rejects(store.ensureSchema(), /create raced/);
    await store.ensureSchema();

    assert.equal(ensureAttempts, 6);
});

test("jitsi store meeting creation uses the modern column set", async () => {
    const mockDb = createMockJitsiDb();
    const passphraseRequests = [];
    const store = new JitsiMeetStore({
        db: mockDb,
        generatePassphrase(options) {
            passphraseRequests.push(options);
            return "Amber Cedar Otter Willow";
        },
    });

    await store.ensureSchema();
    const createdMeeting = await store.createMeeting({
        instanceUrl: "https://meet.example.com",
        usernames: ["alice", "bob", "carol"],
        classroomId: null,
        createdBy: "alice",
        chatRoomId: null,
        scheduledAt: "2026-08-01T09:30:00.000Z",
    });

    assert.equal(mockDb.insertedMeetingRows.length, 1);
    assert.ok(mockDb.insertedMeetingRows[0].participant_key);
    assert.ok(mockDb.insertedMeetingRows[0].meeting_url);
    assert.equal(mockDb.insertedMeetingRows[0].room_slug, "");
    assert.ok(mockDb.insertedMeetingRows[0].meeting_password_iv);
    assert.notEqual(
        mockDb.insertedMeetingRows[0].meeting_password,
        createdMeeting?.meetingPassword,
    );
    assert.equal(
        mockDb.insertedMeetingRows[0].scheduled_at,
        "2026-08-01T09:30:00.000Z",
    );
    assert.equal(createdMeeting?.scheduledAt, "2026-08-01T09:30:00.000Z");
    assert.deepEqual(passphraseRequests, [
        {
            words: 4,
            separator: " ",
            capitalization: "titlecase",
        },
    ]);
    assert.match(
        mockDb.insertedMeetingRows[0].meeting_name,
        /^[A-Z][a-z]+(?: [A-Z][a-z]+){3}$/,
    );
    assert.equal(
        mockDb.insertedMeetingRows[0].meeting_url,
        `https://meet.example.com/#cognisMeeting=${createdMeeting.id}`,
    );
    const capturedMeeting = await store.captureMeetingIdentity(
        createdMeeting.id,
        "BrightOttersMeetSafely",
        "https://meet.example.com",
    );
    assert.equal(capturedMeeting.roomSlug, "BrightOttersMeetSafely");
    assert.equal(
        capturedMeeting.meetingName,
        mockDb.insertedMeetingRows[0].meeting_name,
    );
    assert.equal(
        capturedMeeting.meetingUrl,
        "https://meet.example.com/BrightOttersMeetSafely",
    );
    assert.equal(createdMeeting?.reused, false);
    assert.equal(
        await store.claimMeetingPassword(createdMeeting.id, "alice"),
        createdMeeting.meetingPassword,
    );
    assert.equal(
        await store.claimMeetingPassword(createdMeeting.id, "alice"),
        createdMeeting.meetingPassword,
    );
    await store.acknowledgeMeetingPassword(createdMeeting.id, "alice");
    assert.equal(
        await store.claimMeetingPassword(createdMeeting.id, "alice"),
        null,
    );
});

test("jitsi store gives pending meetings unique database URLs", async () => {
    const mockDb = createMockJitsiDb();
    const store = new JitsiMeetStore({
        db: mockDb,
        generatePassphrase: () => "Amber Cedar Otter Willow",
    });

    await store.ensureSchema();
    const firstMeeting = await store.createMeeting({
        instanceUrl: "https://meet.example.com",
        usernames: ["alice", "bob"],
        classroomId: null,
        createdBy: "alice",
        chatRoomId: null,
    });
    const secondMeeting = await store.createMeeting({
        instanceUrl: "https://meet.example.com",
        usernames: ["alice", "carol"],
        classroomId: null,
        createdBy: "alice",
        chatRoomId: null,
    });

    assert.equal(mockDb.insertedMeetingRows[0].room_slug, "");
    assert.equal(mockDb.insertedMeetingRows[1].room_slug, "");
    assert.notEqual(firstMeeting.meetingUrl, secondMeeting.meetingUrl);
    assert.equal(
        new URL(firstMeeting.meetingUrl).origin,
        "https://meet.example.com",
    );
    assert.equal(
        new URL(secondMeeting.meetingUrl).origin,
        "https://meet.example.com",
    );
});

test("jitsi store reconnects a reused meeting to its resolved chat room", async () => {
    const participantKey = createHash("sha256")
        .update(
            JSON.stringify({
                classroomId: null,
                participants: ["alice", "bob"],
            }),
        )
        .digest("hex");
    const mockDb = createMockJitsiDb({
        meetingRows: [
            {
                id: "meeting-1",
                participant_key: participantKey,
                meeting_url: "https://meet.example.com/classroom-existing",
                meeting_password: "secret",
                meeting_name: "Cognis Classroom",
                room_slug: "classroom-existing",
                chat_room_id: "deleted-room",
                classroom_id: null,
                created_by: "alice",
                scheduled_at: "2026-08-01T09:30:00.000Z",
                created_at: "2026-08-01T09:30:00.000Z",
                updated_at: "2026-08-01T09:30:00.000Z",
            },
        ],
        participantRows: [
            { meeting_id: "meeting-1", username: "alice" },
            { meeting_id: "meeting-1", username: "bob" },
        ],
    });
    const store = new JitsiMeetStore({ db: mockDb });

    const meeting = await store.createMeeting({
        instanceUrl: "https://meet.example.com",
        usernames: ["alice", "bob"],
        classroomId: null,
        createdBy: "alice",
        chatRoomId: "resolved-room",
    });

    assert.equal(meeting?.reused, true);
    assert.equal(meeting?.chatRoomId, "resolved-room");
    assert.equal(mockDb.insertedMeetingRows.length, 0);
    assert.equal(
        (await store.getMeetingById("meeting-1"))?.chatRoomId,
        "resolved-room",
    );
});

test("jitsi store meeting state backfill writes an ISO timestamp when the driver returns Date objects", async () => {
    const updateCommands = [];
    const mockDb = {
        async ensureTable() {},
        async transaction(callback) {
            return callback(this);
        },
        async executeCommand(command) {
            if (
                command.option === "SELECT" &&
                command.table === "jitsi_meeting_state"
            ) {
                return {
                    rows: [
                        {
                            meeting_id: "meeting-1",
                            instance_id: null,
                            updated_at: new Date("2026-07-12T10:49:45.000Z"),
                        },
                    ],
                };
            }
            if (
                command.option === "UPDATE" &&
                command.table === "jitsi_meeting_state"
            ) {
                updateCommands.push(command);
            }
            return { rows: [] };
        },
    };
    const store = new JitsiMeetStore({ db: mockDb });

    await store.getMeetingState("meeting-1");

    assert.equal(updateCommands.length, 1);
    const isoTimestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    assert.match(updateCommands[0].set.updated_at, isoTimestampPattern);
});

test("jitsi store config change invalidates existing meeting rows", async () => {
    const commands = [];
    const mockDb = {
        async ensureTable() {},
        async transaction(callback) {
            return callback(this);
        },
        async executeCommand(command) {
            commands.push(command);
            if (
                command.option === "SELECT" &&
                command.table === "jitsi_module_config"
            ) {
                return {
                    rows: [
                        {
                            instance_url: "https://old.example.com",
                            updated_at: "2026-01-01T00:00:00.000Z",
                        },
                    ],
                };
            }
            return { rows: [] };
        },
    };
    const store = new JitsiMeetStore({ db: mockDb });

    const saved = await store.saveConfig({
        instanceUrl: "https://new.example.com",
    });

    assert.equal(saved.invalidatedMeetings, true);
    assert.deepEqual(
        commands
            .filter((command) => command.option === "DELETE")
            .map((command) => command.table),
        [
            "jitsi_meeting_presence",
            "jitsi_meeting_state",
            "jitsi_meeting_participants",
            "jitsi_meetings",
        ],
    );
});

test("jitsi active meeting summaries report invited and active participants separately", async () => {
    const now = new Date().toISOString();
    const mockDb = createMockJitsiDb({
        meetingRows: [
            {
                id: "meeting-1",
                meeting_url: "https://meet.example.test/team-room",
                meeting_name: "Team Room",
                classroom_id: null,
                created_by: "alice",
                created_at: now,
                updated_at: now,
            },
        ],
        participantRows: [
            { meeting_id: "meeting-1", username: "alice" },
            { meeting_id: "meeting-1", username: "bob" },
            { meeting_id: "meeting-1", username: "carol" },
        ],
        presenceRows: [
            {
                meeting_id: "meeting-1",
                username: "alice",
                session_id: "session-1",
                active: 1,
                last_seen_at: now,
            },
            {
                meeting_id: "meeting-1",
                username: "alice",
                session_id: "session-2",
                active: 1,
                last_seen_at: now,
            },
            {
                meeting_id: "meeting-1",
                username: "bob",
                session_id: "session-3",
                active: 1,
                last_seen_at: now,
            },
        ],
        stateRows: [{ meeting_id: "meeting-1" }],
    });
    const store = new JitsiMeetStore({ db: mockDb });

    const meetings = await store.listActiveMeetings();

    assert.equal(meetings[0].participantCount, 3);
    assert.equal(meetings[0].invitedParticipantCount, 3);
    assert.equal(meetings[0].activeParticipantCount, 2);
    assert.equal(meetings[0].activeSessionCount, 3);
});
