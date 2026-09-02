import { profileIdentityFake } from "./profile-identity-fake.js";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { JitsiMeetStore } from "../store.js";

test("reserved participants include only active presence in other meetings", async () => {
    const store = new JitsiMeetStore({
        profileIdentity: profileIdentityFake,
        db: {},
    });
    store.listActiveMeetings = async () => [
        {
            id: "current-meeting",
            endedAt: null,
            activeUsernames: ["alice"],
        },
        {
            id: "other-meeting",
            endedAt: null,
            activeUsernames: ["Bob", "bob"],
            participants: ["bob", "invited-only"],
        },
        {
            id: "ended-meeting",
            endedAt: "2026-08-30T00:00:00.000Z",
            activeUsernames: ["carol"],
        },
    ];
    store.listUpcomingMeetings = async () => {
        throw new Error("scheduled meetings must not reserve participants");
    };

    assert.deepEqual(
        await store.listReservedParticipantUsernames("current-meeting"),
        ["bob"],
    );
});

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
                const whiteboardId = command.where?.find(
                    (whereEntry) => whereEntry.column === "whiteboard_id",
                )?.value;
                if (whiteboardId) {
                    return {
                        rows: storedStateRows.filter(
                            (stateRow) =>
                                stateRow.whiteboard_id === whiteboardId,
                        ),
                    };
                }
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

test("active whiteboard mappings resolve only to an existing open meeting", async () => {
    const meetingRow = {
        id: "meeting-1",
        meeting_url: "https://meet.example/PlanningRoom",
        meeting_name: "Planning Room",
        room_slug: "PlanningRoom",
        created_by: "alice",
    };
    const activeState = {
        meeting_id: "meeting-1",
        whiteboard_id: "board-1",
        whiteboard_active: 1,
        ended_at: null,
    };
    const store = new JitsiMeetStore({
        profileIdentity: profileIdentityFake,
        db: createMockJitsiDb({
            meetingRows: [meetingRow],
            stateRows: [activeState],
        }),
    });

    const meeting = await store.getActiveMeetingByWhiteboardId("board-1");
    assert.equal(meeting?.id, "meeting-1");
    assert.equal(meeting?.createdBy, "alice");

    activeState.whiteboard_active = 0;
    assert.equal(await store.getActiveMeetingByWhiteboardId("board-1"), null);
    activeState.whiteboard_active = 1;
    activeState.ended_at = new Date().toISOString();
    assert.equal(await store.getActiveMeetingByWhiteboardId("board-1"), null);
});

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
    const firstStore = new JitsiMeetStore({
        profileIdentity: profileIdentityFake,
        db: databaseExecutor,
    });
    const secondStore = new JitsiMeetStore({
        profileIdentity: profileIdentityFake,
        db: databaseExecutor,
    });

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
    const store = new JitsiMeetStore({
        profileIdentity: profileIdentityFake,
        db: databaseExecutor,
    });

    await assert.rejects(store.ensureSchema(), /create raced/);
    await store.ensureSchema();

    assert.equal(ensureAttempts, 6);
});

test("jitsi store meeting creation uses the modern column set", async () => {
    const mockDb = createMockJitsiDb();
    const passphraseRequests = [];
    const store = new JitsiMeetStore({
        profileIdentity: profileIdentityFake,
        db: mockDb,
        generatePassphrase(options) {
            passphraseRequests.push(options);
            return "Amber-Cedar-Otter-Willow";
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
            separator: "-",
            capitalization: "titlecase",
        },
    ]);
    assert.equal(
        mockDb.insertedMeetingRows[0].meeting_name,
        "Amber-Cedar-Otter-Willow",
    );
    assert.equal(
        mockDb.insertedMeetingRows[0].room_slug,
        "Amber-Cedar-Otter-Willow",
    );
    assert.equal(
        mockDb.insertedMeetingRows[0].meeting_url,
        "https://meet.example.com/Amber-Cedar-Otter-Willow",
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

test("jitsi store gives generated meetings unique database URLs", async () => {
    const mockDb = createMockJitsiDb();
    let passphraseIndex = 0;
    const store = new JitsiMeetStore({
        profileIdentity: profileIdentityFake,
        db: mockDb,
        generatePassphrase: () =>
            ["Amber-Cedar-Otter-Willow", "Bamboo-Cloud-Finch-River"][
                passphraseIndex++
            ],
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

    assert.equal(
        mockDb.insertedMeetingRows[0].room_slug,
        "Amber-Cedar-Otter-Willow",
    );
    assert.equal(
        mockDb.insertedMeetingRows[1].room_slug,
        "Bamboo-Cloud-Finch-River",
    );
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

test("persistent meetings reuse their stored identity after store reconstruction", async () => {
    const mockDb = createMockJitsiDb();
    let generatedNames = 0;
    const createStore = () =>
        new JitsiMeetStore({
            profileIdentity: profileIdentityFake,
            db: mockDb,
            generatePassphrase: () =>
                generatedNames++ === 0
                    ? "Amber-Cedar-Otter-Willow"
                    : "Unexpected-Different-Room-Name",
        });
    const firstStore = createStore();
    const firstMeeting = await firstStore.createMeeting({
        instanceUrl: "https://meet.example.com",
        usernames: ["alice", "bob"],
        classroomId: null,
        createdBy: "alice",
        chatRoomId: null,
    });
    await firstStore.addMeetingParticipant(firstMeeting.id, "carol");

    const reconstructedStore = createStore();
    const reusedMeeting = await reconstructedStore.createMeeting({
        instanceUrl: "https://meet.example.com",
        usernames: ["alice", "bob", "carol"],
        classroomId: null,
        createdBy: "alice",
        chatRoomId: null,
    });

    assert.equal(mockDb.insertedMeetingRows.length, 1);
    assert.equal(generatedNames, 1);
    assert.equal(reusedMeeting.id, firstMeeting.id);
    assert.equal(reusedMeeting.meetingName, firstMeeting.meetingName);
    assert.equal(reusedMeeting.meetingUrl, firstMeeting.meetingUrl);
    assert.equal(reusedMeeting.reused, true);

    const freshMeeting = await reconstructedStore.createMeeting({
        instanceUrl: "https://meet.example.com",
        usernames: ["alice", "bob", "carol"],
        classroomId: null,
        createdBy: "alice",
        chatRoomId: null,
        forceNew: true,
    });
    assert.equal(mockDb.insertedMeetingRows.length, 2);
    assert.notEqual(freshMeeting.id, firstMeeting.id);
    assert.notEqual(freshMeeting.meetingName, firstMeeting.meetingName);
    assert.equal(freshMeeting.reused, false);
});

test("participant-free disposable meetings always receive distinct identities", async () => {
    const mockDb = createMockJitsiDb();
    let generatedNames = 0;
    const store = new JitsiMeetStore({
        profileIdentity: profileIdentityFake,
        db: mockDb,
        generatePassphrase: () =>
            ["Amber-Cedar-Otter-Willow", "Bamboo-Cloud-Finch-River"][
                generatedNames++
            ],
    });
    const input = {
        instanceUrl: "https://meet.example.com",
        usernames: ["alice"],
        classroomId: null,
        createdBy: "alice",
        chatRoomId: null,
    };

    const firstMeeting = await store.createMeeting(input);
    const secondMeeting = await store.createMeeting(input);

    assert.equal(mockDb.insertedMeetingRows.length, 2);
    assert.notEqual(secondMeeting.id, firstMeeting.id);
    assert.notEqual(secondMeeting.meetingName, firstMeeting.meetingName);
    assert.notEqual(secondMeeting.meetingUrl, firstMeeting.meetingUrl);
});

test("schema initialization preserves the persisted meeting identity", async () => {
    const now = new Date().toISOString();
    const meetingRow = {
        id: "meeting-1",
        participant_key: "participants",
        meeting_url: "https://meet.example.test/Persisted-Room-Name-Here",
        meeting_password: "secret",
        meeting_password_iv: "iv",
        meeting_name: "Persisted-Room-Name-Here",
        room_slug: "Persisted-Room-Name-Here",
        classroom_id: null,
        created_by: "alice",
        created_at: now,
        updated_at: now,
    };
    const store = new JitsiMeetStore({
        profileIdentity: profileIdentityFake,
        db: createMockJitsiDb({ meetingRows: [meetingRow] }),
        generatePassphrase: () => "Unused-Meeting-Name-Here",
    });

    await store.ensureSchema();

    assert.equal(meetingRow.meeting_name, "Persisted-Room-Name-Here");
    assert.equal(meetingRow.room_slug, "Persisted-Room-Name-Here");
    assert.equal(
        meetingRow.meeting_url,
        "https://meet.example.test/Persisted-Room-Name-Here",
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
    const store = new JitsiMeetStore({
        profileIdentity: profileIdentityFake,
        db: mockDb,
    });

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
    const store = new JitsiMeetStore({
        profileIdentity: profileIdentityFake,
        db: mockDb,
    });

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
    const store = new JitsiMeetStore({
        profileIdentity: profileIdentityFake,
        db: mockDb,
    });

    const meetings = await store.listActiveMeetings();

    assert.equal(meetings[0].participantCount, 3);
    assert.equal(meetings[0].invitedParticipantCount, 3);
    assert.equal(meetings[0].activeParticipantCount, 2);
    assert.equal(meetings[0].activeSessionCount, 3);
});

test("active membership changes use a meeting-scoped participant key", async () => {
    const now = new Date().toISOString();
    const meetingRow = {
        id: "meeting-1",
        participant_key: "original-key",
        meeting_url: "https://meet.example.test/Bright-Otters-Meet-Safely",
        meeting_password: "secret",
        meeting_name: "Bright-Otters-Meet-Safely",
        classroom_id: null,
        created_by: "alice",
        created_at: now,
        updated_at: now,
    };
    const store = new JitsiMeetStore({
        profileIdentity: profileIdentityFake,
        db: createMockJitsiDb({
            meetingRows: [meetingRow],
            participantRows: [
                { meeting_id: "meeting-1", username: "alice" },
                { meeting_id: "meeting-1", username: "bob" },
            ],
        }),
    });

    const updatedMeeting = await store.addMeetingParticipant(
        "meeting-1",
        "carol",
    );

    const expectedScopedKey = createHash("sha256")
        .update(
            JSON.stringify({
                classroomId: null,
                mutableMeetingId: "meeting-1",
                participants: ["alice", "bob", "carol"],
            }),
        )
        .digest("hex");
    assert.equal(meetingRow.participant_key, expectedScopedKey);
    assert.equal(updatedMeeting.meetingName, "Bright-Otters-Meet-Safely");
    assert.equal(
        updatedMeeting.meetingUrl,
        "https://meet.example.test/Bright-Otters-Meet-Safely",
    );
});
