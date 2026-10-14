import { importReuseModule } from "./reuse/resources.js";
import { logUi } from "./reuse/feedback.js";

const [{ apiFetch }, { createI18n }] = await Promise.all([
    importReuseModule("api-client.js"),
    importReuseModule("i18n.js"),
]);
const i18n = await createI18n({
    componentStringBaseUrls: ["/static/modules/jitsi-meet/languages"],
});
const MEETINGS_PATHS = new Set(["/meeting", "/meetings"]);

export function mountProvider(ctx) {
    const navbar = ctx.capabilities.get("ui:navbarLinks");
    if (typeof navbar?.contribute !== "function")
        throw new Error("Required UI capability unavailable: ui:navbarLinks");
    const link = {
        href: "/meetings",
        label: i18n.t("ui.reuse.meetings"),
        visible: true,
    };
    const release = navbar.contribute("jitsi-meet:meetings", link);
    let pingController;
    const syncMeetingLink = async () => {
        pingController?.abort();
        if (ctx.signal.aborted) return;
        link.visible = true;
        if (!MEETINGS_PATHS.has(window.location.pathname)) {
            navbar.render();
            return;
        }
        const controller = new AbortController();
        pingController = controller;
        try {
            const response = await apiFetch("/api/v1/modules/jitsi-meet/ping", {
                signal: controller.signal,
            });
            const payload = response.ok ? await response.json() : null;
            if (controller.signal.aborted || ctx.signal.aborted) return;
            link.visible = payload?.data?.ready === true;
            navbar.render();
        } catch (error) {
            if (controller.signal.aborted || ctx.signal.aborted) return;
            logUi("error", "Meetings availability check failed.", {
                component: "module:jitsi-meet",
                operation: "check_meetings_availability",
                error: error instanceof Error ? error.message : String(error),
            });
            link.visible = false;
            navbar.render();
        }
    };
    for (const event of ["focus", "popstate", "cognis:navbar-refresh"])
        window.addEventListener(event, syncMeetingLink, { signal: ctx.signal });
    void syncMeetingLink();
    return () => {
        pingController?.abort();
        release();
    };
}
