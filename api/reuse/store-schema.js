import { refreshGeneratedMeetingNames } from "../meeting-name-store.js";
import {
    deriveScopedKey,
    encryptPayload,
    getDataEncryptionKey,
} from "./crypto.js";

export async function ensureJitsiStoreSchema({ db, generatePassphrase, log }) {
    await db.ensureTable({
        name: "jitsi_module_config",
        columns: [
            { name: "id", type: "text", primaryKey: true },
            { name: "instance_url", type: "text" },
            {
                name: "updated_at",
                type: "timestamp",
                notNull: true,
                default: "now",
            },
        ],
    });

    await db.ensureTable({
        name: "jitsi_meetings",
        columns: [
            { name: "id", type: "text", primaryKey: true },
            {
                name: "participant_key",
                type: "text",
                unique: true,
                notNull: true,
            },
            {
                name: "meeting_url",
                type: "text",
                unique: true,
                notNull: true,
            },
            { name: "meeting_password", type: "text", notNull: true },
            { name: "meeting_password_iv", type: "text" },
            {
                name: "meeting_name",
                type: "text",
                notNull: true,
                default: "",
            },
            { name: "room_slug", type: "text", notNull: true },
            { name: "chat_room_id", type: "text" },
            { name: "classroom_id", type: "text" },
            { name: "created_by", type: "text", notNull: true },
            { name: "scheduled_at", type: "timestamp" },
            {
                name: "created_at",
                type: "timestamp",
                notNull: true,
                default: "now",
            },
            {
                name: "updated_at",
                type: "timestamp",
                notNull: true,
                default: "now",
            },
        ],
    });

    await db.ensureTable({
        name: "jitsi_meeting_participants",
        columns: [
            { name: "meeting_id", type: "text", notNull: true },
            { name: "username", type: "text", notNull: true },
            {
                name: "added_at",
                type: "timestamp",
                notNull: true,
                default: "now",
            },
            { name: "password_delivered_at", type: "timestamp" },
        ],
        primaryKey: ["meeting_id", "username"],
    });

    await db.ensureTable({
        name: "jitsi_meeting_state",
        columns: [
            { name: "meeting_id", type: "text", primaryKey: true },
            { name: "instance_id", type: "text" },
            { name: "first_joined_by", type: "text" },
            { name: "first_joined_at", type: "timestamp" },
            {
                name: "auth_required",
                type: "integer",
                notNull: true,
                default: 0,
            },
            { name: "auth_started_by", type: "text" },
            { name: "auth_started_at", type: "timestamp" },
            { name: "auth_completed_at", type: "timestamp" },
            { name: "ended_by", type: "text" },
            { name: "ended_at", type: "timestamp" },
            { name: "whiteboard_id", type: "text" },
            { name: "whiteboard_disposable", type: "integer" },
            {
                name: "whiteboard_active",
                type: "integer",
                notNull: true,
                default: 0,
            },
            {
                name: "screen_sharing_active",
                type: "integer",
                notNull: true,
                default: 0,
            },
            { name: "whiteboard_open_votes", type: "text" },
            {
                name: "updated_at",
                type: "timestamp",
                notNull: true,
                default: "now",
            },
        ],
    });

    await db.ensureTable({
        name: "jitsi_meeting_presence",
        columns: [
            { name: "meeting_id", type: "text", notNull: true },
            { name: "username", type: "text", notNull: true },
            { name: "session_id", type: "text", notNull: true },
            { name: "active", type: "integer", notNull: true, default: 1 },
            {
                name: "last_seen_at",
                type: "timestamp",
                notNull: true,
                default: "now",
            },
        ],
        primaryKey: ["meeting_id", "username", "session_id"],
    });

    const meetings = await db.executeCommand({
        option: "SELECT",
        table: "jitsi_meetings",
        columns: [
            "id",
            "meeting_url",
            "meeting_name",
            "meeting_password",
            "meeting_password_iv",
        ],
    });
    await refreshGeneratedMeetingNames({
        db: db,
        meetings: meetings.rows ?? [],
        generatePassphrase: generatePassphrase,
        log: log,
    });
    for (const meeting of meetings.rows ?? []) {
        if (
            !meeting.id ||
            !meeting.meeting_password ||
            meeting.meeting_password_iv
        )
            continue;
        const wrapper = await deriveScopedKey(
            `jitsi:meeting:${String(meeting.id)}:password`,
            getDataEncryptionKey(),
        );
        const encryptedPassword = await encryptPayload(
            wrapper,
            String(meeting.meeting_password),
        );
        await db.executeCommand({
            option: "UPDATE",
            table: "jitsi_meetings",
            set: {
                meeting_password: encryptedPassword.ciphertext,
                meeting_password_iv: encryptedPassword.iv,
            },
            where: [{ column: "id", value: meeting.id }],
        });
    }
}
