export const guides = [
    {
        owner: "module.jitsi-meet.details",
        definitions: [
            {
                id: "meeting",
                page: ({ pathname }) => /^\/meetings?$/.test(pathname),
                titleKey: "module.jitsi-meet.tutorial.more.meeting.title",
                steps: [
                    {
                        id: "step1",
                        selector: ".jitsi-stage-frame-wrap",
                        titleKey:
                            "module.jitsi-meet.tutorial.more.meeting.step1.title",
                        bodyKey:
                            "module.jitsi-meet.tutorial.more.meeting.step1.body",
                    },
                    {
                        id: "step2",
                        selector: ".jitsi-chat-pane",
                        titleKey:
                            "module.jitsi-meet.tutorial.more.meeting.step2.title",
                        bodyKey:
                            "module.jitsi-meet.tutorial.more.meeting.step2.body",
                    },
                    {
                        id: "step3",
                        selector: ".jitsi-stage-actions",
                        titleKey:
                            "module.jitsi-meet.tutorial.more.meeting.step3.title",
                        bodyKey:
                            "module.jitsi-meet.tutorial.more.meeting.step3.body",
                    },
                ],
                scope: "#jitsi-meeting-frame:not([hidden])",
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
                    "module.jitsi-meet.tutorial.more.administration.title",
                steps: [
                    {
                        id: "step1",
                        selector: ".jitsi-admin-filters",
                        titleKey:
                            "module.jitsi-meet.tutorial.more.administration.step1.title",
                        bodyKey:
                            "module.jitsi-meet.tutorial.more.administration.step1.body",
                    },
                    {
                        id: "step2",
                        selector: "#jitsi-admin-meetings-root",
                        titleKey:
                            "module.jitsi-meet.tutorial.more.administration.step2.title",
                        bodyKey:
                            "module.jitsi-meet.tutorial.more.administration.step2.body",
                    },
                ],
                scope: "#jitsi-admin-meetings-root",
            },
        ],
        minRole: "admin",
    },
];
