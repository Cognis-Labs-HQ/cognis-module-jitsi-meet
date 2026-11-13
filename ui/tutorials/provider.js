import { definition } from "./plays.js";

function lobbyVisible() {
    const lobby = document.querySelector(
        '.jitsi-route-root:not([data-suppress-meeting-overlay="true"]) #jitsi-overlay:not([hidden])',
    );
    return Boolean(
        lobby?.getClientRects().length &&
        !document.querySelector(
            ".jitsi-route-root #jitsi-meeting-frame:not([hidden])",
        ),
    );
}

/** Register only through the host's public tutorial and resource contracts. */
export async function mountProvider(ctx) {
    const api = ctx.capabilities.get("ui:tutorials");
    if (api?.version !== 1) throw new Error("tutorial_contract_unavailable");
    const owner = api.owner("module.jitsi-meet", {
        signal: ctx.signal,
        stringsBaseUrls: ["/static/modules/jitsi-meet/languages"],
    });
    try {
        const targets = {};
        for (const [name, selector] of Object.entries({
            welcome: ".jitsi-participants-pane",
            meetings: ".jitsi-overlay-active-meetings",
            participants: ".jitsi-available-participants-column",
        })) {
            targets[name] = (
                await owner.target(name, {
                    resolve: () => {
                        if (!lobbyVisible()) return null;
                        const matches = document.querySelectorAll(selector);
                        return matches.length === 1 ? matches[0] : null;
                    },
                })
            ).id;
        }
        const play = await owner.register({
            ...definition,
            available: () =>
                ctx.capabilities.get("session:isAuthenticated")?.() === true &&
                ctx.capabilities.get("offline:state")?.isOffline() !== true &&
                lobbyVisible(),
            requires: ["ui:navigate"],
            steps: definition.steps.map((step) => ({
                ...step,
                ...(step.target ? { target: targets[step.target] } : {}),
            })),
        });
        ctx.capabilities.contribute("jitsi-meet:tutorials", play);
        return owner.dispose;
    } catch (error) {
        owner.dispose();
        throw error;
    }
}
