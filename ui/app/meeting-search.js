import { normalizeMeetingId } from "../jitsi-helpers.js";

export function createMeetingSearchGroups(state, i18n) {
    return () => {
        const meetings = [
            ...(Array.isArray(state.activeMeetings)
                ? state.activeMeetings
                : []),
            ...(state.meeting?.id ? [state.meeting] : []),
        ];
        const seenIds = new Set();
        const items = [];
        for (const meeting of meetings) {
            const meetingId = normalizeMeetingId(meeting?.id);
            if (!meetingId || seenIds.has(meetingId)) continue;
            seenIds.add(meetingId);
            const title = String(
                meeting?.meetingName ?? i18n.t("ui.reuse.meeting"),
            ).trim();
            const owner = String(
                meeting?.startedBy?.displayName ??
                    meeting?.startedBy?.username ??
                    meeting?.createdBy ??
                    "",
            ).trim();
            const timeLabel = String(
                meeting?.scheduledAt ?? meeting?.createdAt ?? "",
            ).trim();
            items.push({
                id: `meeting:${meetingId}`,
                label: title,
                description: [timeLabel, owner].filter(Boolean).join(" · "),
                url: `/meetings?meetingId=${encodeURIComponent(meetingId)}`,
                resultClass: "page",
                searchText: [
                    title,
                    owner,
                    timeLabel,
                    meeting?.meetingUrl,
                    meeting?.scheduledAt,
                    meeting?.createdAt,
                ]
                    .filter(Boolean)
                    .join(" "),
            });
        }
        return items.length ? [{ category: "Meetings", items }] : [];
    };
}
