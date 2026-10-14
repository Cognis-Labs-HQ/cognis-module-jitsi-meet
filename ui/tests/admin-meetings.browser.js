import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { openChromium } from "./reuse/chromium.js";
import { createMeetingAdminTemplates } from "../templates/admin-meetings.js";

const strings = await readFile(
    new URL("../languages/en/strings.xml", import.meta.url),
    "utf8",
);
const labels = new Map(
    [...strings.matchAll(/<string name="([^"]+)">([^<]*)<\/string>/g)].map(
        (match) => [match[1], match[2]],
    ),
);
const templates = createMeetingAdminTemplates({
    i18n: { t: (key) => labels.get(key) ?? key },
    escapeHtml: (value) =>
        String(value)
            .replaceAll("&", "&amp;")
            .replaceAll('"', "&quot;")
            .replaceAll("<", "&lt;"),
    formatDateTime: (value) => value ?? "Unknown",
});
const styles = await readFile(
    new URL("../styles/admin-meetings.css", import.meta.url),
    "utf8",
);
const markup = templates.renderPanel("issues");
const rows = templates.renderRows([
    {
        id: "b544d737-93ec-4d93-8dee-eb9cf3ac3ca6",
        meetingName: "Onyx-Meadow-Cabin-Flame",
        meetingUrl: "https://meet.example/Onyx-Meadow-Cabin-Flame",
        chatRoomId: "77c2631b-f603-4b72-94bd-03989d38ec19",
        participantCount: 3,
        activeUsernames: ["alice"],
        updatedAt: "Oct 14, 2026, 10:00",
        issues: ["duplicateParticipants", "sharedChatroom"],
    },
]);
const server = createServer((_req, res) =>
    res.end("<!doctype html><title>Administration fixture</title>"),
);
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await openChromium();
try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.setContent(`<style>
        :root { --border: #556; --surface-soft: #223; --text-muted: #99a; --accent: #3a7; }
        body { margin: 0; font: 16px sans-serif; }
        button:hover:not([class*="btn-"]) { transform: translateY(-1px); }
        button { padding: 10px; }
        #fixture { width: 1200px; }
        ${styles}
    </style><main id="fixture">${markup}</main>`);
    const measurements = await page.evaluate((content) => {
        document.querySelector("#jitsi-admin-meetings-root tbody").innerHTML =
            content;
        const active = document.querySelector("#jitsi-admin-meetings-root");
        const upcoming = document.querySelector(
            "#jitsi-admin-upcoming-meetings-root",
        );
        const references = document.querySelector("details");
        const button = document.querySelector("[data-meeting-filter]");
        const pill = document.querySelector(".jitsi-admin-issue-pill");
        const filter = document.querySelector(".jitsi-admin-filters");
        const desktop = document.querySelector(".jitsi-admin-table-scroll");
        const result = {
            columns: active.querySelectorAll("th").length,
            upcomingColumns: upcoming.querySelectorAll("th").length,
            gap:
                upcoming.getBoundingClientRect().top -
                active.getBoundingClientRect().bottom,
            pillFont: parseFloat(getComputedStyle(pill).fontSize),
            referencesClosed: !references.open,
            desktopOverflow: desktop.scrollWidth > desktop.clientWidth,
            hoverMatchesGeneric: button.matches('button:not([class*="btn-"])'),
            filterTopInset:
                button.getBoundingClientRect().top -
                filter.getBoundingClientRect().top,
        };
        references.open = true;
        result.referenceVisible = references.textContent.includes(
            "77c2631b-f603-4b72-94bd-03989d38ec19",
        );
        document.querySelector("#fixture").style.width = "360px";
        result.mobilePageOverflow =
            document.querySelector("#fixture").scrollWidth > 360;
        result.mobileTableScroll = desktop.scrollWidth > desktop.clientWidth;
        return result;
    }, rows);
    assert.equal(measurements.columns, 5);
    assert.equal(measurements.upcomingColumns, 4);
    assert.ok(measurements.gap >= 32);
    assert.equal(measurements.pillFont, 12);
    assert.equal(measurements.referencesClosed, true);
    assert.equal(measurements.referenceVisible, true);
    assert.equal(measurements.desktopOverflow, false);
    assert.equal(measurements.hoverMatchesGeneric, false);
    assert.ok(measurements.filterTopInset >= 4);
    assert.equal(measurements.mobilePageOverflow, false);
    assert.equal(measurements.mobileTableScroll, true);
    console.log(
        "Meeting administration spacing, issue pills, references, filter containment and responsive table checks passed.",
    );
} finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
}
