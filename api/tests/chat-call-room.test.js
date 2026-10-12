import assert from "node:assert/strict";
import test from "node:test";
import { JitsiMeetStore } from "../store.js";
import {
    reserveChatCallRoom,
    assignMeetingChatRoom,
} from "../reuse/chat-call-room.js";
import { findMeetingByChatRoomReference } from "../reuse/meeting-room-lookup.js";
import { profileIdentityFake } from "./profile-identity-fake.js";

function database() {
    let rows = new Map([
        [
            "jitsi_module_config",
            [{ id: "default", instance_url: "https://meet.example.test" }],
        ],
        [
            "jitsi_meetings",
            ["one", "two"].map((id) => ({
                id,
                participant_key: id,
                meeting_url: `https://meet.example.test/${id}`,
                meeting_password: "",
                chat_room_id: "shared-room",
            })),
        ],
    ]);
    const definitions = new Map();
    const keys = (definition) =>
        [
            definition.primaryKey ??
                definition.columns
                    .filter((column) => column.primaryKey)
                    .map((column) => column.name),
            ...(definition.uniqueKeys ?? []),
            ...definition.columns
                .filter((column) => column.unique)
                .map((column) => [column.name]),
        ].filter((key) => key.length);
    const check = (table, candidate, ignored) => {
        for (const key of keys(definitions.get(table))) {
            if (key.some((column) => candidate[column] == null)) continue;
            if (
                rows
                    .get(table)
                    .some(
                        (row) =>
                            row !== ignored &&
                            key.every(
                                (column) => row[column] === candidate[column],
                            ),
                    )
            )
                throw new Error("unique_conflict");
        }
    };
    const matches = (row, where = []) =>
        where.every(({ column, value }) => row[column] === value);
    return {
        rows: (table) => rows.get(table) ?? [],
        async ensureTable(definition) {
            definitions.set(definition.name, definition);
            if (!rows.has(definition.name)) rows.set(definition.name, []);
            for (const row of rows.get(definition.name))
                check(definition.name, row, row);
        },
        async transaction(operation) {
            const before = structuredClone(rows);
            try {
                return await operation(this);
            } catch (error) {
                rows = before;
                throw error;
            }
        },
        async executeCommand(command) {
            const records = rows.get(command.table) ?? [];
            if (command.option === "SELECT") {
                const selected = records.filter((row) =>
                    matches(row, command.where),
                );
                for (const ordering of [...(command.orderBy ?? [])].reverse())
                    selected.sort(
                        (left, right) =>
                            String(left[ordering.column] ?? "").localeCompare(
                                String(right[ordering.column] ?? ""),
                            ) * (ordering.direction === "DESC" ? -1 : 1),
                    );
                return {
                    rows: command.limit
                        ? selected.slice(0, command.limit)
                        : selected,
                };
            }
            if (command.option === "INSERT") {
                const target = command.conflict?.target;
                const existing =
                    target &&
                    records.find((row) =>
                        target.every(
                            (column) => row[column] === command.values[column],
                        ),
                    );
                const candidate = { ...existing, ...command.values };
                check(command.table, candidate, existing);
                if (existing) Object.assign(existing, candidate);
                else records.push(candidate);
            }
            if (command.option === "UPDATE") {
                for (const row of records.filter((row) =>
                    matches(row, command.where),
                )) {
                    check(command.table, { ...row, ...command.set }, row);
                    Object.assign(row, command.set);
                }
            }
            if (command.option === "DELETE")
                rows.set(
                    command.table,
                    records.filter((row) => !matches(row, command.where)),
                );
            return { rows: [] };
        },
    };
}

async function scenario() {
    const databaseExecutor = database();
    const store = new JitsiMeetStore({
        db: databaseExecutor,
        profileIdentity: profileIdentityFake,
        generatePassphrase: () => "Safe-Test-Call-Room",
    });
    await store.ensureSchema();
    return { databaseExecutor, store };
}

test("config remains readable with multiple saved meetings for one conversation", async () => {
    const { databaseExecutor, store } = await scenario();
    assert.equal(
        (await store.getConfig()).instanceUrl,
        "https://meet.example.test",
    );
    assert.deepEqual(
        databaseExecutor.rows("jitsi_meetings").map((row) => row.id),
        ["one", "two"],
    );
    assert.equal(
        databaseExecutor.rows("jitsi_meetings")[0].chat_room_id,
        "shared-room",
    );
});

test("current call reservations prevent competing calls and failed relinks roll back", async () => {
    const { databaseExecutor } = await scenario();
    await reserveChatCallRoom(databaseExecutor, {
        id: "one",
        disposable: true,
        chatRoomId: "first-room",
    });
    await reserveChatCallRoom(databaseExecutor, {
        id: "two",
        disposable: true,
        chatRoomId: "other-room",
    });
    await assert.rejects(
        assignMeetingChatRoom(
            databaseExecutor,
            { id: "two", disposable: true },
            "first-room",
        ),
        /unique_conflict/,
    );
    assert.equal(
        databaseExecutor
            .rows("jitsi_chat_calls")
            .find((row) => row.meeting_id === "two").chat_room_id,
        "other-room",
    );
    assert.equal(
        databaseExecutor.rows("jitsi_meetings").find((row) => row.id === "two")
            .chat_room_id,
        "shared-room",
    );
});

test("room lookup selects its current call and deletion releases the reservation", async () => {
    const { databaseExecutor, store } = await scenario();
    await reserveChatCallRoom(databaseExecutor, {
        id: "one",
        disposable: true,
        chatRoomId: "shared-room",
    });
    const current = await findMeetingByChatRoomReference({
        db: databaseExecutor,
        chatRoomId: "shared-room",
        getMeetingById: async (id) => ({ id }),
    });
    assert.equal(current.id, "one");
    await store.deleteMeeting("one");
    await reserveChatCallRoom(databaseExecutor, {
        id: "two",
        disposable: true,
        chatRoomId: "shared-room",
    });
    assert.equal(
        databaseExecutor.rows("jitsi_chat_calls")[0].meeting_id,
        "two",
    );
});

test("a rejected concurrent call creation leaves no orphan meeting rows", async () => {
    const { databaseExecutor, store } = await scenario();
    await reserveChatCallRoom(databaseExecutor, {
        id: "one",
        disposable: true,
        chatRoomId: "shared-room",
    });
    await assert.rejects(
        store.createMeeting({
            instanceUrl: "https://meet.example.test",
            usernames: ["alice", "bob"],
            createdBy: "alice",
            chatRoomId: "shared-room",
            disposable: true,
            forceNew: true,
        }),
        /unique_conflict/,
    );
    assert.deepEqual(
        databaseExecutor.rows("jitsi_meetings").map((row) => row.id),
        ["one", "two"],
    );
});
