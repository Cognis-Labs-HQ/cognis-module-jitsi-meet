import { resolveRequesterUsername } from "./reuse/requester.js";

export function registerMeetingParticipantRoutes({
    router,
    requireAuth,
    profileStore,
    profileIdentity,
    store,
    sendJson,
    sendError,
    hasMinRole,
    resolveShareGuestMeetingAccess,
    canAccessMeeting,
    listClassroomParticipantHandles,
    normalizeHandleKey,
}) {
    router.get(
        "/api/v1/modules/jitsi-meet/participants",
        async (req, res) => {
            const claims = requireAuth(req, res, "user");
            if (!claims) return;
            const requestUrl = new URL(req.url, "http://localhost");
            const meetingId = String(
                requestUrl.searchParams.get("meetingId") ?? "",
            ).trim();
            const shareGuestAccess = await resolveShareGuestMeetingAccess({
                claims,
                meetingId,
                requiredCapability: "participants:read",
            });
            if (shareGuestAccess.isGuest) {
                if (!meetingId) {
                    sendJson(res, 200, { data: [] });
                    return;
                }
                if (!shareGuestAccess.allowed) {
                    sendError(
                        res,
                        403,
                        "forbidden",
                        "Share guest access is not allowed for participants.",
                    );
                    return;
                }
                sendJson(res, 200, { data: [] });
                return;
            }
            const query = (requestUrl.searchParams.get("q") ?? "").trim();
            await store.ensureSchema();
            let authorizedMeetingId = "";
            if (meetingId) {
                const meeting = await store.getMeetingById(meetingId);
                const requesterUsername = await resolveRequesterUsername(
                    profileStore,
                    profileIdentity,
                    claims.sub,
                ).catch(() => "");
                if (
                    meeting &&
                    requesterUsername &&
                    (await canAccessMeeting({
                        store,
                        meeting,
                        username: requesterUsername,
                        listClassroomParticipantHandles,
                        profileStore,
                        requesterAccountId: claims.sub,
                    }))
                ) {
                    authorizedMeetingId = meeting.id;
                }
            }
            const reservedUsernames = new Set(
                await store.listReservedParticipantUsernames(
                    authorizedMeetingId,
                ),
            );
            const includeHidden = hasMinRole(claims.role, "admin");
            const candidates = await profileStore.searchProfiles(query, 50, {
                includeHidden,
                requesterAccountId: claims.sub,
                followingAccountId: claims.sub,
            });
            const results = candidates
                .filter((profile) => profile.accountId !== claims.sub)
                .filter(
                    (profile) =>
                        !reservedUsernames.has(
                            normalizeHandleKey(profile.handle),
                        ),
                )
                .map((profile) => ({
                    handle: profile.handle,
                    displayName: profile.displayName ?? profile.handle,
                    avatarKey: profile.avatarKey ?? null,
                }));
            sendJson(res, 200, { data: results });
        },
        { access: { minRole: "user" } },
    );
}
