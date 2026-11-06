import {
    buildStageMarkup,
    buildParticipantsMarkup,
} from "../../templates/markup.js";
import { mountProvider } from "../../tutorials/provider.js";

/** Browser contract fixture using the module's real empty meeting and participant markup. */
export async function mountTutorialExample() {
    const ctx = globalThis[Symbol.for("cognis.uiCtx")];
    const reuse = ctx.capabilities.get("ui:reuse");
    const { createI18n } = await reuse.importModule("i18n.js");
    const { ensurePersistentStylesheet } =
        await reuse.importModule("page-styles.js");
    await ensurePersistentStylesheet(
        "/static/modules/jitsi-meet/styles/jitsi-meet.css",
    );
    const i18n = await createI18n({
        componentStringBaseUrls: ["/static/modules/jitsi-meet/languages"],
    });
    const root = document.createElement("section");
    root.id = "jitsi-tutorial-example";
    root.className = "jitsi-route-root";
    root.innerHTML = buildStageMarkup(i18n) + buildParticipantsMarkup(i18n);
    root.querySelector(".jitsi-meeting-stage").style.height = "320px";
    document.querySelector("main").replaceChildren(root);
    history.replaceState(null, "", "/meetings");
    const lifetime = new AbortController();
    await mountProvider({
        signal: lifetime.signal,
        capabilities: ctx.capabilities,
    });
    const session = await ctx.capabilities
        .get("jitsi-meet:tutorials")
        .start({ firstTime: true });
    await session.ready;
    return session.state();
}
