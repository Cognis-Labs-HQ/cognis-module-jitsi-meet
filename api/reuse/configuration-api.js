import { registerMeetingConfigRoutes } from "../config-routes.js";
import { readJson } from "./http.js";
import { checkHttpLiveness } from "./http-liveness.js";
import { resolveStore } from "./store-runtime.js";
import { normalizeHttpUrl } from "./url-parts.js";

const LIVELINESS_TIMEOUT_MS = 5000;
const PAGE_SCRIPT_ORIGIN_OWNER_ID = "module:jitsi-meet";

function sendJson(response, status, payload) {
    response.writeHead(status, { "content-type": "application/json" });
    response.end(JSON.stringify(payload));
}

function sendError(response, status, code, message, details = {}) {
    sendJson(response, status, {
        error: { code, message, ...details },
    });
}

function registerConfiguredJitsiOrigin(registerScriptOrigins, config) {
    if (typeof registerScriptOrigins === "function") {
        registerScriptOrigins(PAGE_SCRIPT_ORIGIN_OWNER_ID, [
            config?.instanceUrl,
        ]);
    }
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

export function registerJitsiConfigurationApi(router, ctx) {
    const dbExecutor = ctx.getCapability("db:executor");
    const requireAuth = ctx.getCapability("auth:requireAuth");
    const profileIdentity = ctx.getCapability("social:profile:identity");
    const dependenciesAvailable =
        dbExecutor &&
        typeof requireAuth === "function" &&
        typeof profileIdentity?.normalizeHandleKey === "function" &&
        typeof profileIdentity?.normalizeHandleKeys === "function";
    if (!dependenciesAvailable) {
        const unavailablePayload = (response) =>
            sendError(
                response,
                503,
                "service_unavailable",
                "Jitsi Meet dependencies are unavailable.",
            );
        for (const method of ["get", "put", "delete"]) {
            router[method](
                "/api/v1/modules/jitsi-meet/config",
                async (_request, response) => unavailablePayload(response),
                {
                    access: {
                        minRole: method === "get" ? "user" : "admin",
                    },
                    allowWhenDisabled: true,
                },
            );
        }
        return null;
    }

    const log = ctx.getCapability("logging:log") ?? ctx.log;
    const store = resolveStore(
        dbExecutor,
        log,
        ctx.getCapability("reuse:generatePassphrase"),
        profileIdentity,
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
        async (_request, response) => {
            const result = await runEnableTest();
            if (!result.ok) {
                sendError(response, 409, result.code, result.message);
                return;
            }
            sendJson(response, 200, { data: result.data });
        },
        { access: { minRole: "admin" }, allowWhenDisabled: true },
    );

    const registerScriptOrigins = ctx.getCapability(
        "auth:registerPageScriptOrigins",
    );
    registerMeetingConfigRoutes({
        router,
        store,
        requireAuth,
        readJson,
        sendJson,
        sendError,
        normalizeHttpUrl,
        registerConfiguredJitsiOrigin,
        registerScriptOrigins,
        log,
    });
    void registerStoredJitsiOrigin({ store, registerScriptOrigins, log });

    return { store, profileIdentity, log };
}
