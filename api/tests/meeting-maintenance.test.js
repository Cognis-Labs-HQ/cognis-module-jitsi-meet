import { profileIdentityFake } from "./profile-identity-fake.js";
import { ensureJitsiStoreSchemaOnce } from "../reuse/store-schema.js";
import assert from "node:assert/strict";
import test from "node:test";
import { registerMeetingMaintenance } from "../administration/meetings.js";
import { registerAdminMeetingRoutes } from "../routes/admin-meetings/index.js";

function fixture() {
    const tables = {
        jitsi_meetings: [
            {
                id: "first",
                participant_key: "alice,bob",
                meeting_url: "https://meet/first",
                chat_room_id: "shared",
                created_by: "alice",
            },
            {
                id: "second",
                participant_key: "alice,bob",
                meeting_url: "https://meet/second",
                chat_room_id: "shared",
                created_by: "alice",
            },
        ],
        jitsi_meeting_state: [
            { meeting_id: "first", whiteboard_id: "board" },
            { meeting_id: "second", whiteboard_id: "board" },
        ],
        jitsi_meeting_presence: [
            {
                meeting_id: "first",
                username: "alice",
                active: 1,
                last_seen_at: new Date(),
            },
        ],
        jitsi_meeting_participants: [
            { meeting_id: "first", username: "alice" },
        ],
    };
    const mutations = [];
    const flows = new Set();
    const ctx = {
        registerFlow: ({ id }) => flows.add(id),
        getCapability: (id) =>
            id === "social:profile:identity"
                ? profileIdentityFake
                : id === "share:listByResource"
                  ? async () => [{ ownerAccountId: "owner" }]
                  : id === "whiteboard:fetchBoardData"
                    ? async () => ({ createdByAccountId: "owner" })
                    : id.endsWith("sourceBinding")
                      ? {
                            release: async (input) =>
                                mutations.push({ release: input }),
                        }
                      : async (input) => mutations.push({ share: input }),
        log() {},
        flow: {
            async run(id, input, { handlers }) {
                assert.ok(flows.has(id));
                return {
                    stageResults: {
                        execute: [await handlers.execute({ input })],
                    },
                };
            },
        },
    };
    const executor = {
        async ensureTable(definition) {
            assert.equal(
                definition.name,
                "jitsi_meeting_original_participants",
            );
        },
        async transaction(callback) {
            return callback(this);
        },
        async executeCommand(command) {
            if (command.option === "SELECT")
                return { rows: tables[command.table] ?? [] };
            mutations.push(command);
            if (command.option === "DELETE")
                tables[command.table] = (tables[command.table] ?? []).filter(
                    (row) =>
                        !command.where.every(
                            ({ column, value }) => row[column] === value,
                        ),
                );
            if (command.option === "UPDATE")
                for (const row of tables[command.table] ?? []) {
                    if (
                        command.where.every(
                            ({ column, value }) => row[column] === value,
                        )
                    )
                        Object.assign(row, command.set);
                }
            return {};
        },
    };
    return {
        actions: registerMeetingMaintenance(ctx, executor),
        mutations,
        tables,
        databaseExecutor: executor,
    };
}

test("maintenance lists all meetings and flags shared resources without schema initialization", async () => {
    const { actions } = fixture();
    const rows = await actions.list();
    assert.equal(rows.length, 2);
    assert.deepEqual(rows[0].issues, [
        "duplicateParticipants",
        "sharedChatroom",
        "sharedWhiteboard",
    ]);
    assert.equal(rows[0].active, true);
    assert.equal(rows[1].active, false);
    assert.equal(rows[0].meeting_password, undefined);
});

test("termination ends presence and deletion only removes meeting-owned tables", async () => {
    const { actions, mutations } = fixture();
    await actions.terminate({ meetingId: "first", accountId: "admin" });
    assert.equal(mutations[0].set.active, 0);
    assert.ok(mutations[1].set.ended_at);
    await actions.delete({ meetingId: "second", accountId: "admin" });
    assert.equal(mutations[2].share.ownerAccountId, "owner");
    assert.equal(
        mutations.filter((command) => command.option === "DELETE").length,
        6,
    );
    for (const command of mutations.filter(
        (entry) => entry.option === "DELETE",
    ))
        assert.equal(command.where[0].value, "second");
});

test("administration rejects nonadmins before reads and rejects deleting active meetings", async () => {
    const routes = new Map();
    let authorized = false;
    let reads = 0;
    let deletes = 0;
    let errorCode;
    registerAdminMeetingRoutes({
        router: {
            get() {},
            post(path, handler, options) {
                assert.equal(options.access.minRole, "admin");
                routes.set(path, handler);
            },
        },
        maintenance: {
            list: async () => {
                reads += 1;
                return [{ id: "first", active: true }];
            },
            delete: async () => {
                deletes += 1;
            },
        },
        requireAuth: () => (authorized ? { sub: "admin" } : null),
        readJson: async () => ({ meetingId: "first" }),
        sendJson() {},
        sendError: (_response, _status, code) => {
            errorCode = code;
        },
    });
    const handler = routes.get(
        "/api/v1/modules/jitsi-meet/admin/meetings/delete",
    );
    await handler({}, {});
    assert.equal(reads, 0);
    authorized = true;
    await handler({}, {});
    assert.equal(errorCode, "meeting_active");
    assert.equal(deletes, 0);
});

test("deleting a sole reference cleans up its chat room and canvas", async () => {
    const { actions, mutations, tables } = fixture();
    tables.jitsi_meetings.shift();
    tables.jitsi_meeting_state.shift();
    await actions.delete({
        meetingId: "second",
        ownerAccountId: "owner",
        accountId: "admin",
    });
    assert.deepEqual(mutations[0].share, {
        whiteboardId: "board",
        actorAccountId: "admin",
    });
    assert.deepEqual(mutations[1].share, {
        roomId: "shared",
        actorAccountId: "admin",
    });
    assert.equal(mutations[2].share.resourceId, "second");
});

test("deleting duplicate references leaves a working survivor and cleans up the final reference", async () => {
    const { actions, mutations } = fixture();
    await actions.delete({
        meetingId: "second",
        ownerAccountId: "owner",
        accountId: "admin",
    });
    const surviving = await actions.list();
    assert.equal(surviving.length, 1);
    assert.deepEqual(surviving[0].issues, []);
    assert.equal(surviving[0].chatRoomId, "shared");
    assert.equal(surviving[0].whiteboardId, "board");
    assert.equal(mutations.filter((entry) => entry.share).length, 1);
    await actions.terminate({ meetingId: "first", accountId: "admin" });
    await actions.delete({
        meetingId: "first",
        ownerAccountId: "owner",
        accountId: "admin",
    });
    assert.deepEqual(await actions.list(), []);
    assert.ok(mutations.some((entry) => entry.share?.whiteboardId === "board"));
    assert.ok(mutations.some((entry) => entry.share?.roomId === "shared"));
});

test("deletion clears a cached uniqueness failure so schema initialization recovers", async () => {
    const { actions, tables, databaseExecutor } = fixture();
    let schemaAttempts = 0;
    databaseExecutor.ensureTable = async (definition) => {
        schemaAttempts += 1;
        if (
            definition.name === "jitsi_meetings" &&
            tables.jitsi_meetings.length > 1
        )
            throw Object.assign(new Error("duplicate room"), { code: "23505" });
    };
    await assert.rejects(
        ensureJitsiStoreSchemaOnce(databaseExecutor),
        /duplicate room/,
    );
    await assert.rejects(
        ensureJitsiStoreSchemaOnce(databaseExecutor),
        /duplicate room/,
    );
    assert.equal(schemaAttempts, 2);
    await actions.delete({
        meetingId: "second",
        ownerAccountId: "owner",
        accountId: "admin",
    });
    await ensureJitsiStoreSchemaOnce(databaseExecutor);
    assert.equal(schemaAttempts, 8);
});
