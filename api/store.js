import { createHash, randomBytes, randomUUID } from "node:crypto";
import {
    extractUrlOrigin,
    extractUrlPathSlug,
    normalizeHttpUrl,
} from "./reuse/url-parts.js";
import { buildMeetingName } from "./meeting-values.js";
import { generateMeetingName } from "./meeting-name.js";
import { readDbTimestampValue } from "./reuse/timestamp.js";
import {
    decryptPayload,
    deriveScopedKey,
    encryptPayload,
    getDataEncryptionKey,
} from "./reuse/crypto.js";
import { ensureJitsiStoreSchema } from "./reuse/store-schema.js";

const AUTH_WAIT_TIMEOUT_MS = 2 * 60 * 1000;
const ACTIVE_PRESENCE_WINDOW_MS = 120 * 1000;
const schemaInitializationByExecutor = new WeakMap();

function buildParticipantKey(
    normalizeHandleKeys,
    usernames,
    classroomId = null,
    mutableMeetingId = null,
) {
    const payload = JSON.stringify({
        classroomId: classroomId ? String(classroomId) : null,
        ...(mutableMeetingId
            ? { mutableMeetingId: String(mutableMeetingId) }
            : {}),
        participants: normalizeHandleKeys(usernames),
    });
    return createHash("sha256").update(payload).digest("hex");
}

export class JitsiMeetStore {
    constructor({ db, log, generatePassphrase, profileIdentity }) {
        this.db = db;
        this.log = log;
        this.generatePassphrase = generatePassphrase;
        this.normalizeHandleKey =
            profileIdentity.normalizeHandleKey.bind(profileIdentity);
        this.normalizeHandleKeys =
            profileIdentity.normalizeHandleKeys.bind(profileIdentity);
    }

    async ensureSchema() {
        const existingInitialization = schemaInitializationByExecutor.get(
            this.db,
        );
        if (existingInitialization) return existingInitialization;
        const initialization = this.ensureSchemaTables().catch((error) => {
            if (
                schemaInitializationByExecutor.get(this.db) === initialization
            ) {
                schemaInitializationByExecutor.delete(this.db);
            }
            throw error;
        });
        schemaInitializationByExecutor.set(this.db, initialization);
        return initialization;
    }

    async ensureSchemaTables() {
        await ensureJitsiStoreSchema({
            db: this.db,
        });
    }

    async getConfig() {
        const result = await this.db.executeCommand({
            option: "SELECT",
            table: "jitsi_module_config",
            where: [{ column: "id", value: "default" }],
            limit: 1,
        });
        const row = result.rows?.[0];
        return {
            instanceUrl: row?.instance_url ? String(row.instance_url) : "",
            updatedAt: readDbTimestampValue(row?.updated_at),
        };
    }

    async saveConfig({ instanceUrl }) {
        const normalizedInstanceUrl = normalizeHttpUrl(instanceUrl);
        const previousConfig = await this.getConfig();
        const updatedAt = new Date().toISOString();
        const instanceChanged = Boolean(
            previousConfig.instanceUrl &&
            previousConfig.instanceUrl !== normalizedInstanceUrl,
        );

        await this.db.transaction(async (executor) => {
            if (instanceChanged) {
                for (const table of [
                    "jitsi_meeting_presence",
                    "jitsi_meeting_state",
                    "jitsi_meeting_participants",
                    "jitsi_meetings",
                ]) {
                    await executor.executeCommand({
                        option: "DELETE",
                        table,
                    });
                }
            }
            await executor.executeCommand({
                option: "INSERT",
                table: "jitsi_module_config",
                values: {
                    id: "default",
                    instance_url: normalizedInstanceUrl,
                    updated_at: updatedAt,
                },
                conflict: {
                    action: "update",
                    target: ["id"],
                },
            });
        });

        return {
            instanceUrl: normalizedInstanceUrl ?? "",
            updatedAt,
            invalidatedMeetings: instanceChanged,
        };
    }

    async deleteConfig() {
        await this.db.executeCommand({
            option: "DELETE",
            table: "jitsi_module_config",
            where: [{ column: "id", value: "default" }],
        });
    }

    async deleteAllData() {
        for (const table of [
            "jitsi_meeting_presence",
            "jitsi_meeting_state",
            "jitsi_meeting_participants",
            "jitsi_meetings",
            "jitsi_module_config",
        ]) {
            await this.db.executeCommand({ option: "DELETE", table });
        }
    }

    async getMeetingById(meetingId) {
        const result = await this.db.executeCommand({
            option: "SELECT",
            table: "jitsi_meetings",
            where: [{ column: "id", value: meetingId }],
            limit: 1,
        });
        const row = result.rows?.[0];
        if (!row) return null;
        const participants = await this.listParticipants(meetingId);
        const participantKey =
            row.participant_key ??
            buildParticipantKey(
                this.normalizeHandleKeys,
                participants,
                row.classroom_id ?? null,
            );
        const meetingPassword = row.meeting_password_iv
            ? await decryptPayload(
                  await deriveScopedKey(
                      `jitsi:meeting:${String(row.id)}:password`,
                      getDataEncryptionKey(),
                  ),
                  String(row.meeting_password_iv),
                  String(row.meeting_password),
              )
            : String(row.meeting_password ?? "");
        return {
            id: String(row.id),
            participantKey: String(participantKey),
            meetingUrl: row.meeting_url ? String(row.meeting_url) : "",
            roomSlug: row.room_slug ? String(row.room_slug) : "",
            meetingPassword,
            meetingName: buildMeetingName(row.meeting_name),
            chatRoomId: row.chat_room_id ? String(row.chat_room_id) : null,
            classroomId: row.classroom_id ? String(row.classroom_id) : null,
            createdBy: row.created_by ? String(row.created_by) : "",
            scheduledAt:
                readDbTimestampValue(row.scheduled_at) ??
                readDbTimestampValue(row.created_at),
            createdAt: readDbTimestampValue(row.created_at),
            updatedAt: readDbTimestampValue(row.updated_at),
        };
    }

    async getMeetingByChatRoomId(chatRoomId) {
        if (!chatRoomId) return null;
        const result = await this.db.executeCommand({
            option: "SELECT",
            table: "jitsi_meetings",
            where: [{ column: "chat_room_id", value: chatRoomId }],
            limit: 1,
        });
        const row = result.rows?.[0];
        if (!row?.id) return null;
        return this.getMeetingById(String(row.id));
    }

    async deleteMeeting(meetingId) {
        const normalizedMeetingId = String(meetingId ?? "").trim();
        if (!normalizedMeetingId) return false;
        await this.db.transaction(async (executor) => {
            for (const table of [
                "jitsi_meeting_presence",
                "jitsi_meeting_state",
                "jitsi_meeting_participants",
                "jitsi_meetings",
            ]) {
                await executor.executeCommand({
                    option: "DELETE",
                    table,
                    where: [
                        {
                            column:
                                table === "jitsi_meetings"
                                    ? "id"
                                    : "meeting_id",
                            value: normalizedMeetingId,
                        },
                    ],
                });
            }
        });
        return true;
    }

    async listParticipants(meetingId) {
        const result = await this.db.executeCommand({
            option: "SELECT",
            table: "jitsi_meeting_participants",
            where: [{ column: "meeting_id", value: meetingId }],
            orderBy: [{ column: "username", direction: "ASC" }],
        });
        return (result.rows ?? []).map((row) => String(row.username));
    }

    async addMeetingParticipant(meetingId, username, { chatRoomId } = {}) {
        const normalizedUsername = this.normalizeHandleKey(username);
        if (!normalizedUsername) return this.getMeetingById(meetingId);
        const participants = this.normalizeHandleKeys([
            ...(await this.listParticipants(meetingId)),
            normalizedUsername,
        ]);
        const meeting = await this.getMeetingById(meetingId);
        if (!meeting) return null;
        const updatedAt = new Date().toISOString();
        await this.db.transaction(async (executor) => {
            await executor.executeCommand({
                option: "INSERT",
                table: "jitsi_meeting_participants",
                values: {
                    meeting_id: meetingId,
                    username: normalizedUsername,
                    added_at: updatedAt,
                },
                conflict: { action: "ignore" },
            });
            await executor.executeCommand({
                option: "UPDATE",
                table: "jitsi_meetings",
                set: {
                    participant_key: buildParticipantKey(
                        this.normalizeHandleKeys,
                        participants,
                        meeting.classroomId,
                        meetingId,
                    ),
                    ...(chatRoomId ? { chat_room_id: chatRoomId } : {}),
                    updated_at: updatedAt,
                },
                where: [{ column: "id", value: meetingId }],
            });
        });
        return this.getMeetingById(meetingId);
    }

    async removeMeetingParticipant(meetingId, username) {
        const normalizedUsername = this.normalizeHandleKey(username);
        const meeting = await this.getMeetingById(meetingId);
        if (!meeting || !normalizedUsername) return meeting;
        const participants = (await this.listParticipants(meetingId)).filter(
            (participant) => participant !== normalizedUsername,
        );
        await this.db.transaction(async (executor) => {
            await executor.executeCommand({
                option: "DELETE",
                table: "jitsi_meeting_participants",
                where: [
                    { column: "meeting_id", value: meetingId },
                    { column: "username", value: normalizedUsername },
                ],
            });
            await executor.executeCommand({
                option: "UPDATE",
                table: "jitsi_meetings",
                set: {
                    participant_key: buildParticipantKey(
                        this.normalizeHandleKeys,
                        participants,
                        meeting.classroomId,
                        meetingId,
                    ),
                    updated_at: new Date().toISOString(),
                },
                where: [{ column: "id", value: meetingId }],
            });
        });
        return this.getMeetingById(meetingId);
    }

    async findMeetingByParticipants(usernames, classroomId = null) {
        const normalizedUsernames = this.normalizeHandleKeys(usernames);
        if (normalizedUsernames.length <= 1) return null;
        const normalizedClassroomId = classroomId
            ? String(classroomId).trim() || null
            : null;
        const participantKey = buildParticipantKey(
            this.normalizeHandleKeys,
            normalizedUsernames,
            normalizedClassroomId,
        );
        const result = await this.db.executeCommand({
            option: "SELECT",
            table: "jitsi_meetings",
            where: [{ column: "participant_key", value: participantKey }],
            limit: 1,
        });
        let row = result.rows?.[0];
        if (!row) {
            const candidates = await this.db.executeCommand({
                option: "SELECT",
                table: "jitsi_meetings",
                orderBy: [{ column: "updated_at", direction: "DESC" }],
                limit: 200,
            });
            for (const candidate of candidates.rows ?? []) {
                const candidateClassroomId = candidate.classroom_id
                    ? String(candidate.classroom_id)
                    : null;
                if (candidateClassroomId !== normalizedClassroomId) continue;
                const candidateUsernames = this.normalizeHandleKeys(
                    await this.listParticipants(String(candidate.id)),
                );
                if (
                    candidateUsernames.length === normalizedUsernames.length &&
                    candidateUsernames.every(
                        (username, index) =>
                            username === normalizedUsernames[index],
                    )
                ) {
                    row = candidate;
                    break;
                }
            }
        }
        if (!row) return null;
        const meeting = await this.getMeetingById(String(row.id));
        if (!meeting?.meetingUrl || !meeting.meetingPassword) {
            return null;
        }
        return meeting;
    }

    async setMeetingChatRoomId(meetingId, chatRoomId) {
        const normalizedChatRoomId = String(chatRoomId ?? "").trim();
        if (!normalizedChatRoomId) return this.getMeetingById(meetingId);
        await this.db.executeCommand({
            option: "UPDATE",
            table: "jitsi_meetings",
            set: {
                chat_room_id: normalizedChatRoomId,
                updated_at: new Date().toISOString(),
            },
            where: [{ column: "id", value: meetingId }],
        });
        return this.getMeetingById(meetingId);
    }

    async createMeeting({
        instanceUrl,
        usernames,
        classroomId,
        createdBy,
        chatRoomId,
        scheduledAt,
    }) {
        const normalizedInstanceUrl = normalizeHttpUrl(instanceUrl);
        if (!normalizedInstanceUrl) {
            throw new Error(
                "A valid Jitsi instance URL is required before creating meetings.",
            );
        }
        const participantUsernames = this.normalizeHandleKeys(usernames);
        const normalizedClassroomId =
            typeof classroomId === "string" && classroomId.trim().length > 0
                ? classroomId.trim()
                : null;
        const existing = await this.findMeetingByParticipants(
            participantUsernames,
            normalizedClassroomId,
        );
        if (existing) {
            const normalizedChatRoomId = chatRoomId ?? null;
            if (
                normalizedChatRoomId &&
                existing.chatRoomId !== normalizedChatRoomId
            ) {
                await this.db.executeCommand({
                    option: "UPDATE",
                    table: "jitsi_meetings",
                    set: {
                        chat_room_id: normalizedChatRoomId,
                        updated_at: new Date().toISOString(),
                    },
                    where: [{ column: "id", value: existing.id }],
                });
            }
            return {
                ...(existing ?? {}),
                chatRoomId: normalizedChatRoomId ?? existing.chatRoomId,
                reused: true,
            };
        }

        const meetingId = randomUUID();
        const meetingName = generateMeetingName(this.generatePassphrase);
        const meetingSlug = meetingName;
        const meetingUrl = `${normalizedInstanceUrl}/${meetingSlug}`;
        const meetingPassword = randomBytes(12).toString("base64url");
        const passwordWrapper = await deriveScopedKey(
            `jitsi:meeting:${meetingId}:password`,
            getDataEncryptionKey(),
        );
        const encryptedPassword = await encryptPayload(
            passwordWrapper,
            meetingPassword,
        );
        const participantKey = buildParticipantKey(
            this.normalizeHandleKeys,
            participantUsernames,
            normalizedClassroomId,
        );
        const createdAt = new Date().toISOString();
        const normalizedScheduledAt = Number.isFinite(
            Date.parse(String(scheduledAt ?? "")),
        )
            ? new Date(scheduledAt).toISOString()
            : createdAt;
        await this.db.transaction(async (executor) => {
            const meetingValues = {
                id: meetingId,
                participant_key: participantKey,
                meeting_url: meetingUrl,
                meeting_password: encryptedPassword.ciphertext,
                meeting_password_iv: encryptedPassword.iv,
                meeting_name: meetingName,
                room_slug: meetingSlug,
                chat_room_id: chatRoomId ?? null,
                classroom_id: normalizedClassroomId,
                created_by: createdBy,
                scheduled_at: normalizedScheduledAt,
                created_at: createdAt,
                updated_at: createdAt,
            };
            await executor.executeCommand({
                option: "INSERT",
                table: "jitsi_meetings",
                values: meetingValues,
            });

            for (const username of participantUsernames) {
                await executor.executeCommand({
                    option: "INSERT",
                    table: "jitsi_meeting_participants",
                    values: {
                        meeting_id: meetingId,
                        username,
                        added_at: createdAt,
                    },
                    conflict: { action: "ignore" },
                });
            }

            await executor.executeCommand({
                option: "INSERT",
                table: "jitsi_meeting_state",
                values: {
                    meeting_id: meetingId,
                    instance_id: randomUUID(),
                    auth_required: 0,
                    updated_at: createdAt,
                },
                conflict: {
                    action: "update",
                    target: ["meeting_id"],
                },
            });
        });

        const createdMeeting = await this.getMeetingById(meetingId);
        return {
            ...(createdMeeting ?? {}),
            reused: false,
        };
    }

    async claimMeetingPassword(meetingId, username) {
        return this.db.transaction(async (executor) => {
            const result = await executor.executeCommand({
                option: "SELECT",
                table: "jitsi_meeting_participants",
                columns: ["password_delivered_at"],
                where: [
                    { column: "meeting_id", value: meetingId },
                    { column: "username", value: username },
                ],
                limit: 1,
            });
            if (!result.rows?.[0] || result.rows[0].password_delivered_at) {
                return null;
            }
            const meetingResult = await executor.executeCommand({
                option: "SELECT",
                table: "jitsi_meetings",
                columns: ["meeting_password", "meeting_password_iv"],
                where: [{ column: "id", value: meetingId }],
                limit: 1,
            });
            const meeting = meetingResult.rows?.[0];
            if (!meeting?.meeting_password) return null;
            const meetingPassword = meeting.meeting_password_iv
                ? await decryptPayload(
                      await deriveScopedKey(
                          `jitsi:meeting:${meetingId}:password`,
                          getDataEncryptionKey(),
                      ),
                      String(meeting.meeting_password_iv),
                      String(meeting.meeting_password),
                  )
                : String(meeting.meeting_password);
            return meetingPassword;
        });
    }

    async acknowledgeMeetingPassword(meetingId, username) {
        await this.db.executeCommand({
            option: "UPDATE",
            table: "jitsi_meeting_participants",
            set: { password_delivered_at: new Date().toISOString() },
            where: [
                { column: "meeting_id", value: meetingId },
                { column: "username", value: username },
                { column: "password_delivered_at", value: null },
            ],
        });
    }

    async getMeetingState(meetingId) {
        const result = await this.db.executeCommand({
            option: "SELECT",
            table: "jitsi_meeting_state",
            where: [{ column: "meeting_id", value: meetingId }],
            limit: 1,
        });
        const row = result.rows?.[0];
        if (!row) {
            return {
                meetingId,
                instanceId: randomUUID(),
                firstJoinedBy: null,
                firstJoinedAt: null,
                authRequired: false,
                authStartedBy: null,
                authStartedAt: null,
                authCompletedAt: null,
                updatedAt: null,
                endedBy: null,
                endedAt: null,
                whiteboardId: null,
                whiteboardDisposable: null,
                whiteboardActive: false,
                screenSharingActive: false,
                whiteboardOpenVotes: [],
            };
        }
        const instanceId = row.instance_id
            ? String(row.instance_id)
            : randomUUID();
        if (!row.instance_id) {
            await this.db.executeCommand({
                option: "UPDATE",
                table: "jitsi_meeting_state",
                set: {
                    instance_id: instanceId,
                    updated_at: row.updated_at
                        ? readDbTimestampValue(row.updated_at)
                        : new Date().toISOString(),
                },
                where: [{ column: "meeting_id", value: meetingId }],
            });
        }
        return {
            meetingId,
            instanceId,
            firstJoinedBy: row.first_joined_by
                ? String(row.first_joined_by)
                : null,
            firstJoinedAt: readDbTimestampValue(row.first_joined_at),
            authRequired: Number(row.auth_required ?? 0) === 1,
            authStartedBy: row.auth_started_by
                ? String(row.auth_started_by)
                : null,
            authStartedAt: readDbTimestampValue(row.auth_started_at),
            authCompletedAt: readDbTimestampValue(row.auth_completed_at),
            updatedAt: readDbTimestampValue(row.updated_at),
            endedBy: row.ended_by ? String(row.ended_by) : null,
            endedAt: readDbTimestampValue(row.ended_at),
            whiteboardId: row.whiteboard_id ? String(row.whiteboard_id) : null,
            whiteboardDisposable:
                row.whiteboard_disposable == null
                    ? null
                    : Number(row.whiteboard_disposable) === 1,
            whiteboardActive: Number(row.whiteboard_active ?? 0) === 1,
            screenSharingActive: Number(row.screen_sharing_active ?? 0) === 1,
            whiteboardOpenVotes: JSON.parse(
                row.whiteboard_open_votes ?? "[]",
            ).map(String),
        };
    }

    async getActiveMeetingByWhiteboardId(whiteboardId) {
        const { rows = [] } = await this.db.executeCommand({
            option: "SELECT",
            table: "jitsi_meeting_state",
            where: [{ column: "whiteboard_id", value: whiteboardId }],
        });
        const activeMappings = rows.filter(
            (row) => Number(row.whiteboard_active) === 1 && !row.ended_at,
        );
        if (activeMappings.length !== 1) return null;
        const id = String(activeMappings[0].meeting_id ?? "").trim();
        return this.getMeetingById(id);
    }

    async updateMeetingState(meetingId, updates) {
        const merged = {
            ...(await this.getMeetingState(meetingId)),
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        await this.db.executeCommand({
            option: "INSERT",
            table: "jitsi_meeting_state",
            values: {
                meeting_id: meetingId,
                instance_id: merged.instanceId,
                first_joined_by: merged.firstJoinedBy,
                first_joined_at: merged.firstJoinedAt,
                auth_required: merged.authRequired ? 1 : 0,
                auth_started_by: merged.authStartedBy,
                auth_started_at: merged.authStartedAt,
                auth_completed_at: merged.authCompletedAt,
                updated_at: merged.updatedAt,
                ended_by: merged.endedBy,
                ended_at: merged.endedAt,
                whiteboard_id: merged.whiteboardId,
                whiteboard_disposable:
                    merged.whiteboardDisposable == null
                        ? null
                        : merged.whiteboardDisposable
                          ? 1
                          : 0,
                whiteboard_active: merged.whiteboardActive ? 1 : 0,
                screen_sharing_active: merged.screenSharingActive ? 1 : 0,
                whiteboard_open_votes: JSON.stringify(
                    merged.whiteboardOpenVotes ?? [],
                ),
            },
            conflict: {
                action: "update",
                target: ["meeting_id"],
            },
        });
        return merged;
    }

    async upsertPresence(meetingId, username, sessionId, active = true) {
        const timestamp = new Date().toISOString();
        await this.db.executeCommand({
            option: "INSERT",
            table: "jitsi_meeting_presence",
            values: {
                meeting_id: meetingId,
                username,
                session_id: sessionId,
                active: active ? 1 : 0,
                last_seen_at: timestamp,
            },
            conflict: {
                action: "update",
                target: ["meeting_id", "username", "session_id"],
            },
        });
        return timestamp;
    }

    async setUserSessionsInactive(meetingId, username, keepSessionId = null) {
        const presenceRows = await this.db.executeCommand({
            option: "SELECT",
            table: "jitsi_meeting_presence",
            where: [
                { column: "meeting_id", value: meetingId },
                { column: "username", value: username },
            ],
        });

        for (const row of presenceRows.rows ?? []) {
            const sessionId = String(row.session_id ?? "");
            if (!sessionId || sessionId === keepSessionId) continue;
            await this.db.executeCommand({
                option: "UPDATE",
                table: "jitsi_meeting_presence",
                set: {
                    active: 0,
                    last_seen_at: new Date().toISOString(),
                },
                where: [
                    { column: "meeting_id", value: meetingId },
                    { column: "username", value: username },
                    { column: "session_id", value: sessionId },
                ],
            });
        }
    }

    async setOtherSessionsInactive(meetingId, username, keepSessionId) {
        await this.setUserSessionsInactive(meetingId, username, keepSessionId);
    }

    async listPresence(meetingId) {
        const result = await this.db.executeCommand({
            option: "SELECT",
            table: "jitsi_meeting_presence",
            where: [{ column: "meeting_id", value: meetingId }],
            orderBy: [{ column: "last_seen_at", direction: "DESC" }],
        });
        return (result.rows ?? []).map((row) => ({
            meetingId: String(row.meeting_id),
            username: String(row.username),
            sessionId: String(row.session_id),
            active: Number(row.active ?? 0) === 1,
            lastSeenAt: readDbTimestampValue(row.last_seen_at),
        }));
    }

    isPresenceEntryCurrent(entry, referenceTime = Date.now()) {
        if (!entry?.active) return false;
        const seenAt = Date.parse(entry.lastSeenAt);
        return Number.isFinite(seenAt)
            ? seenAt >= referenceTime - ACTIVE_PRESENCE_WINDOW_MS
            : false;
    }

    filterCurrentPresenceEntries(entries, referenceTime = Date.now()) {
        return (Array.isArray(entries) ? entries : []).filter((entry) =>
            this.isPresenceEntryCurrent(entry, referenceTime),
        );
    }

    async getActiveSessionsForUser(meetingId, username, sessionId) {
        const presence = await this.listPresence(meetingId);
        return this.filterCurrentPresenceEntries(presence).filter((entry) => {
            if (entry.username !== username) return false;
            if (sessionId && entry.sessionId === sessionId) return false;
            return true;
        });
    }

    async listActiveMeetings() {
        const meetingsResult = await this.db.executeCommand({
            option: "SELECT",
            table: "jitsi_meetings",
            orderBy: [{ column: "updated_at", direction: "DESC" }],
            limit: 200,
        });
        const rows = meetingsResult.rows ?? [];
        const mappedMeetings = await Promise.all(
            rows.map(async (row) => {
                if (!row.meeting_url) {
                    return null;
                }
                const meeting = {
                    id: String(row.id),
                    meetingUrl: String(row.meeting_url),
                    meetingName: buildMeetingName(row.meeting_name),
                    classroomId: row.classroom_id
                        ? String(row.classroom_id)
                        : null,
                    createdBy: String(row.created_by),
                    scheduledAt:
                        readDbTimestampValue(row.scheduled_at) ??
                        readDbTimestampValue(row.created_at),
                    createdAt: readDbTimestampValue(row.created_at),
                    updatedAt: readDbTimestampValue(row.updated_at),
                };
                const [presence, participants, state] = await Promise.all([
                    this.listPresence(meeting.id),
                    this.listParticipants(meeting.id),
                    this.getMeetingState(meeting.id),
                ]);
                const activePresence =
                    this.filterCurrentPresenceEntries(presence);
                if (activePresence.length === 0) return null;
                return {
                    id: meeting.id,
                    meetingUrl: meeting.meetingUrl,
                    roomSlug: extractUrlPathSlug(meeting.meetingUrl),
                    meetingName: meeting.meetingName,
                    classroomId: meeting.classroomId,
                    createdBy: meeting.createdBy,
                    scheduledAt: meeting.scheduledAt,
                    createdAt: meeting.createdAt,
                    participantCount: participants.length,
                    invitedParticipantCount: participants.length,
                    activeParticipantCount: new Set(
                        activePresence.map((entry) => entry.username),
                    ).size,
                    activeSessionCount: activePresence.length,
                    activeUsernames: Array.from(
                        new Set(activePresence.map((entry) => entry.username)),
                    ).sort(),
                    authRequired: state.authRequired,
                    authCompleted: Boolean(state.authCompletedAt),
                    startedBy: state.firstJoinedBy,
                    endedBy: state.endedBy,
                    endedAt: state.endedAt,
                    updatedAt: meeting.updatedAt,
                };
            }),
        );
        return mappedMeetings.filter(Boolean);
    }

    /**
     * Determines whether the current participant may initiate meeting auth.
     * Priority is granted to the first joiner for two minutes; after timeout,
     * any participant may initiate if auth is still pending.
     */
    canCurrentUserInitiateAuth(state, currentUsername) {
        if (!state.authRequired) return false;
        if (state.authCompletedAt) return false;
        const now = Date.now();
        if (!state.authStartedBy) {
            if (!state.firstJoinedAt) return true;
            if (state.firstJoinedBy === currentUsername) return true;
            const firstJoinAtMs = Date.parse(state.firstJoinedAt);
            if (!Number.isFinite(firstJoinAtMs)) return true;
            return now - firstJoinAtMs >= AUTH_WAIT_TIMEOUT_MS;
        }
        if (state.authStartedBy === currentUsername) return true;
        const authStartMs = Date.parse(state.authStartedAt ?? "");
        if (!Number.isFinite(authStartMs)) return false;
        return now - authStartMs >= AUTH_WAIT_TIMEOUT_MS;
    }

    buildMeetingPayload(meeting, participants, state, extra = {}) {
        return {
            id: meeting.id,
            meetingUrl: meeting.meetingUrl,
            meetingName: meeting.meetingName,
            meetingPassword: extra.meetingPassword ?? "",
            classroomId: meeting.classroomId,
            chatRoomId: meeting.chatRoomId,
            createdBy: meeting.createdBy,
            hasInvitedParticipants: participants.some(
                (username) => username !== meeting.createdBy,
            ),
            participants,
            state: {
                authRequired: state.authRequired,
                authStartedBy: state.authStartedBy,
                authStartedAt: state.authStartedAt,
                authCompletedAt: state.authCompletedAt,
                firstJoinedBy: state.firstJoinedBy,
                firstJoinedAt: state.firstJoinedAt,
                endedBy: state.endedBy,
                endedAt: state.endedAt,
                screenSharingActive: state.screenSharingActive,
                ...(state.whiteboardId
                    ? {
                          whiteboardId: state.whiteboardId,
                          whiteboardDisposable: state.whiteboardDisposable,
                          whiteboardOpen: state.whiteboardActive,
                      }
                    : {}),
            },
            scheduledAt: meeting.scheduledAt ?? meeting.createdAt,
            instanceUrl: extractUrlOrigin(meeting.meetingUrl),
            roomSlug: extractUrlPathSlug(meeting.meetingUrl),
            ...extra,
        };
    }

    async listUpcomingMeetings() {
        const meetingsResult = await this.db.executeCommand({
            option: "SELECT",
            table: "jitsi_meetings",
            orderBy: [{ column: "scheduled_at", direction: "ASC" }],
            limit: 100,
        });
        const rows = meetingsResult.rows ?? [];
        const mappedMeetings = await Promise.all(
            rows.map(async (row) => {
                if (!row.meeting_url) {
                    return null;
                }
                const meeting = {
                    id: String(row.id),
                    meetingUrl: String(row.meeting_url),
                    meetingName: buildMeetingName(row.meeting_name),
                    createdBy: String(row.created_by),
                    scheduledAt:
                        readDbTimestampValue(row.scheduled_at) ??
                        readDbTimestampValue(row.created_at),
                    createdAt: readDbTimestampValue(row.created_at),
                };
                const [presence, participants, state] = await Promise.all([
                    this.listPresence(meeting.id),
                    this.listParticipants(meeting.id),
                    this.getMeetingState(meeting.id),
                ]);
                const activePresence =
                    this.filterCurrentPresenceEntries(presence);
                if (activePresence.length > 0) return null;
                if (state.endedAt) return null;
                return {
                    id: meeting.id,
                    meetingUrl: meeting.meetingUrl,
                    meetingName: meeting.meetingName,
                    createdBy: meeting.createdBy,
                    scheduledAt: meeting.scheduledAt,
                    createdAt: meeting.createdAt,
                    participantCount: participants.length,
                    invitedParticipantCount: participants.length,
                    activeParticipantCount: new Set(
                        activePresence.map((entry) => entry.username),
                    ).size,
                };
            }),
        );
        return mappedMeetings
            .filter(Boolean)
            .sort((left, right) =>
                String(left.scheduledAt ?? "").localeCompare(
                    String(right.scheduledAt ?? ""),
                ),
            );
    }

    async listReservedParticipantUsernames(excludedMeetingId = "") {
        const activeMeetings = await this.listActiveMeetings();
        return this.normalizeHandleKeys(
            activeMeetings
                .filter(
                    (meeting) =>
                        !meeting.endedAt && meeting.id !== excludedMeetingId,
                )
                .flatMap((meeting) => meeting.activeUsernames ?? []),
        );
    }

    normalizeMeetingCreationInput({
        participants,
        classroomId,
        creatorUsername,
    }) {
        const normalizedParticipants = this.normalizeHandleKeys([
            ...(Array.isArray(participants) ? participants : []),
            creatorUsername,
        ]);
        return {
            participantUsernames: normalizedParticipants,
            classroomId:
                typeof classroomId === "string" && classroomId.trim().length > 0
                    ? classroomId.trim()
                    : null,
        };
    }
}
