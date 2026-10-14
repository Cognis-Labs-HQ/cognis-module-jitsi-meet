export function createMeetingAdminTemplates({
    i18n,
    escapeHtml,
    formatDateTime,
    createCollapsibleSectionComposer,
}) {
    const text = (key) => escapeHtml(i18n.t(key));
    const label = (key) => text(`module.jitsi_meet.admin.${key}`);
    const date = (value) =>
        escapeHtml(formatDateTime(value, i18n.t("ui.reuse.unknown")));

    const referencesComposer = createCollapsibleSectionComposer({
        escapeHtml,
        detailsLabel: i18n.t("module.jitsi_meet.admin.references"),
    });

    function meetingDetails(row, openReferences) {
        const url = String(row.meetingUrl ?? "");
        const name = row.meetingName || url || i18n.t("ui.reuse.unknown");
        const references = [
            ["chatroom", row.chatRoomId],
            ["canvas", row.whiteboardId],
        ]
            .filter(([, id]) => id)
            .map(
                ([kind, id]) =>
                    `<div>${label(kind)}: <code>${escapeHtml(id)}</code></div>`,
            )
            .join("");
        return `<a class="jitsi-admin-meeting-link" href="${escapeHtml(url || "#")}" target="_blank" rel="noopener noreferrer">${escapeHtml(name)}</a>
            <small class="jitsi-admin-record-id">${escapeHtml(row.id ?? "")}</small>
            ${
                references
                    ? referencesComposer.render([
                          {
                              id: `references-${row.id}`,
                              title: i18n.t(
                                  "module.jitsi_meet.admin.references",
                              ),
                              className: "jitsi-admin-references",
                              attributesHtml: `data-meeting-reference="${escapeHtml(row.id)}"`,
                              open: openReferences.has(row.id),
                              contentHtml: references,
                          },
                      ])
                    : ""
            }`;
    }

    function renderRows(rows, filter = "active", openReferences = new Set()) {
        if (!rows.length)
            return `<tr><td class="jitsi-admin-table-cell" colspan="5">${label(`meetings.empty.${filter}`)}</td></tr>`;
        return rows
            .map(
                (row) => `<tr>
            <td class="jitsi-admin-table-cell jitsi-admin-meeting-cell">${meetingDetails(row, openReferences)}</td>
            <td class="jitsi-admin-table-cell">${escapeHtml(String(row.participantCount ?? 0))}<small class="jitsi-admin-active-users">${label("meetings.active_users")}: ${escapeHtml((row.activeUsernames ?? []).join(", ") || "—")}</small></td>
            <td class="jitsi-admin-table-cell">${date(row.updatedAt)}</td>
            <td class="jitsi-admin-table-cell"><div class="jitsi-admin-issue-list">${(row.issues ?? []).map((issue) => `<span class="jitsi-admin-issue-pill">${label(`issue.${issue.toLowerCase()}`)}</span>`).join("")}</div></td>
            <td class="jitsi-admin-table-cell"><button type="button" class="btn-cancel" data-meeting-action="${row.active ? "terminate" : "delete"}" data-meeting-id="${escapeHtml(row.id)}">${label(`action.${row.active ? "terminate" : "delete"}`)}</button></td>
        </tr>`,
            )
            .join("");
    }

    function renderUpcomingRows(rows, openReferences = new Set()) {
        if (!rows.length)
            return `<tr><td class="jitsi-admin-table-cell" colspan="4">${label("meetings.upcoming_empty")}</td></tr>`;
        return rows
            .map(
                (row) => `<tr>
            <td class="jitsi-admin-table-cell jitsi-admin-meeting-cell">${meetingDetails(row, openReferences)}</td>
            <td class="jitsi-admin-table-cell">${escapeHtml(String(row.participantCount ?? 0))}</td>
            <td class="jitsi-admin-table-cell">${escapeHtml(row.createdByDisplayName ?? row.createdBy ?? "")}<small class="jitsi-admin-record-id">${date(row.createdAt)}</small></td>
            <td class="jitsi-admin-table-cell">${date(row.scheduledAt)}</td>
        </tr>`,
            )
            .join("");
    }

    function table(headers, loading) {
        return `<div class="jitsi-admin-table-scroll"><table class="jitsi-admin-table"><thead><tr>${headers.map((key) => `<th class="jitsi-admin-table-heading" scope="col">${label(key)}</th>`).join("")}</tr></thead><tbody><tr><td class="jitsi-admin-table-cell" colspan="${headers.length}">${label(loading)}</td></tr></tbody></table></div>`;
    }

    function renderPanel(filter) {
        return `<div class="jitsi-admin-panels">
            <section class="jitsi-admin-panel" id="jitsi-admin-meetings-root">
                <h3 class="jitsi-admin-heading">${label("meetings.active_table_heading")}</h3>
                <div class="jitsi-admin-filters">${["active", "all", "issues"].map((value) => `<button type="button" class="btn-neutral jitsi-admin-filter-button" data-meeting-filter="${value}" aria-pressed="${filter === value}">${label(`filter.${value}`)}</button>`).join("")}</div>
                ${table(["meetings.meeting_url", "meetings.participants", "meetings.last_active", "issues", "actions"], "meetings.loading")}
            </section>
            <section class="jitsi-admin-panel" id="jitsi-admin-upcoming-meetings-root">
                <h3 class="jitsi-admin-heading">${label("meetings.upcoming_table_heading")}</h3>
                ${table(["meetings.meeting_url", "meetings.participants", "meetings.created_by", "meetings.schedule_date"], "meetings.upcoming_loading")}
            </section>
        </div>`;
    }

    return { renderRows, renderUpcomingRows, renderPanel };
}
