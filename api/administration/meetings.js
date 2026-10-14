import {
    ensureJitsiAuxiliaryTable,
    ORIGINAL_PARTICIPANTS_TABLE,
} from "../reuse/store-schema.js";
import { deleteMeetingResources } from "../reuse/meeting-resource-cleanup.js";
import {
    deleteMeetingRows,
    resetJitsiStoreSchema,
} from "../reuse/store-schema.js";
import { readDbTimestampValue } from "../reuse/timestamp.js";

/** Inspect existing records even when a new uniqueness constraint cannot initialize. */
export function registerMeetingMaintenance(ctx, databaseExecutor) {
    let pendingMutation = Promise.resolve();
    const operations = {
        async list() {
            await ensureJitsiAuxiliaryTable(
                databaseExecutor,
                ORIGINAL_PARTICIPANTS_TABLE,
            );
            return databaseExecutor.transaction(async (executor) => {
                const select = async (table, columns) =>
                    (
                        await executor.executeCommand({
                            option: "SELECT",
                            table,
                            columns,
                        })
                    ).rows ?? [];
                const meetings = await select("jitsi_meetings", [
                    "id",
                    "participant_key",
                    "meeting_url",
                    "meeting_name",
                    "chat_room_id",
                    "created_by",
                    "created_at",
                    "updated_at",
                    "scheduled_at",
                    "disposable",
                ]);
                const states = await select("jitsi_meeting_state", [
                    "meeting_id",
                    "ended_at",
                    "whiteboard_id",
                ]);
                const presence = await select("jitsi_meeting_presence", [
                    "meeting_id",
                    "username",
                    "active",
                    "last_seen_at",
                ]);
                const participants = await select(
                    "jitsi_meeting_participants",
                    ["meeting_id", "username"],
                );
                const originals = await select(
                    "jitsi_meeting_original_participants",
                    ["meeting_id", "username"],
                );
                const identity = ctx.getCapability("social:profile:identity");
                const participantKeys = new Map(
                    meetings.map((meeting) => {
                        const recorded = originals.filter(
                            (entry) => entry.meeting_id === meeting.id,
                        );
                        const roster = (
                            recorded.length
                                ? recorded
                                : participants.filter(
                                      (entry) =>
                                          entry.meeting_id === meeting.id,
                                  )
                        ).map((entry) => entry.username);
                        return [
                            meeting.id,
                            identity.normalizeHandleKeys(roster).join("\u0000"),
                        ];
                    }),
                );
                return meetings.map((meeting) => {
                    const state = states.find(
                        (entry) => entry.meeting_id === meeting.id,
                    );
                    const activeUsernames = [
                        ...new Set(
                            presence
                                .filter(
                                    (entry) =>
                                        entry.meeting_id === meeting.id &&
                                        Number(entry.active) === 1 &&
                                        Date.now() -
                                            new Date(
                                                entry.last_seen_at,
                                            ).getTime() <
                                            35000,
                                )
                                .map((entry) => entry.username),
                        ),
                    ];
                    const issues = [];
                    for (const [column, issue] of [
                        ["participant_key", "duplicateParticipants"],
                        ["meeting_url", "duplicateUrl"],
                        ["chat_room_id", "sharedChatroom"],
                    ]) {
                        if (
                            meeting[column] &&
                            meetings.some(
                                (other) =>
                                    other.id !== meeting.id &&
                                    other[column] === meeting[column],
                            )
                        )
                            issues.push(issue);
                    }
                    const participantKey = participantKeys.get(meeting.id);
                    if (
                        participantKey &&
                        meetings.some(
                            (other) =>
                                other.id !== meeting.id &&
                                participantKeys.get(other.id) ===
                                    participantKey,
                        ) &&
                        !issues.includes("duplicateParticipants")
                    )
                        issues.unshift("duplicateParticipants");
                    if (
                        state?.whiteboard_id &&
                        states.some(
                            (other) =>
                                other.meeting_id !== meeting.id &&
                                other.whiteboard_id === state.whiteboard_id,
                        )
                    )
                        issues.push("sharedWhiteboard");
                    return {
                        id: meeting.id,
                        meetingName: meeting.meeting_name,
                        meetingUrl: meeting.meeting_url,
                        chatRoomId: meeting.chat_room_id,
                        whiteboardId: state?.whiteboard_id ?? null,
                        createdBy: meeting.created_by,
                        createdAt: readDbTimestampValue(meeting.created_at),
                        updatedAt: readDbTimestampValue(meeting.updated_at),
                        endedAt: readDbTimestampValue(state?.ended_at),
                        scheduledAt: readDbTimestampValue(meeting.scheduled_at),
                        participantCount: participants.filter(
                            (entry) => entry.meeting_id === meeting.id,
                        ).length,
                        activeUsernames,
                        active: !state?.ended_at && activeUsernames.length > 0,
                        issues,
                    };
                });
            });
        },
        async terminate({ meetingId, accountId }) {
            await databaseExecutor.transaction(async (executor) => {
                await executor.executeCommand({
                    option: "UPDATE",
                    table: "jitsi_meeting_presence",
                    set: { active: 0 },
                    where: [{ column: "meeting_id", value: meetingId }],
                });
                await executor.executeCommand({
                    option: "UPDATE",
                    table: "jitsi_meeting_state",
                    set: {
                        ended_at: new Date().toISOString(),
                        ended_by: accountId,
                        whiteboard_active: 0,
                        auth_required: 0,
                    },
                    where: [{ column: "meeting_id", value: meetingId }],
                });
            });
        },
        async delete({ meetingId, accountId }) {
            const meetings = await operations.list();
            const meeting = meetings.find((entry) => entry.id === meetingId);
            if (!meeting || meeting.active)
                throw new Error(
                    "Meeting cannot be deleted while active or absent.",
                );
            await deleteMeetingResources({
                meeting: {
                    ...meeting,
                    chatRoomId: meeting.issues.includes("sharedChatroom")
                        ? null
                        : meeting.chatRoomId,
                },
                whiteboardId: meeting.issues.includes("sharedWhiteboard")
                    ? null
                    : meeting.whiteboardId,
                chatActorAccountId: accountId,
                whiteboardActorAccountId: accountId,
                resolveWhiteboardDeletion: () =>
                    ctx.getCapability("whiteboard:deleteCanvas"),
                deleteChatroom: ctx.getCapability(
                    "social:messages:deleteChatroom",
                ),
                deleteResourceShares: async ({ resourceType, resourceId }) => {
                    const shares = await ctx.getCapability(
                        "share:listByResource",
                    )({ resourceType, resourceId });
                    for (const owner of new Set(
                        shares.map((share) => share.ownerAccountId),
                    )) {
                        if (!owner)
                            throw new Error(
                                "Meeting share owner is unavailable.",
                            );
                        await ctx.getCapability("share:deleteResourceShares")({
                            ownerAccountId: owner,
                            resourceType,
                            resourceId,
                        });
                    }
                },
                log: ctx.log?.bind(ctx),
            });
            if (meeting.issues.includes("sharedChatroom")) {
                await ctx
                    .getCapability("social:messages:sourceBinding")
                    ?.release({
                        roomId: meeting.chatRoomId,
                        actorAccountId: accountId,
                        sourceType: "meeting",
                        sourceId: meetingId,
                    });
            }
            if (meeting.issues.includes("sharedWhiteboard")) {
                await ctx.getCapability("whiteboard:sourceBinding")?.release({
                    whiteboardId: meeting.whiteboardId,
                    actorAccountId: accountId,
                    sourceType: "meeting",
                    sourceId: meetingId,
                });
            }
            await databaseExecutor.transaction((executor) =>
                deleteMeetingRows(executor, meetingId),
            );
            resetJitsiStoreSchema(databaseExecutor);
        },
    };
    const actions = {};
    for (const [operation, execute] of Object.entries(operations)) {
        const flowId = `jitsi-meet:maintenance${operation[0].toUpperCase()}${operation.slice(1)}`;
        ctx.registerFlow({ id: flowId, stages: ["execute"] });
        actions[operation] = async (input) => {
            try {
                const result = await ctx.flow.run(flowId, input, {
                    handlers: {
                        execute: ({ input: parameters }) => {
                            if (operation === "list")
                                return execute(parameters);
                            const mutation = pendingMutation.then(() =>
                                execute(parameters),
                            );
                            pendingMutation = mutation.catch(() => {});
                            return mutation;
                        },
                    },
                });
                if (operation !== "list")
                    ctx.log?.("info", "Meeting maintenance completed.", {
                        operation: flowId,
                        meetingId: input.meetingId,
                        accountId: input.accountId,
                    });
                return result.stageResults.execute[0];
            } catch (error) {
                ctx.log?.("error", "Meeting maintenance failed.", {
                    operation: flowId,
                    errorName: error?.name,
                });
                throw error;
            }
        };
    }
    return actions;
}
