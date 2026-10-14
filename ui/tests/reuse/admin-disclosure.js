export function createCollapsibleSectionComposer({ escapeHtml, detailsLabel }) {
    return {
        render: (rows) =>
            rows
                .map(
                    (row) =>
                        `<details class="${row.className} collapsible-section" data-collapsible-section="${escapeHtml(row.id)}" ${row.attributesHtml}${row.open ? " open" : ""}><summary class="collapsible-section-summary"><span class="collapsible-section-title">${escapeHtml(row.title)}</span><span class="collapsible-section-chevron" role="button" tabindex="0" data-details-toggle aria-label="${escapeHtml(detailsLabel)}">▾</span></summary><div class="collapsible-section-content">${row.contentHtml}</div></details>`,
                )
                .join(""),
    };
}
