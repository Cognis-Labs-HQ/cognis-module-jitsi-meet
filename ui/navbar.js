import { importReuseModule } from "./reuse/resources.js";

const [{ apiFetch }, { createI18n }] = await Promise.all([
    importReuseModule("api-client.js"),
    importReuseModule("i18n.js"),
]);
import { logUi } from "./reuse/feedback.js";

const i18n = await createI18n({
    componentStringBaseUrls: ["/static/modules/jitsi-meet/languages"],
});
const LISTENER_BOUND_KEY = "__jitsiMeetNavbarListenersBound";
const MEETINGS_PATHS = new Set(["/meeting", "/meetings"]);
let pingController = null;

function unmountMeetingPing() {
    pingController?.abort();
    pingController = null;
}

async function syncMeetingLink() {
    const topnav = document.querySelector(".topnav");
    if (!(topnav instanceof HTMLElement)) return;

    let link = topnav.querySelector("[data-meeting-link]");
    if (!(link instanceof HTMLAnchorElement)) {
        link = document.createElement("a");
        link.setAttribute("data-meeting-link", "true");
        topnav.appendChild(link);
    }
    link.href = "/meetings";

    link.textContent = i18n.t("ui.reuse.meetings");
    if (!MEETINGS_PATHS.has(window.location.pathname)) {
        unmountMeetingPing();
        link.removeAttribute("hidden");
        return;
    }

    unmountMeetingPing();
    const controller = new AbortController();
    pingController = controller;
    try {
        const response = await apiFetch("/api/v1/modules/jitsi-meet/ping", {
            signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        if (!response.ok) {
            link.setAttribute("hidden", "");
            return;
        }
        const payload = await response.json();
        if (payload?.data?.ready !== true) {
            link.setAttribute("hidden", "");
            return;
        }
        link.removeAttribute("hidden");
    } catch (error) {
        if (controller.signal.aborted) return;
        logUi("error", "Meetings availability check failed.", {
            component: "module:jitsi-meet",
            operation: "check_meetings_availability",
            error: error instanceof Error ? error.message : String(error),
        });
        link.setAttribute("hidden", "");
    } finally {
        if (pingController === controller) pingController = null;
    }
}

syncMeetingLink();
if (!globalThis[LISTENER_BOUND_KEY]) {
    window.addEventListener("focus", syncMeetingLink);
    window.addEventListener("popstate", syncMeetingLink);
    window.addEventListener("cognis:navbar-refresh", syncMeetingLink);
    globalThis[LISTENER_BOUND_KEY] = true;
}
