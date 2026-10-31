export const definition = {
    version: 1,
    id: "introduction",
    titleKey: "module.jitsi-meet.tutorial.title",
    steps: [
        {
            id: "welcome",
            titleKey: "module.jitsi-meet.tutorial.welcome.title",
            bodyKey: "module.jitsi-meet.tutorial.welcome.body",
            effects: {
                callout: true,
                arrow: false,
                spotlight: false,
            },
            missing: {
                timeoutMs: 5000,
                action: "retry",
            },
            route: "/meetings",
        },
        {
            id: "meetings",
            titleKey: "module.jitsi-meet.tutorial.meetings.title",
            bodyKey: "module.jitsi-meet.tutorial.meetings.body",
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
            id: "participants",
            titleKey: "module.jitsi-meet.tutorial.participants.title",
            bodyKey: "module.jitsi-meet.tutorial.participants.body",
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
    ],
};
