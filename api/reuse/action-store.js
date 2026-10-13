const ACTION_METHODS = [
    "getConfig",
    "saveConfig",
    "deleteConfig",
    "deleteAllData",
    "getMeetingById",
    "getMeetingByChatRoomId",
    "deleteMeeting",
    "listParticipants",
    "listOriginalParticipants",
    "addMeetingParticipant",
    "removeMeetingParticipant",
    "removeDeletedAccountFromMeetings",
    "resetKeyringDelivery",
    "findMeetingByParticipants",
    "setMeetingChatRoomId",
    "createMeeting",
    "claimMeetingPassword",
    "acknowledgeMeetingPassword",
    "getMeetingState",
    "getActiveMeetingByWhiteboardId",
    "updateMeetingState",
    "upsertPresence",
    "setUserSessionsInactive",
    "setOtherSessionsInactive",
    "listPresence",
    "getActiveSessionsForUser",
    "listActiveMeetings",
    "listUpcomingMeetings",
    "listReservedParticipantUsernames",
];

/** Bind module operations to scoped flows; internal store calls retain their transaction. */
export function registerJitsiActionStore(ctx, store) {
    const actions = Object.create(store);
    for (const method of ACTION_METHODS) {
        const flowId = `jitsi-meet:${method}`;
        ctx.registerFlow({
            id: flowId,
            description: `Execute Jitsi Meet ${method}.`,
            stages: ["initialize-store", "execute-action"],
        });
        actions[method] = async (...args) => {
            try {
                const result = await ctx.flow.run(
                    flowId,
                    { parameters: args },
                    {
                        handlers: {
                            "initialize-store": () => store.ensureSchema(),
                            "execute-action": ({ input }) => {
                                if (!ctx.flow.exists(flowId)) {
                                    throw new Error(
                                        `Jitsi action is no longer active: ${flowId}`,
                                    );
                                }
                                return store[method](...input.parameters);
                            },
                        },
                    },
                );
                const values = result.stageResults?.["execute-action"];
                if (!Array.isArray(values) || values.length === 0) {
                    throw new Error(`Jitsi action did not execute: ${flowId}`);
                }
                if (!/^(get|list|find)/.test(method)) {
                    ctx.log?.("info", "Jitsi action completed.", {
                        operation: flowId,
                    });
                }
                return values[0];
            } catch (error) {
                ctx.log?.("error", "Jitsi action failed.", {
                    operation: flowId,
                    errorName: error?.name,
                });
                throw error;
            }
        };
    }
    return actions;
}
