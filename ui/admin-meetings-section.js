import { importReuseModule, uiCtx } from "./reuse/resources.js";

const { formatDateTime } = await importReuseModule("timestamp.js");
const { openPopup } = await importReuseModule("popup.js");
const { ensurePageStylesheet } = await importReuseModule("page-styles.js");
import { logUi, showToast } from "./reuse/feedback.js";
import { createMeetingAdminTemplates } from "./templates/admin-meetings.js";

const REFRESH_INTERVAL_MS = 2500;

/**
 * Creates the Jitsi Meetings administration section contribution rendered in
 * the Administration page sub-composer.
 *
 * @example
 * const section = createAdminSection({ i18n, apiFetch, escapeHtml });
 *
 * @param {{
 *   i18n: { t: (key: string) => string },
 *   apiFetch: (url: string, init?: RequestInit) => Promise<Response>,
 *   escapeHtml: (value: string) => string,
 * }} options
 * @returns {{
 *   id: string,
 *   label: string,
 *   dataReady: Promise<void>,
 *   subComposerOptions: {
 *     allowCustomization: boolean,
 *     preferenceKey: string,
 *     heading: string,
 *     onRender: () => void,
 *     elements: Array<{
 *       id: string,
 *       label: string,
 *       pinned: boolean,
 *       render: () => string,
 *     }>,
 *   },
 * }}
 */
export function createAdminSection({ i18n, escapeHtml }) {
    const gateway = uiCtx.capabilities.get("jitsi-meet:administration");
    if (!gateway)
        throw new Error("Meeting administration gateway is unavailable.");
    let filter = "active";
    let panelRoot = null;
    let refreshTimer = null;
    let upcomingPanelRoot = null;
    let upcomingRefreshTimer = null;

    async function loadMeetings() {
        const rows = await gateway.listAdminMeetings();
        return Array.isArray(rows) ? rows : [];
    }

    async function loadUpcomingMeetings() {
        const rows = await gateway.listUpcomingAdminMeetings();
        return Array.isArray(rows) ? rows : [];
    }

    const { renderRows, renderUpcomingRows, renderPanel } =
        createMeetingAdminTemplates({ i18n, escapeHtml, formatDateTime });

    async function refresh() {
        if (!(panelRoot instanceof HTMLElement) || !panelRoot.isConnected) {
            stopPolling();
            panelRoot = null;
            return;
        }
        const currentRoot = panelRoot;
        const rows = await loadMeetings();
        if (panelRoot !== currentRoot || !currentRoot.isConnected) return;
        const tbody = panelRoot.querySelector("tbody");
        if (!(tbody instanceof HTMLElement)) return;
        tbody.innerHTML = renderRows(
            rows.filter(
                (row) =>
                    filter === "all" ||
                    (filter === "issues" ? row.issues?.length : row.active),
            ),
        );
    }

    async function refreshUpcoming() {
        if (
            !(upcomingPanelRoot instanceof HTMLElement) ||
            !upcomingPanelRoot.isConnected
        ) {
            stopUpcomingPolling();
            upcomingPanelRoot = null;
            return;
        }
        const currentRoot = upcomingPanelRoot;
        const rows = await loadUpcomingMeetings();
        if (upcomingPanelRoot !== currentRoot || !currentRoot.isConnected)
            return;
        const tbody = upcomingPanelRoot.querySelector("tbody");
        if (!(tbody instanceof HTMLElement)) return;
        tbody.innerHTML = renderUpcomingRows(rows);
    }

    function reportFailure(error) {
        stopPolling();
        stopUpcomingPolling();
        if (!panelRoot?.isConnected && !upcomingPanelRoot?.isConnected) return;
        logUi("error", "Meeting administration failed.", {
            operation: "admin_meetings",
            errorName: error?.name,
        });
        showToast(i18n.t("module.jitsi_meet.meetings.load.failed"), {
            variant: "error",
        });
    }

    async function handleAction(event) {
        const button = event.target.closest("button");
        if (!button || !panelRoot?.contains(button)) return;
        if (button.dataset.meetingFilter) {
            filter = button.dataset.meetingFilter;
            for (const pill of panelRoot.querySelectorAll(
                "[data-meeting-filter]",
            ))
                pill.setAttribute("aria-pressed", String(pill === button));
            await refresh();
            return;
        }
        const action = button.dataset.meetingAction;
        if (!action) return;
        const choice = await openPopup({
            title: i18n.t(`module.jitsi_meet.admin.action.${action}`),
            body: `<p>${escapeHtml(i18n.t(`module.jitsi_meet.admin.confirm.${action}`))}</p>`,
            actions: [
                {
                    id: "proceed",
                    label: i18n.t(`module.jitsi_meet.admin.action.${action}`),
                    variant: "cancel",
                },
                {
                    id: "cancel",
                    label: i18n.t("ui.reuse.cancel"),
                    variant: "neutral",
                },
            ],
        });
        if (choice !== "proceed") return;
        button.disabled = true;
        try {
            const execute =
                action === "delete"
                    ? gateway.deleteAdminMeeting
                    : gateway.terminateAdminMeeting;
            await execute({ meetingId: button.dataset.meetingId });
            showToast(i18n.t("module.jitsi_meet.admin.action.completed"), {
                variant: "success",
            });
            await refresh();
        } finally {
            button.disabled = false;
        }
    }

    function startPolling() {
        if (refreshTimer !== null) return;
        refreshTimer = setInterval(() => {
            void refresh().catch(reportFailure);
        }, REFRESH_INTERVAL_MS);
    }

    function stopPolling() {
        if (refreshTimer === null) return;
        clearInterval(refreshTimer);
        refreshTimer = null;
    }

    function startUpcomingPolling() {
        if (upcomingRefreshTimer !== null) return;
        upcomingRefreshTimer = setInterval(() => {
            void refreshUpcoming().catch(reportFailure);
        }, REFRESH_INTERVAL_MS);
    }

    function stopUpcomingPolling() {
        if (upcomingRefreshTimer === null) return;
        clearInterval(upcomingRefreshTimer);
        upcomingRefreshTimer = null;
    }

    return {
        id: "jitsi-meetings",
        label: i18n.t("ui.reuse.meetings"),
        dataReady: ensurePageStylesheet(
            "/static/modules/jitsi-meet/styles/admin-meetings.css",
        ),
        subComposerOptions: {
            allowCustomization: false,
            preferenceKey: "administration-jitsi-meetings-layout",
            heading: i18n.t("ui.reuse.meetings"),
            onUnmount: () => {
                stopPolling();
                stopUpcomingPolling();
                if (panelRoot) panelRoot.onclick = null;
                panelRoot = null;
                upcomingPanelRoot = null;
            },
            onRender: () => {
                panelRoot = document.querySelector(
                    "#jitsi-admin-meetings-root",
                );
                if (!(panelRoot instanceof HTMLElement)) {
                    stopPolling();
                } else {
                    void refresh().catch(reportFailure);
                    panelRoot.onclick = (event) => {
                        void handleAction(event).catch(reportFailure);
                    };
                    startPolling();
                }
                upcomingPanelRoot = document.querySelector(
                    "#jitsi-admin-upcoming-meetings-root",
                );
                if (!(upcomingPanelRoot instanceof HTMLElement)) {
                    stopUpcomingPolling();
                } else {
                    void refreshUpcoming().catch(reportFailure);
                    startUpcomingPolling();
                }
            },
            elements: [
                {
                    id: "jitsi-live-meetings",
                    label: i18n.t(
                        "module.jitsi_meet.admin.meetings.table_label",
                    ),
                    pinned: true,
                    render: () => renderPanel(filter),
                },
            ],
        },
    };
}
