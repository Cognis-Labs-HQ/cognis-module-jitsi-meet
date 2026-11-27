import { readJson } from "../../reuse/http.js";
import { resolveRequesterUsername } from "../../reuse/requester.js";
import { resolveStore } from "../../reuse/store-runtime.js";

function sendJson(response, status, payload) {
    response.writeHead(status, { "content-type": "application/json" });
    response.end(JSON.stringify(payload));
}

function sendError(response, status, code, message) {
    sendJson(response, status, { error: { code, message } });
}

/**
 * Resolves optional expiry-hours input into the flow payload format.
 *
 * Returns:
 * - an ISO timestamp string when the input is a valid positive number
 * - an empty string when expiry is intentionally omitted
 * - null when the input is present but invalid
 *
 * @param {unknown} hoursValue
 * @returns {string | null}
 */
function resolveExpiry(hoursValue) {
    if (
        hoursValue === null ||
        hoursValue === undefined ||
        String(hoursValue).trim() === ""
    ) {
        return "";
    }
    const parsed = Number(hoursValue);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return null;
    }
    return new Date(Date.now() + parsed * 60 * 60 * 1000).toISOString();
}

async function requireOwnedMeeting({
    meetingId,
    claims,
    profileStore,
    profileIdentity,
    store,
    res: response,
}) {
    const meeting = await store.getMeetingById(meetingId);
    if (!meeting) {
        sendError(response, 404, "not_found", "Meeting not found.");
        return null;
    }
    if (meeting.disposable) {
        sendError(
            response,
            403,
            "sharing_disabled",
            "Disposable meetings cannot be shared.",
        );
        return null;
    }
    const requesterUsername = await resolveRequesterUsername(
        profileStore,
        profileIdentity,
        claims.sub,
    ).catch(() => "");
    const participantUsernames = requesterUsername
        ? await store.listParticipants(meeting.id)
        : [];
    const hasMeetingAccess =
        requesterUsername &&
        (requesterUsername === meeting.createdBy ||
            participantUsernames.includes(requesterUsername));
    if (!hasMeetingAccess) {
        sendError(
            response,
            403,
            "forbidden",
            "Only current meeting participants may share this meeting.",
        );
        return null;
    }
    return meeting;
}

export function registerMeetingShareRoutes({
    router,
    ctx,
    requireAuth,
    profileStore,
}) {
    const databaseExecutor = ctx.getCapability("db:executor");
    const log = ctx.getCapability("logging:log");
    const listSharesByResource = ctx.getCapability("share:listByResource");
    if (
        !databaseExecutor ||
        !profileStore ||
        !ctx.flow ||
        typeof listSharesByResource !== "function"
    ) {
        router.get(
            "/api/v1/modules/jitsi-meet/share",
            async (_request, response) => {
                sendError(
                    response,
                    503,
                    "service_unavailable",
                    "Share capabilities are unavailable.",
                );
            },
            { access: { minRole: "user" } },
        );
        router.post(
            "/api/v1/modules/jitsi-meet/share",
            async (_request, response) => {
                sendError(
                    response,
                    503,
                    "service_unavailable",
                    "Share capabilities are unavailable.",
                );
            },
            { access: { minRole: "user" } },
        );
        router.post(
            "/api/v1/modules/jitsi-meet/share/delete",
            async (_request, response) => {
                sendError(
                    response,
                    503,
                    "service_unavailable",
                    "Share capabilities are unavailable.",
                );
            },
            { access: { minRole: "user" } },
        );
        return;
    }

    const store = resolveStore(
        databaseExecutor,
        log,
        ctx.getCapability("reuse:generatePassphrase"),
        ctx.getCapability("social:profile:identity"),
    );

    router.get(
        "/api/v1/modules/jitsi-meet/share",
        async (request, response) => {
            const claims = requireAuth(request, response, "user");
            if (!claims) return;
            await store.ensureSchema();
            const url = new URL(request.url, "http://localhost");
            const meetingId = String(
                url.searchParams.get("meetingId") ?? "",
            ).trim();
            if (!meetingId) {
                sendError(
                    response,
                    400,
                    "bad_request",
                    "meetingId is required.",
                );
                return;
            }
            const meeting = await requireOwnedMeeting({
                meetingId,
                claims,
                profileStore,
                profileIdentity: ctx.getCapability("social:profile:identity"),
                store,
                res: response,
            });
            if (!meeting) return;
            const shares = await listSharesByResource({
                resourceType: "meeting",
                resourceId: meeting.id,
            });
            sendJson(response, 200, { data: shares });
        },
        { access: { minRole: "user" } },
    );

    router.post(
        "/api/v1/modules/jitsi-meet/share",
        async (request, response) => {
            const claims = requireAuth(request, response, "user");
            if (!claims) return;
            await store.ensureSchema();
            const body = await readJson(request);
            const meetingId = String(body.meetingId ?? "").trim();
            if (!meetingId) {
                sendError(
                    response,
                    400,
                    "bad_request",
                    "meetingId is required.",
                );
                return;
            }
            const meeting = await requireOwnedMeeting({
                meetingId,
                claims,
                profileStore,
                profileIdentity: ctx.getCapability("social:profile:identity"),
                store,
                res: response,
            });
            if (!meeting) return;
            const expiresAt = resolveExpiry(body.expiresInHours);
            if (expiresAt === null) {
                sendError(
                    response,
                    400,
                    "bad_request",
                    "expiresInHours must be a positive number.",
                );
                return;
            }
            const flowResult = await ctx.flow.run("mint-share-token", {
                claims,
                ownerAccountId: claims.sub,
                resourceType: "meeting",
                resourceId: meeting.id,
                label: typeof body.label === "string" ? body.label : "",
                grantedCapabilities: [
                    "meeting:join",
                    "participants:read",
                    "chat:read",
                    "chat:write",
                ],
                expiresAt,
            });
            const issued = flowResult.stageResults["issue-token"]?.[0];
            if (!issued?.minted) {
                sendError(
                    response,
                    403,
                    "forbidden",
                    "Share token could not be created.",
                );
                return;
            }
            sendJson(response, 200, { data: issued.shareRecord ?? null });
        },
        { access: { minRole: "user" } },
    );

    router.post(
        "/api/v1/modules/jitsi-meet/share/delete",
        async (request, response) => {
            const claims = requireAuth(request, response, "user");
            if (!claims) return;
            await store.ensureSchema();
            const body = await readJson(request);
            const meetingId = String(body.meetingId ?? "").trim();
            const shareId = String(body.shareId ?? "").trim();
            if (!meetingId || !shareId) {
                sendError(
                    response,
                    400,
                    "bad_request",
                    "meetingId and shareId are required.",
                );
                return;
            }
            const meeting = await requireOwnedMeeting({
                meetingId,
                claims,
                profileStore,
                profileIdentity: ctx.getCapability("social:profile:identity"),
                store,
                res: response,
            });
            if (!meeting) return;
            const flowResult = await ctx.flow.run("revoke-share-token", {
                claims,
                shareId,
                ownerAccountId: claims.sub,
                resourceType: "meeting",
                resourceId: meeting.id,
            });
            const deleted = flowResult.stageResults["delete-token"]?.[0];
            if (!deleted?.revoked) {
                sendError(
                    response,
                    403,
                    "forbidden",
                    "Share token could not be revoked.",
                );
                return;
            }
            sendJson(response, 200, { data: { deleted: true } });
        },
        { access: { minRole: "user" } },
    );
}
