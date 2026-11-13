export const guides = [
    {
        owner: "module.jitsi-meet.details",
        definitions: [
            {
                id: "meeting",
                page: ({ pathname }) => /^\/meetings?$/.test(pathname),
                titleKey: "module.jitsi.meet.tutorial.more.meeting.title",
                steps: [
                    {
                        highlightNext: true,
                        id: "in-call-controls",
                        selector: ".jitsi-stage-frame-wrap",
                        titleKey:
                            "module.jitsi.meet.tutorial.more.meeting.in.call.controls.title",
                        bodyKey:
                            "module.jitsi.meet.tutorial.more.meeting.in.call.controls.body",
                    },
                    {
                        highlightNext: true,
                        id: "meeting-chat",
                        when: ({ targetAvailable }) => targetAvailable,
                        selector: ".jitsi-chat-pane",
                        titleKey:
                            "module.jitsi.meet.tutorial.more.meeting.meeting.chat.title",
                        bodyKey:
                            "module.jitsi.meet.tutorial.more.meeting.meeting.chat.body",
                    },
                    {
                        highlightNext: true,
                        id: "sharing-and-whiteboard",
                        selector: ".jitsi-stage-actions",
                        titleKey:
                            "module.jitsi.meet.tutorial.more.meeting.sharing.and.whiteboard.title",
                        bodyKey:
                            "module.jitsi.meet.tutorial.more.meeting.sharing.and.whiteboard.body",
                    },
                ],
                scope: ".jitsi-route-root",
                visibleWhen: "#jitsi-meeting-frame:not([hidden])",
            },
        ],
    },
    {
        owner: "module.jitsi-meet.administration",
        definitions: [
            {
                id: "administration",
                page: "/administration",
                titleKey:
                    "module.jitsi.meet.tutorial.more.administration.title",
                steps: [
                    {
                        highlightNext: true,
                        id: "meeting-status",
                        selector: ".jitsi-admin-filters",
                        titleKey:
                            "module.jitsi.meet.tutorial.more.administration.meeting.status.title",
                        bodyKey:
                            "module.jitsi.meet.tutorial.more.administration.meeting.status.body",
                    },
                    {
                        highlightNext: true,
                        id: "terminate-or-delete",
                        selector: "button[data-meeting-action]:not(:disabled)",
                        targetMatch: "first",
                        titleKey:
                            "module.jitsi.meet.tutorial.more.administration.terminate.or.delete.title",
                        bodyKey:
                            "module.jitsi.meet.tutorial.more.administration.terminate.or.delete.body",
                    },
                ],
                scope: "#jitsi-admin-meetings-root",
            },
        ],
        minRole: "admin",
    },
];
