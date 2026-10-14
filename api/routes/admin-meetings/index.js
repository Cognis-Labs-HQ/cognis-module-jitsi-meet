export function registerAdminMeetingRoutes({
    router,
    maintenance,
    readJson,
    sendError,
    requireAuth,
    sendJson,
    profileStore,
    log,
}) {
    async function withCreatorProfiles(meetings) {
        return Promise.all(
            meetings.map(async (meeting) => {
                const createdBy = String(meeting.createdBy ?? "").trim();
                const profile = createdBy
                    ? await profileStore
                          .getProfileByHandle(createdBy)
                          .catch((error) => {
                              log?.(
                                  "error",
                                  "Meeting creator profile lookup failed.",
                                  {
                                      operation: "resolve_meeting_creator",
                                      errorName: error?.name,
                                  },
                              );
                              return null;
                          })
                    : null;
                return {
                    ...meeting,
                    createdByDisplayName:
                        profile?.displayName ?? profile?.handle ?? createdBy,
                };
            }),
        );
    }

    router.get(
        "/api/v1/modules/jitsi-meet/admin/meetings",
        async (req, res) => {
            const claims = requireAuth(req, res, "admin");
            if (!claims) return;
            const meetings = await maintenance.list();
            sendJson(res, 200, { data: meetings });
        },
        { access: { minRole: "admin" } },
    );

    router.get(
        "/api/v1/modules/jitsi-meet/admin/meetings/upcoming",
        async (req, res) => {
            const claims = requireAuth(req, res, "admin");
            if (!claims) return;
            const meetings = await withCreatorProfiles(
                (await maintenance.list()).filter(
                    (meeting) => !meeting.active && !meeting.endedAt,
                ),
            );
            sendJson(res, 200, { data: meetings });
        },
        { access: { minRole: "admin" } },
    );
    for (const action of ["terminate", "delete"]) {
        router.post(
            `/api/v1/modules/jitsi-meet/admin/meetings/${action}`,
            async (req, res) => {
                const claims = requireAuth(req, res, "admin");
                if (!claims) return;
                const body = await readJson(req);
                const meetingId =
                    typeof body?.meetingId === "string"
                        ? body.meetingId.trim()
                        : "";
                const meeting = (await maintenance.list()).find(
                    (entry) => entry.id === meetingId,
                );
                if (!meeting) {
                    sendError(
                        res,
                        404,
                        "meeting_not_found",
                        "Meeting not found.",
                    );
                    return;
                }
                if (action === "delete" && meeting.active) {
                    sendError(
                        res,
                        409,
                        "meeting_active",
                        "Terminate the meeting before deleting it.",
                    );
                    return;
                }
                await maintenance[action]({ meetingId, accountId: claims.sub });
                sendJson(res, 200, { data: { completed: true } });
            },
            { access: { minRole: "admin" } },
        );
    }
}
