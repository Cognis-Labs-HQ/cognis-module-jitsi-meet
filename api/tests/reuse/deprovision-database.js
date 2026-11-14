import assert from "node:assert/strict";

/** In-memory executor for the public database commands used by real Jitsi stores. */
export function createDeprovisionDatabase(effects) {
    const tables = new Map();
    const commands = [];
    const schemas = [];
    const rows = (table) => {
        if (!tables.has(table)) tables.set(table, []);
        return tables.get(table);
    };
    const database = {
        async ensureTable(definition) {
            schemas.push(definition.name);
            rows(definition.name);
        },
        async transaction(callback) {
            const snapshot = structuredClone(tables);
            try {
                return await callback(database);
            } catch (error) {
                tables.clear();
                for (const [table, records] of snapshot)
                    tables.set(table, records);
                throw error;
            }
        },
        async executeCommand(command) {
            commands.push(command);
            const records = rows(command.table);
            const matches = (row) =>
                (command.where ?? []).every(
                    ({ column, value }) => row[column] === value,
                );
            if (command.option === "SELECT") {
                const selected = records
                    .filter(matches)
                    .map((row) => ({ ...row }));
                return {
                    rows: command.limit
                        ? selected.slice(0, command.limit)
                        : selected,
                };
            }
            assert.ok(
                ["UPDATE", "DELETE"].includes(command.option),
                command.option,
            );
            effects.push({ kind: "database", command });
            if (command.option === "UPDATE") {
                for (const row of records.filter(matches))
                    Object.assign(row, command.set);
            } else {
                for (let index = records.length - 1; index >= 0; index--) {
                    if (matches(records[index])) records.splice(index, 1);
                }
            }
            return { rows: [] };
        },
    };

    function seedMeeting(id, { owner, participants, whiteboard = true } = {}) {
        rows("jitsi_meetings").push({
            id,
            created_by: owner,
            chat_room_id: `room-${id}`,
            classroom_id: null,
        });
        rows("jitsi_meeting_state").push({
            meeting_id: id,
            whiteboard_id: whiteboard ? `board-${id}` : null,
        });
        rows("jitsi_chat_calls").push({ meeting_id: id });
        for (const table of [
            "jitsi_meeting_participants",
            "jitsi_meeting_original_participants",
            "jitsi_meeting_presence",
        ]) {
            for (const username of participants)
                rows(table).push({ meeting_id: id, username });
        }
    }

    return { database, rows, commands, schemas, seedMeeting };
}
