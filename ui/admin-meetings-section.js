import { importReuseModule, uiCtx } from "./reuse/resources.js";

const { formatDateTime } = await importReuseModule("timestamp.js");
const { openPopup } = await importReuseModule("popup.js");
const { ensurePageStylesheet } = await importReuseModule("page-styles.js");
import { logUi, showToast } from "./reuse/feedback.js";

const REFRESH_INTERVAL_MS = 2500;
const TABLE_COLUMN_COUNT = 7;
const UPCOMING_TABLE_COLUMN_COUNT = 5;

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

    function renderRows(rows) {
        if (!rows.length) {
            return `<tr><td colspan="${TABLE_COLUMN_COUNT}">${escapeHtml(i18n.t("module.jitsi_meet.admin.meetings.empty"))}</td></tr>`;
        }
        return rows
            .map((row) => {
                const users = Array.isArray(row.activeUsernames)
                    ? row.activeUsernames.join(", ")
                    : "";
                const meetingUrl = String(row.meetingUrl ?? "");
                return `<tr>
          <td style="width: 1%; white-space: nowrap"><code>${escapeHtml(row.id ?? "")}</code></td>
          <td><a href="${escapeHtml(meetingUrl || "#")}" target="_blank" rel="noopener noreferrer">${escapeHtml(meetingUrl || i18n.t("ui.reuse.unknown"))}</a></td>
          <td>${escapeHtml(String(row.participantCount ?? 0))}</td>
          <td>${escapeHtml(users)}</td>
          <td>${escapeHtml(formatDateTime(row.updatedAt, i18n.t("ui.reuse.unknown")))}</td>
          <td>${escapeHtml(row.chatRoomId ?? "")}<br>${(row.issues ?? []).map((issue) => escapeHtml(i18n.t(`module.jitsi_meet.admin.issue.${issue.toLowerCase()}`))).join("<br>")}</td>
          <td><button type="button" class="btn-cancel" data-meeting-action="${row.active ? "terminate" : "delete"}" data-meeting-id="${escapeHtml(row.id)}">${escapeHtml(i18n.t(`module.jitsi_meet.admin.action.${row.active ? "terminate" : "delete"}`))}</button></td>
        </tr>`;
            })
            .join("");
    }

    function renderUpcomingRows(rows) {
        if (!rows.length) {
            return `<tr><td colspan="${UPCOMING_TABLE_COLUMN_COUNT}">${escapeHtml(i18n.t("module.jitsi_meet.admin.meetings.upcoming_empty"))}</td></tr>`;
        }
        return rows
            .map((row) => {
                const createdByLabel =
                    row.createdByDisplayName ?? row.createdBy ?? "";
                const createdAtLabel = formatDateTime(
                    row.createdAt,
                    i18n.t("ui.reuse.unknown"),
                );
                const scheduledAtLabel = formatDateTime(
                    row.scheduledAt ?? row.createdAt,
                    i18n.t("ui.reuse.unknown"),
                );
                const meetingUrl = String(row.meetingUrl ?? "");
                return `<tr>
          <td style="width: 1%; white-space: nowrap"><code>${escapeHtml(row.id ?? "")}</code></td>
          <td><a href="${escapeHtml(meetingUrl || "#")}" target="_blank" rel="noopener noreferrer">${escapeHtml(meetingUrl || i18n.t("ui.reuse.unknown"))}</a></td>
          <td>${escapeHtml(String(row.participantCount ?? 0))}</td>
          <td>${escapeHtml(createdByLabel)}<br><small>${escapeHtml(createdAtLabel)}</small></td>
          <td>${escapeHtml(scheduledAtLabel)}</td>
        </tr>`;
            })
            .join("");
    }

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
                    render: () => `
            <h3 class="components-section-heading">${escapeHtml(i18n.t("module.jitsi_meet.admin.meetings.active_table_heading"))}</h3>
            <div class="users-table-wrap" id="jitsi-admin-meetings-root">
              <div class="jitsi-admin-filters">${["active", "all", "issues"].map((value) => `<button type="button" class="jitsi-admin-filter-button" data-meeting-filter="${value}" aria-pressed="${filter === value}">${escapeHtml(i18n.t(`module.jitsi_meet.admin.filter.${value}`))}</button>`).join("")}</div>
              <table class="users-table">
                <colgroup>
                  <col style="width: 1%" />
                  <col style="width: 24.75%" />
                  <col style="width: 24.75%" />
                  <col style="width: 24.75%" />
                  <col style="width: 24.75%" />
                </colgroup>
                <thead>
                  <tr>
                     <th style="width: 1%; white-space: nowrap">${escapeHtml(i18n.t("ui.reuse.id"))}</th>
                     <th>${escapeHtml(i18n.t("module.jitsi_meet.admin.meetings.meeting_url"))}</th>
                     <th>${escapeHtml(i18n.t("module.jitsi_meet.admin.meetings.participants"))}</th>
                     <th>${escapeHtml(i18n.t("module.jitsi_meet.admin.meetings.active_users"))}</th>
                     <th>${escapeHtml(i18n.t("module.jitsi_meet.admin.meetings.last_active"))}</th>
                     <th>${escapeHtml(i18n.t("module.jitsi_meet.admin.issues"))}</th>
                     <th>${escapeHtml(i18n.t("module.jitsi_meet.admin.actions"))}</th>
                   </tr>
                 </thead>
                                <tbody>
                  <tr><td colspan="${TABLE_COLUMN_COUNT}">${escapeHtml(i18n.t("module.jitsi_meet.admin.meetings.loading"))}</td></tr>
                </tbody>
              </table>
            </div>
          `,
                },
                {
                    id: "jitsi-upcoming-meetings",
                    label: i18n.t(
                        "module.jitsi_meet.admin.meetings.upcoming_table_label",
                    ),
                    pinned: true,
                    render: () => `
            <h3 class="components-section-heading">${escapeHtml(i18n.t("module.jitsi_meet.admin.meetings.upcoming_table_heading"))}</h3>
            <div class="users-table-wrap" id="jitsi-admin-upcoming-meetings-root">
              <table class="users-table">
                <colgroup>
                  <col style="width: 1%" />
                  <col style="width: 24.75%" />
                  <col style="width: 24.75%" />
                  <col style="width: 24.75%" />
                  <col style="width: 24.75%" />
                </colgroup>
                <thead>
                  <tr>
                     <th style="width: 1%; white-space: nowrap">${escapeHtml(i18n.t("ui.reuse.id"))}</th>
                     <th>${escapeHtml(i18n.t("module.jitsi_meet.admin.meetings.meeting_url"))}</th>
                     <th>${escapeHtml(i18n.t("module.jitsi_meet.admin.meetings.participants"))}</th>
                     <th>${escapeHtml(i18n.t("module.jitsi_meet.admin.meetings.created_by"))}</th>
                     <th>${escapeHtml(i18n.t("module.jitsi_meet.admin.meetings.schedule_date"))}</th>
                   </tr>
                 </thead>
                <tbody>
                  <tr><td colspan="${UPCOMING_TABLE_COLUMN_COUNT}">${escapeHtml(i18n.t("module.jitsi_meet.admin.meetings.upcoming_loading"))}</td></tr>
                </tbody>
              </table>
            </div>
          `,
                },
            ],
        },
    };
}
