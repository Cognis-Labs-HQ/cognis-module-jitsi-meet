import {
    buildChatMarkup,
    buildParticipantsMarkup,
    buildStageMarkup,
} from "./markup.js";

export function createMeetingPageElements(
    i18n,
    inShareView,
    { includeChat = true } = {},
) {
    const elements = [];
    if (!inShareView) {
        elements.push({
            id: "jitsi-participants",
            label: i18n.t("module.jitsi_meet.participants.heading"),
            pinned: true,
            gridSize: {
                default: [12, 2],
                min: [8, 2],
                max: "full",
            },
            render: () => buildParticipantsMarkup(i18n),
        });
    }
    elements.push({
        id: "jitsi-stage",
        label: i18n.t("module.jitsi_meet.overlay.title"),
        pinned: true,
        gridSize: {
            default: [includeChat ? 8 : 12, 5],
            min: [includeChat ? 6 : 8, 4],
        },
        render: () => buildStageMarkup(i18n),
    });
    if (includeChat) {
        elements.push({
            id: "jitsi-chat",
            label: i18n.t("module.jitsi_meet.chat.heading"),
            pinned: true,
            gridSize: {
                default: [4, 5],
                min: [3, 4],
            },
            render: () => buildChatMarkup(i18n),
        });
    }
    return elements;
}
