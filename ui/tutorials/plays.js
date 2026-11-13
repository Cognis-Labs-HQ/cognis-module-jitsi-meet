export const definition = {
    version: 1,
    page: "/meetings",
    id: "introduction",
    titleKey: "module.jitsi.meet.tutorial.title",
    steps: [
        {
            highlightNext: true,
            id: "welcome",
            target: "welcome",
            titleKey: "module.jitsi.meet.tutorial.welcome.title",
            bodyKey: "module.jitsi.meet.tutorial.welcome.body",
            effects: {
                callout: true,
                arrow: true,
                spotlight: true,
            },
            missing: {
                timeoutMs: 5000,
                action: "retry",
            },
            route: "/meetings",
        },
        {
            highlightNext: true,
            id: "meetings",
            titleKey: "module.jitsi.meet.tutorial.meetings.title",
            bodyKey: "module.jitsi.meet.tutorial.meetings.body",
            effects: {
                callout: true,
                arrow: true,
                spotlight: true,
            },
            missing: {
                timeoutMs: 5000,
                action: "retry",
            },
            target: "meetings",
        },
        {
            highlightNext: true,
            id: "participants",
            titleKey: "module.jitsi.meet.tutorial.participants.title",
            bodyKey: "module.jitsi.meet.tutorial.participants.body",
            effects: {
                callout: true,
                arrow: true,
                spotlight: true,
            },
            missing: {
                timeoutMs: 5000,
                action: "retry",
            },
            target: "participants",
        },
        {
            highlightNext: true,
            id: "start",
            target: "start",
            titleKey: "module.jitsi.meet.tutorial.start.title",
            bodyKey: "module.jitsi.meet.tutorial.start.body",
            effects: { callout: true, arrow: true, spotlight: true },
            when: ({ targetAvailable }) => targetAvailable,
        },
    ],
};
