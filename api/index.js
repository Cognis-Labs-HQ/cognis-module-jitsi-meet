import path from "node:path";
import { registerMeetingRoutes } from "./meetings-routes.js";
import { registerMeetingConfigRoutes } from "./config-routes.js";
import { registerMeetingParticipantRoutes } from "./participant-routes.js";
import { registerMeetingLifecycleRoutes } from "./meeting-lifecycle-routes.js";
import { registerAdminMeetingRoutes } from "./admin-meetings-routes.js";
import { hasMinRole, readJson } from "./reuse/http.js";
import { checkHttpLiveness } from "./reuse/http-liveness.js";
import { normalizeHttpUrl, resolveExternalBaseUrl } from "./reuse/url-parts.js";
import { isModeratorRole } from "./meeting-values.js";
import {
    registerJitsiUiResourcesRoute,
    resolveMessagesUiResources,
} from "./ui-resources.js";
import { registerMeetingShareRoutes } from "./share-routes.js";
import { resolveStore } from "./reuse/store-runtime.js";
import { resolveRequesterUsername } from "./reuse/requester.js";
import { resolveShareGuestId } from "./reuse/share-guest.js";
import { registerMeetingWhiteboardRoutes } from "./whiteboard-routes.js";
import { registerMeetingWhiteboardDelegationHook } from "./whiteboard-delegation.js";
import {
    canAccessMeeting,
    createMeetingPayload,
    filterUsernamesForGuestVisibility,
    resolveMeetingPayloadOrReject,
    resolveRequestedParticipants,
    resolveShareGuestPresenceUsername,
} from "./reuse/meeting-access.js";
import {
    listPersistedMeetings,
    selectDistinctParticipantMeetings,
} from "./reuse/persisted-meetings.js";
import { registerPersistedMeetingRoutes } from "./persisted-meeting-routes.js";

const PAGE_SCRIPT_ORIGIN_OWNER_ID = "module:jitsi-meet";
const LIVELINESS_TIMEOUT_MS = 5000;
const JITSI_PIP_MINIMUM_SIZE = Object.freeze({ width: 400, height: 225 });

function registerConfiguredJitsiOrigin(registerScriptOrigins, config) {
    if (typeof registerScriptOrigins !== "function") {
        return;
    }
    registerScriptOrigins(PAGE_SCRIPT_ORIGIN_OWNER_ID, [config?.instanceUrl]);
}

async function registerStoredJitsiOrigin({
    store,
    registerScriptOrigins,
    log,
}) {
    try {
        await store.ensureSchema();
        registerConfiguredJitsiOrigin(
            registerScriptOrigins,
            await store.getConfig(),
        );
    } catch (error) {
        log?.("error", "Failed to register stored Jitsi CSP origin.", {
            component: "jitsi-meet-module",
            operation: "register_stored_jitsi_origin",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

function sendJson(res, status, payload) {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify(payload));
}

function sendError(res, status, code, message) {
    sendJson(res, status, {
        error: {
            code,
            message,
        },
    });
}

function buildMeetingChatTitle(meetingName) {
    return String(meetingName ?? "").trim();
}

function buildMeetingActionUrl(meetingId) {
    const normalizedMeetingId = String(meetingId ?? "").trim();
    if (!normalizedMeetingId) {
        return "/meetings";
    }
    return `/meetings?meetingId=${encodeURIComponent(normalizedMeetingId)}&start=1`;
}

function buildMeetingEmailLink(meetingId) {
    const actionUrl = buildMeetingActionUrl(meetingId);
    const externalHost = resolveExternalBaseUrl();
    return externalHost ? `${externalHost}${actionUrl}` : actionUrl;
}

function appendMeetingLinkToBody(body, meetingId) {
    const meetingLink = buildMeetingEmailLink(meetingId);
    if (!meetingLink) return body;
    return `${body}\n\nMeeting link: ${meetingLink}`;
}

export function registerUi(ctx) {
    const moduleUiRoot = path.join(ctx.moduleRoot, "ui");
    ctx.registerStaticDir("", moduleUiRoot);
    ctx.registerNavbarPlugin({
        scriptUrl: "/static/modules/jitsi-meet/navbar.js",
        access: { minRole: "user" },
        providesCapabilities: ["voip:startCall"],
    });
    const meetingsStylesheets = [
        "/static/styles/page-builder.css",
        "/static/modules/jitsi-meet/jitsi-meet.css",
    ];
    for (const route of [
        {
            id: "module.jitsi.meet.meetings",
            pattern: "^/meetings$",
            base: "/meetings",
            componentPage: {
                labelKey: "module.jitsi_meet.page_title",
                descriptionKey: "module.jitsi_meet.description",
                modes: ["overlay", "fullscreen", "pip"],
                minSize: JITSI_PIP_MINIMUM_SIZE,
            },
        },
        {
            id: "module.jitsi.meet.meeting",
            pattern: "^/meeting$",
            base: "/meeting",
        },
    ]) {
        ctx.registerSpaRoute({
            ...route,
            scriptUrl: "/static/modules/jitsi-meet/app/index.js",
            stylesheets: meetingsStylesheets,
            access: { minRole: "user" },
        });
    }
    ctx.registerAdminSection({
        id: "module-jitsi-meet-meetings",
        label: "module.jitsi_meet.name",
        scriptUrl: "/static/modules/jitsi-meet/admin-meetings-section.js",
        access: { minRole: "admin" },
        stringsBaseUrl: "/static/modules/jitsi-meet/languages",
    });
}

export function registerApiRoutes(router, ctx) {
    const requireAuth = ctx.getCapability("auth:requireAuth");
    if (typeof requireAuth !== "function") {
        throw new Error("Jitsi Meet requires the auth:requireAuth capability.");
    }
    const dbExecutor = ctx.getCapability("db:executor");
    const generatePassphrase = ctx.getCapability("reuse:generatePassphrase");
    const systemCtx = ctx.getCapability("system:ctx");
    const requestShareApproval = ctx.getCapability("share:requestApproval");
    if (typeof requestShareApproval !== "function") {
        throw new Error(
            "Jitsi Meet requires the share:requestApproval capability.",
        );
    }
    const profileStore = ctx.getCapability("social:profileStore");
    const profileIdentity = ctx.getCapability("social:profile:identity");
    if (
        typeof profileIdentity?.normalizeHandleKey !== "function" ||
        typeof profileIdentity?.normalizeHandleKeys !== "function" ||
        typeof profileIdentity?.resolveAccountHandle !== "function"
    ) {
        throw new Error(
            "Jitsi Meet requires the social:profile:identity capability.",
        );
    }
    const normalizeHandleKey = (handle) =>
        profileIdentity.normalizeHandleKey(handle);
    const messagesUiResources = resolveMessagesUiResources(ctx);
    const resolveGroupChat = ctx.getCapability(
        "social:messages:resolveGroupChatUrl",
    );
    const groupChatMembership = ctx.getCapability("social:messages:membership");
    if (
        typeof groupChatMembership?.add !== "function" ||
        typeof groupChatMembership?.remove !== "function"
    ) {
        throw new Error(
            "Jitsi Meet requires the Messages room membership capability.",
        );
    }
    const listClassroomParticipantHandles =
        ctx.getCapability("study:classroom:listParticipantHandles") ??
        (async () => []);
    const dispatchNotification = ctx.getCapability("notify:dispatch");
    const registerNotificationCategory = ctx.getCapability(
        "notify:registerCategory",
    );
    const accountStore = ctx.getCapability("auth:accountStore");
    const listCalendarsByOwner = ctx.getCapability("calendar:listCalendars");
    const listCalendarEvents = ctx.getCapability("calendar:listEvents");
    const log = ctx.getCapability("logging:log");
    const fetchBoardData = (...args) => {
        const providerFetchBoardData =
            ctx.getCapability("whiteboard:fetchBoardData") ??
            systemCtx?.getCapability?.("whiteboard:fetchBoardData");
        if (typeof providerFetchBoardData !== "function") {
            throw new Error("Whiteboard provider verification is unavailable.");
        }
        return providerFetchBoardData(...args);
    };
    const isWhiteboardProviderAvailable = () =>
        typeof (
            ctx.getCapability("whiteboard:fetchBoardData") ??
            systemCtx?.getCapability?.("whiteboard:fetchBoardData")
        ) === "function";
    const resolveShareGuestMeetingAccess = async ({
        claims,
        meetingId,
        requiredCapability = "",
    }) => {
        const resolveGuestAccess = ctx.getCapability(
            "share:resolveGuestAccess",
        );
        if (typeof resolveGuestAccess !== "function") {
            return { isGuest: false, allowed: false, tokenRecord: null };
        }
        const access = await resolveGuestAccess({
            claims,
            resourceType: "meeting",
            resourceId: meetingId,
            requiredCapability,
        });
        const legacyMeetingAccess =
            access?.shareGuest === true &&
            access?.authorized !== true &&
            requiredCapability
                ? await resolveGuestAccess({
                      claims,
                      resourceType: "meeting",
                      resourceId: meetingId,
                  })
                : null;
        return {
            isGuest:
                access?.shareGuest === true ||
                legacyMeetingAccess?.shareGuest === true,
            allowed:
                access?.authorized === true ||
                legacyMeetingAccess?.authorized === true,
            tokenRecord: null,
        };
    };
    const resolveShareUserAccess = ctx.getCapability("share:resolveUserAccess");
    const deleteResourceShares = ctx.getCapability(
        "share:deleteResourceShares",
    );
    const deleteChatroom = ctx.getCapability("social:messages:deleteChatroom");
    if (typeof deleteChatroom !== "function") {
        throw new Error(
            "Jitsi Meet requires the authorized Messages chatroom deletion capability.",
        );
    }
    const resolveMeetingPayload = (input) =>
        resolveMeetingPayloadOrReject({
            ...input,
            profileIdentity,
            sendError,
            resolveShareUserAccess,
        });
    const canAccessMeetingForRequester = (input) =>
        canAccessMeeting({
            ...input,
            profileIdentity,
            resolveShareUserAccess,
        });
    const resolveRequesterHandle = (profileStoreInput, accountId) =>
        resolveRequesterUsername(profileStoreInput, profileIdentity, accountId);
    const resolveParticipantHandles = (
        profileStoreInput,
        requestedHandles,
        options,
    ) =>
        resolveRequestedParticipants(
            profileStoreInput,
            profileIdentity,
            requestedHandles,
            options,
        );

    const store = dbExecutor
        ? resolveStore(dbExecutor, log, generatePassphrase, profileIdentity)
        : null;
    if (store) {
        registerMeetingWhiteboardDelegationHook(ctx, { store });
    }

    if (typeof registerNotificationCategory === "function") {
        registerNotificationCategory("meetings", "Meetings");
    }

    if (
        !dbExecutor ||
        !profileStore ||
        typeof generatePassphrase !== "function"
    ) {
        const unavailablePayload = (res) =>
            sendError(
                res,
                503,
                "service_unavailable",
                "Jitsi Meet dependencies are unavailable.",
            );
        router.get(
            "/api/v1/modules/jitsi-meet/config",
            async (_req, res) => {
                unavailablePayload(res);
            },
            { access: { minRole: "user" }, allowWhenDisabled: true },
        );
        router.put(
            "/api/v1/modules/jitsi-meet/config",
            async (_req, res) => {
                unavailablePayload(res);
            },
            { access: { minRole: "admin" }, allowWhenDisabled: true },
        );
        router.delete(
            "/api/v1/modules/jitsi-meet/config",
            async (_req, res) => {
                unavailablePayload(res);
            },
            { access: { minRole: "admin" }, allowWhenDisabled: true },
        );
        router.get(
            "/api/v1/modules/jitsi-meet/admin/meetings",
            async (_req, res) => {
                unavailablePayload(res);
            },
        );
        router.get(
            "/api/v1/modules/jitsi-meet/admin/meetings/upcoming",
            async (_req, res) => {
                unavailablePayload(res);
            },
        );
        router.get(
            "/api/v1/modules/jitsi-meet/participants",
            async (_req, res) => {
                sendJson(res, 200, { data: [] });
            },
        );
        router.get(
            "/api/v1/modules/jitsi-meet/meetings/active",
            async (_req, res) => {
                sendJson(res, 200, { data: [] });
            },
        );
        router.get(
            "/api/v1/modules/jitsi-meet/meetings/persisted",
            async (_req, res) => {
                sendJson(res, 200, { data: [] });
            },
        );
        router.get("/api/v1/modules/jitsi-meet/ping", async (_req, res) => {
            sendJson(res, 200, {
                data: {
                    ready: false,
                    reason: "required_capabilities_missing",
                },
            });
        });
        registerJitsiUiResourcesRoute({
            requireAuth,
            router,
            sendJson,
            log: ctx.log,
            unavailable: true,
        });
        for (const routePath of [
            "/api/v1/modules/jitsi-meet/meetings/create",
            "/api/v1/modules/jitsi-meet/meetings/messages-call",
            "/api/v1/modules/jitsi-meet/meetings/get",
            "/api/v1/modules/jitsi-meet/meetings/preflight",
            "/api/v1/modules/jitsi-meet/meetings/probe",
            "/api/v1/modules/jitsi-meet/meetings/join",
            "/api/v1/modules/jitsi-meet/meetings/participants/add",
            "/api/v1/modules/jitsi-meet/meetings/participants/kicked",
            "/api/v1/modules/jitsi-meet/meetings/reclaim",
            "/api/v1/modules/jitsi-meet/meetings/presence",
            "/api/v1/modules/jitsi-meet/meetings/auth-required",
            "/api/v1/modules/jitsi-meet/meetings/auth-start",
            "/api/v1/modules/jitsi-meet/meetings/auth-complete",
            "/api/v1/modules/jitsi-meet/meetings/state",
        ]) {
            router.post(routePath, async (_req, res) => {
                unavailablePayload(res);
            });
        }
        return;
    }

    const removeMeetingMemberships = async (accountId) => {
        await dbExecutor.transaction(async (transactionDb) => {
            for (const table of [
                "jitsi_meeting_presence",
                "jitsi_meeting_participants",
            ]) {
                await transactionDb.executeCommand({
                    option: "DELETE",
                    table,
                    where: [{ column: "username", value: accountId }],
                });
            }
        });
    };
    systemCtx?.getCapability?.("auth:registerKeyringDataOwner")?.(
        "jitsi-meet",
        removeMeetingMemberships,
    );

    systemCtx?.flow?.extend?.(
        "deprovision-user",
        "cleanup-dependencies",
        { id: "jitsi-meet:delete-user-activity" },
        async (stageCtx) => {
            const input = stageCtx.input ?? {};
            const persistResult = stageCtx.stageResults["persist-state"] ?? [];
            if (
                input.action !== "delete" ||
                !input.username ||
                !persistResult[0]?.persisted
            ) {
                return { cleaned: false };
            }
            const accountId = normalizeHandleKey(input.username);
            await dbExecutor.transaction(async (transactionDb) => {
                for (const table of [
                    "jitsi_meeting_presence",
                    "jitsi_meeting_participants",
                ]) {
                    await transactionDb.executeCommand({
                        option: "DELETE",
                        table,
                        where: [{ column: "username", value: accountId }],
                    });
                }
                const meetingResult = await transactionDb.executeCommand({
                    option: "SELECT",
                    table: "jitsi_meetings",
                    columns: ["id"],
                    where: [{ column: "created_by", value: accountId }],
                });
                for (const meetingRow of meetingResult.rows ?? []) {
                    const meetingId = String(meetingRow.id);
                    for (const table of [
                        "jitsi_meeting_presence",
                        "jitsi_meeting_participants",
                        "jitsi_meeting_state",
                    ]) {
                        await transactionDb.executeCommand({
                            option: "DELETE",
                            table,
                            where: [{ column: "meeting_id", value: meetingId }],
                        });
                    }
                }
                await transactionDb.executeCommand({
                    option: "DELETE",
                    table: "jitsi_meetings",
                    where: [{ column: "created_by", value: accountId }],
                });
            });
            ctx.log?.("info", "Deleted user meeting activity.", {
                component: "jitsi-meet-module",
                operation: "delete_user_activity",
                accountId,
            });
            return { cleaned: true, accountId };
        },
    );

    const registerScriptOrigins = ctx.getCapability(
        "auth:registerPageScriptOrigins",
    );
    const runEnableTest = async () => {
        await store.ensureSchema();
        const config = await store.getConfig();
        if (!config.instanceUrl) {
            return {
                ok: false,
                code: "config_required",
                message:
                    "The Jitsi instance URL must be configured before the module can be enabled.",
            };
        }
        const liveness = await checkHttpLiveness(config.instanceUrl, {
            timeoutMs: LIVELINESS_TIMEOUT_MS,
        });
        return {
            ok: Boolean(liveness.alive),
            code: liveness.alive ? "ok" : "liveness_failed",
            message: liveness.alive
                ? "Jitsi Meet enablement test passed."
                : "The configured Jitsi instance did not respond successfully.",
            data: { ...liveness, instanceUrl: config.instanceUrl },
        };
    };
    ctx.getCapability("system:ctx")?.contributePublicCapability?.(
        "module:jitsi-meet:enableTest",
        runEnableTest,
    );
    const contributeHealth = ctx.getCapability("system:health:contribute");
    if (typeof contributeHealth === "function") {
        contributeHealth("module:jitsi-meet", async () => {
            const result = await runEnableTest();
            return {
                componentId: "jitsi-meet",
                componentType: "module",
                status: result.ok ? "ok" : "warning",
                message: result.message,
                checkedAt: new Date().toISOString(),
                data: result.data,
            };
        });
    }
    router.post(
        "/api/v1/modules/jitsi-meet/admin/enable-test",
        async (_req, res) => {
            const result = await runEnableTest();
            if (!result.ok) {
                sendError(res, 409, result.code, result.message);
                return;
            }
            sendJson(res, 200, { data: result.data });
        },
        { access: { minRole: "admin" }, allowWhenDisabled: true },
    );
    ctx.capabilities?.contribute?.(
        "jitsi-meet:getMeetingById",
        store.getMeetingById.bind(store),
    );
    const registerExternalRoomAuthorizer = ctx.capabilities?.get?.(
        "social:messages:registerExternalRoomAuthorizer",
    );
    registerExternalRoomAuthorizer?.(
        async ({ claims, roomId, requiredCapability }) => {
            const meeting = await store.getMeetingByChatRoomId(roomId);
            if (!meeting) return { external: false, authorized: false };
            const access = await resolveShareGuestMeetingAccess({
                claims,
                meetingId: meeting.id,
                requiredCapability,
            });
            return {
                external: access.isGuest === true,
                authorized: access.allowed === true,
            };
        },
    );
    void registerStoredJitsiOrigin({ store, registerScriptOrigins, log });

    registerJitsiUiResourcesRoute({
        requireAuth,
        router,
        sendJson,
        log,
        messagesUiResources,
    });

    registerMeetingShareRoutes({
        router,
        ctx,
        requireAuth,
        profileStore,
        profileIdentity,
    });

    async function dispatchMeetingNotifications(
        recipientUsernames,
        {
            subject,
            body,
            metadata = {},
            senderName,
            meetingId = null,
            organizerUsername = "",
            excludeUsernames = [],
        },
    ) {
        if (typeof dispatchNotification !== "function") return;
        const notificationMeetingId = meetingId ?? metadata?.meetingId;
        const excludedRecipients = new Set(
            [organizerUsername, ...excludeUsernames]
                .map((username) => normalizeHandleKey(username))
                .filter(Boolean),
        );
        const candidateRecipients = [];
        const seenRecipients = new Set();
        for (const candidate of Array.isArray(recipientUsernames)
            ? recipientUsernames
            : []) {
            const normalizedCandidate = normalizeHandleKey(candidate);
            if (
                !normalizedCandidate ||
                excludedRecipients.has(normalizedCandidate) ||
                seenRecipients.has(normalizedCandidate)
            ) {
                continue;
            }
            seenRecipients.add(normalizedCandidate);
            candidateRecipients.push(String(candidate).trim());
        }
        const organizerProfile = organizerUsername
            ? await profileStore
                  .getProfileByHandle(organizerUsername)
                  .catch(() => null)
            : null;
        const normalizedRecipients = [];
        for (const recipientUsername of candidateRecipients) {
            let recipientProfile = await profileStore
                .getProfileByHandle(recipientUsername)
                .catch(() => null);
            if (!recipientProfile?.accountId) {
                recipientProfile = await profileStore
                    .getProfile(recipientUsername)
                    .catch(() => null);
            }
            if (!recipientProfile?.accountId) {
                log?.(
                    "error",
                    "Failed to resolve meeting notification recipient.",
                    {
                        component: "jitsi-meet-module",
                        operation: "resolve_meeting_notification_recipient",
                        recipientUsername,
                    },
                );
                continue;
            }
            if (organizerProfile?.accountId) {
                if (
                    await profileStore.isBlocked(
                        organizerProfile.accountId,
                        recipientProfile.accountId,
                    )
                ) {
                    continue;
                }
            }
            normalizedRecipients.push({
                accountId: recipientProfile.accountId,
                username:
                    normalizeHandleKey(recipientProfile.handle) ||
                    recipientUsername,
            });
        }
        const notificationHasMeetingLink = metadata?.event !== "meeting_ended";
        const bodyWithMeetingLink = notificationHasMeetingLink
            ? appendMeetingLinkToBody(body, notificationMeetingId)
            : body;
        for (const recipient of normalizedRecipients) {
            try {
                await dispatchNotification({
                    category: "meetings",
                    recipientUsername: recipient.accountId,
                    subject,
                    body: bodyWithMeetingLink,
                    senderName,
                    ...(notificationHasMeetingLink
                        ? {
                              actionUrl: buildMeetingActionUrl(
                                  notificationMeetingId,
                              ),
                          }
                        : {}),
                    metadata,
                });
            } catch (error) {
                log?.("error", "Failed to dispatch meeting notification.", {
                    component: "jitsi-meet-module",
                    operation: "dispatch_meeting_notification",
                    recipientUsername: recipient.username,
                    recipientAccountId: recipient.accountId,
                    error:
                        error instanceof Error ? error.message : String(error),
                });
            }
        }
    }

    async function resolveModeratorUsernames(meeting, participantUsernames) {
        const normalizedParticipants = Array.from(
            new Set(
                (Array.isArray(participantUsernames)
                    ? participantUsernames
                    : []
                )
                    .map((username) => normalizeHandleKey(username))
                    .filter(Boolean),
            ),
        );
        const moderatorSet = new Set([
            normalizeHandleKey(meeting?.createdBy ?? ""),
        ]);
        if (
            !accountStore ||
            typeof accountStore.list !== "function" ||
            normalizedParticipants.length === 0
        ) {
            return Array.from(moderatorSet).filter(Boolean);
        }
        const users = await accountStore.list().catch(() => []);
        for (const user of users) {
            const username = normalizeHandleKey(user?.username);
            if (!username || !normalizedParticipants.includes(username)) {
                continue;
            }
            if (isModeratorRole(user?.role) || user?.isFounder === true) {
                moderatorSet.add(username);
            }
        }
        return Array.from(moderatorSet).filter(Boolean);
    }

    const routeContext = {
        router,
        store,
        profileStore,
        profileIdentity,
        requireAuth,
        readJson,
        sendJson,
        sendError,
        hasMinRole,
        normalizeHttpUrl,
        normalizeHandleKey,
        registerConfiguredJitsiOrigin,
        registerScriptOrigins,
        log,
        resolveRequesterUsername: resolveRequesterHandle,
        resolveRequestedParticipants: resolveParticipantHandles,
        createMeetingPayload,
        resolveMeetingPayload,
        resolveShareGuestMeetingAccess,
        resolveShareGuestPresenceUsername,
        listClassroomParticipantHandles,
        canAccessMeeting: canAccessMeetingForRequester,
        resolveGroupChat,
        groupChatMembership,
        resolveWhiteboardMembership: () =>
            systemCtx?.getCapability?.("whiteboard:membership") ??
            ctx.getCapability("whiteboard:membership"),
        fetchBoardData,
        resolveWhiteboardDeletion: () =>
            systemCtx?.getCapability?.("whiteboard:deleteCanvas") ??
            ctx.getCapability("whiteboard:deleteCanvas"),
        buildMeetingChatTitle,
        dispatchMeetingNotifications,
        resolveModeratorUsernames,
        deleteResourceShares,
        deleteChatroom,
        requestParticipantAdditionApproval: async ({
            meetingId,
            meetingName,
            participantUsername,
            requesterAccountId,
            requesterDisplayName,
        }) => {
            try {
                const result = await requestShareApproval({
                    resourceType: "meeting",
                    resourceId: meetingId,
                    requesterAccountId,
                    requesterDisplayName,
                    action: `add ${participantUsername} as a meeting participant`,
                    target: meetingName,
                });
                const approved = result === true || result?.approved === true;
                const declined = result === false || result?.approved === false;
                if (!approved && !declined) {
                    log?.(
                        "error",
                        "Share approval returned an invalid decision; participant addition is rejected.",
                        {
                            component: "jitsi-meet-module",
                            operation:
                                "approve_active_meeting_participant_addition",
                            meetingId,
                        },
                    );
                    return { approved: false, failOpen: false };
                }
                return { approved, failOpen: false };
            } catch (error) {
                log?.(
                    "error",
                    "Share approval failed; participant addition is rejected.",
                    {
                        component: "jitsi-meet-module",
                        operation:
                            "approve_active_meeting_participant_addition",
                        meetingId,
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                );
                return { approved: false, failOpen: false };
            }
        },
        revokeKickedGuestShare: async ({ claims, meetingId }) => {
            const shareId = resolveShareGuestId(claims);
            if (!shareId || !systemCtx?.flow?.exists?.("revoke-share-token")) {
                return false;
            }
            try {
                const result = await systemCtx.flow.run("revoke-share-token", {
                    claims,
                    shareId,
                    ownerAccountId: claims.sub,
                    resourceType: "meeting",
                    resourceId: meetingId,
                    selfRevocation: true,
                });
                return (
                    result.stageResults["delete-token"]?.[0]?.revoked === true
                );
            } catch (error) {
                log?.("error", "Kicked guest link invalidation failed.", {
                    component: "jitsi-meet-module",
                    operation: "invalidate_kicked_guest_share",
                    meetingId,
                    shareId,
                    error:
                        error instanceof Error ? error.message : String(error),
                });
                return false;
            }
        },
    };

    registerMeetingConfigRoutes(routeContext);
    registerMeetingParticipantRoutes(routeContext);
    registerMeetingLifecycleRoutes(routeContext);
    registerPersistedMeetingRoutes(routeContext);
    registerMeetingWhiteboardRoutes({
        ...routeContext,
        ctx,
        listClassroomParticipantHandles,
        fetchBoardData,
        isWhiteboardProviderAvailable,
        requestWhiteboardOpenApproval: async ({
            meetingId,
            meetingName,
            requesterAccountId,
            requesterDisplayName,
        }) => {
            try {
                const result = await requestShareApproval({
                    resourceType: "meeting",
                    resourceId: meetingId,
                    requesterAccountId,
                    requesterDisplayName,
                    action: "open the meeting Whiteboard",
                    target: meetingName,
                });
                return {
                    approved: result === true || result?.approved === true,
                };
            } catch (error) {
                log?.("error", "Whiteboard consensus request failed.", {
                    component: "jitsi-meet-module",
                    operation: "request_whiteboard_open_approval",
                    meetingId,
                    error:
                        error instanceof Error ? error.message : String(error),
                });
                return { approved: false };
            }
        },
    });

    registerMeetingRoutes({
        router,
        store,
        profileStore,
        profileIdentity,
        listCalendarsByOwner,
        listCalendarEvents,
        listPersistedMeetings: () =>
            listPersistedMeetings({
                db: dbExecutor,
                getMeetingById: (id) => store.getMeetingById(id),
                listParticipants: (id) => store.listParticipants(id),
                listOriginalParticipants: (id) =>
                    store.listOriginalParticipants(id),
            }),
        selectDistinctParticipantMeetings: (meetings, activeMeetingIds) =>
            selectDistinctParticipantMeetings(meetings, {
                activeMeetingIds,
                normalizeHandleKeys: (handles) =>
                    profileIdentity.normalizeHandleKeys(handles),
            }),
        listClassroomParticipantHandles,
        resolveMeetingPayloadOrReject: resolveMeetingPayload,
        createMeetingPayload,
        resolveRequesterUsername,
        canAccessMeeting: canAccessMeetingForRequester,
        filterUsernamesForGuestVisibility: (usernames) =>
            filterUsernamesForGuestVisibility(
                profileStore,
                profileIdentity,
                usernames,
            ),
        requireAuth,
        readJson,
        sendJson,
        sendError,
        log,
        checkHttpLiveness,
        LIVELINESS_TIMEOUT_MS,
        resolveShareGuestMeetingAccess,
    });

    registerAdminMeetingRoutes({
        router,
        store,
        requireAuth,
        sendJson,
        profileStore,
    });
}
