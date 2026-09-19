import { registerApiRoutes, registerUi } from "./api/index.js";
import { registerShareFlowHooks } from "./api/share-hooks.js";
import { JitsiMeetStore } from "./api/store.js";

export async function uninstallModule(ctx, { deleteContent }) {
    const store = new JitsiMeetStore({
        db: ctx.getCapability("db:executor"),
        log: ctx.log,
        profileIdentity: ctx.getCapability("social:profile:identity"),
    });
    await store.ensureSchema();
    if (deleteContent) {
        await store.deleteAllData();
    } else {
        await store.deleteConfig();
    }
    ctx.log?.("info", "Jitsi Meet saved data deleted.", {
        component: "jitsi-meet-module",
        operation: "uninstall_cleanup",
        deleteContent,
    });
}

export function bootstrapModule(ctx) {
    registerUi(ctx);
    registerApiRoutes(ctx.router, ctx);

    if (ctx.flow.exists("construct-meetings-ui")) {
        ctx.flow.extend(
            "construct-meetings-ui",
            "resolve-providers",
            { id: "jitsi-meet:resolve-providers" },
            () => ({
                providerId: "jitsi-meet",
                providerName: "Jitsi Meet",
                scriptUrl: "/static/modules/jitsi-meet/app/index.js",
            }),
        );
    }

    if (ctx.flow.exists("create-meeting")) {
        ctx.flow.extend(
            "create-meeting",
            "validate-request",
            { id: "jitsi-meet:validate-request" },
            (stageCtx) => {
                const input = stageCtx.input;
                const providerId = String(input.providerId ?? "jitsi-meet");
                if (providerId !== "jitsi-meet") {
                    return { valid: false, reason: "unsupported_provider" };
                }
                return { valid: true, providerId };
            },
        );
    }

    registerShareFlowHooks(ctx);
}
