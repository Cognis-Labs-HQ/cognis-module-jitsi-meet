import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { chromium } from "playwright";

globalThis[Symbol.for("cognis.uiCtx")] = {
    capabilities: {
        get: () => ({ importModule: async () => ({ escapeHtml: String }) }),
    },
};
const { buildStageMarkup } = await import("../markup.js");
const resources = await readFile(
    new URL("../languages/en/strings.xml", import.meta.url),
    "utf8",
);
const labels = new Map(
    [...resources.matchAll(/<string name="([^"]+)">([^<]*)<\/string>/g)].map(
        (match) => [match[1], match[2]],
    ),
);
const server = createServer(async (request, response) => {
    const url = new URL(request.url, "http://fixture");
    if (url.pathname === "/") {
        response.setHeader("Content-Type", "text/html");
        response.end("<!doctype html><title>Meeting fixture</title>");
        return;
    }
    if (
        !/^\/ui\/[a-z0-9/.-]+\.js$/.test(url.pathname) ||
        url.pathname.includes("..")
    ) {
        response.writeHead(404).end();
        return;
    }
    try {
        const source = await readFile(
            new URL(`../${url.pathname.slice(4)}`, import.meta.url),
            "utf8",
        );
        response.setHeader("Content-Type", "text/javascript");
        response.end(source);
    } catch {
        response.writeHead(404).end();
    }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    headless: true,
});
try {
    const page = await browser.newPage();
    const styles = (
        await Promise.all(
            ["meeting-stage.css", "jitsi-meet.css"].map((file) =>
                readFile(new URL(`../${file}`, import.meta.url), "utf8"),
            ),
        )
    )
        .join("\n")
        .replace(/@import[^;]+;/g, "");
    await page.goto(base);
    await page.setContent(`<!doctype html><style>
        body { color: black; }
        .jitsi-route-root { color: var(--text); font: 16px monospace; --text: #e0e0e0; }
        button { font: inherit; padding: 8px 18px; border: 1px solid transparent; }
        .floating-window { margin: 0; padding: 0; border: 1px solid transparent; border-radius: 12px; overflow: hidden; }
        * { box-sizing: border-box; }
        .jitsi-route-root { height: 400px; width: 900px; }
        .jitsi-stage-header { height: 60px; flex: none; }
        .mount-host { min-height: 12rem; overflow: visible; }
        .mounted-component { display: block; min-height: 0; }
        .provider-surface { height: 100%; contain: size; display: grid; grid-template-rows: 60px minmax(0, 1fr); overflow: hidden; }
        .provider-canvas { height: 100%; overflow: hidden; }
        ${styles}
    </style><div class="jitsi-route-root">${buildStageMarkup({ t: (key) => labels.get(key) ?? key })}</div>`);
    await page.evaluate(() => {
        const host = document.querySelector(".jitsi-whiteboard-component-host");
        host.classList.add("mount-host");
        host.innerHTML =
            '<section class="mounted-component"><div class="provider-surface"><header>Tools</header><div class="provider-canvas"><canvas style="height:2000px" height="2000"></canvas></div></div></section>';
    });
    for (const height of [400, 300, 600, 350]) {
        const sizes = await page.evaluate((height) => {
            document.querySelector(".jitsi-route-root").style.height =
                `${height}px`;
            const shell = document.querySelector(
                ".jitsi-whiteboard-component-shell",
            );
            shell.hidden = true;
            document.querySelector("#jitsi-overlay").hidden = true;
            shell.hidden = false;
            const stage = document.querySelector(".jitsi-stage-frame-wrap");
            const host = document.querySelector(
                ".jitsi-whiteboard-component-host",
            );
            const surface = document.querySelector(".provider-surface");
            return {
                stage: stage.clientHeight,
                host: host.clientHeight,
                surface: surface.clientHeight,
                scroll: host.scrollHeight,
                canvas: document.querySelector(".provider-canvas").clientHeight,
            };
        }, height);
        assert.equal(sizes.stage, height - 60);
        assert.equal(sizes.host, sizes.stage);
        assert.equal(
            sizes.surface,
            sizes.host,
            "A contained provider must remain visible and fill the meeting viewport",
        );
        assert.equal(
            sizes.scroll,
            sizes.host,
            "Provider content must not expand the meeting viewport",
        );
        assert.equal(sizes.canvas, sizes.host - 60);
    }
    const result = await page.evaluate(
        async ({ base, aloneMessage }) => {
            globalThis[Symbol.for("cognis.uiCtx")] = {
                capabilities: {
                    get: (name) =>
                        name === "ui:reuse"
                            ? {
                                  importModule: () => {
                                      throw new Error("Unexpected host import");
                                  },
                              }
                            : undefined,
                },
            };
            const { floatMeetingWindow } = await import(
                `${base}/ui/meeting-window.js`
            );
            const { createMountUtilities } = await import(
                `${base}/ui/app/mount-surface.js`
            );
            const root = document.querySelector(".jitsi-route-root");
            const frame = root.querySelector("#jitsi-meeting-frame");
            const overlay = root.querySelector("#jitsi-overlay");
            const parent = frame.parentElement;
            const state = {
                preflightStatus: "passed",
                preflightMessage: "Ready",
            };
            const utilities = createMountUtilities({ root, state });
            overlay.querySelector(".jitsi-overlay-active-meetings").hidden =
                true;
            utilities.updateOverlay({
                message: "Select participants",
                canStart: true,
            });
            const visibleButtons = () =>
                [...overlay.querySelectorAll(".jitsi-overlay-actions button")]
                    .filter(
                        (button) => button.getBoundingClientRect().height > 0,
                    )
                    .map((button) => button.id);
            const initialButtons = visibleButtons();
            const styleValues = () => {
                const styles = getComputedStyle(overlay);
                return [
                    styles.color,
                    styles.fontFamily,
                    styles.fontSize,
                    styles.backgroundImage,
                    styles.padding,
                    styles.gap,
                ];
            };
            const beforeStyle = styleValues();
            const fullSizeAppearance = () => {
                const title = overlay.querySelector(".jitsi-overlay-title");
                const readiness = overlay.querySelector("#jitsi-loading");
                const start = overlay.querySelector("#jitsi-start-btn");
                return {
                    title: title.getBoundingClientRect().height > 0,
                    readiness: readiness.getBoundingClientRect().height > 0,
                    startDisabled: start.disabled,
                    buttons: visibleButtons(),
                };
            };
            utilities.updateOverlay({
                message: aloneMessage,
                showAlonePrompt: true,
            });
            const fullSizeAlone = fullSizeAppearance();
            frame.hidden = false;
            let suppliedOptions;
            const release = floatMeetingWindow(
                frame,
                overlay,
                (element, options) => {
                    suppliedOptions = options;
                    if (options.portal !== false) document.body.append(element);
                    element.classList.add("floating-window");
                    element.style.cssText =
                        "position:fixed;left:10px;top:10px;width:400px;height:225px";
                    if (options.topLayer) {
                        element.setAttribute("popover", "manual");
                        element.showPopover();
                    }
                    const restore = () => {
                        element.hidePopover();
                        element.removeAttribute("popover");
                        element.classList.remove("floating-window");
                        element.style.cssText = "";
                    };
                    restore.updateMinimumSize = () => true;
                    return restore;
                },
                { preserveBrowsingContext: true },
            );
            utilities.updateOverlay({
                message: aloneMessage,
                showAlonePrompt: true,
            });
            const aloneButtons = visibleButtons();
            const afterStyle = styleValues();
            const frameRect = frame.getBoundingClientRect();
            const overlayRect = overlay.getBoundingClientRect();
            const coversFrame =
                Math.abs(overlayRect.height - frame.clientHeight) <= 1 &&
                Math.abs(overlayRect.width - frame.clientWidth) <= 1 &&
                overlayRect.top >= frameRect.top &&
                overlayRect.left >= frameRect.left;
            const overflow = overlay.scrollHeight - overlay.clientHeight;
            const initialContentHidden = [
                ...overlay.querySelectorAll(
                    ".jitsi-overlay-title,.jitsi-staged-participants,.jitsi-overlay-active-meetings,#jitsi-loading",
                ),
            ].every((element) => element.getBoundingClientRect().height === 0);
            const retainedMinimumSize =
                typeof release.updateMinimumSize === "function";
            release();
            parent.append(overlay);
            const restoredAlone = fullSizeAppearance();
            utilities.updateOverlay({
                message: "Select participants",
                canStart: true,
            });
            return {
                initialButtons,
                fullSizeAlone,
                restoredAlone,
                aloneButtons,
                restoredButtons: visibleButtons(),
                beforeStyle,
                afterStyle,
                suppliedOptions,
                coversFrame,
                overflow,
                initialContentHidden,
                retainedMinimumSize,
                sameParent: frame.parentElement === parent,
            };
        },
        {
            base,
            aloneMessage: labels.get("module.jitsi_meet.overlay.alone_prompt"),
        },
    );
    assert.deepEqual(result.initialButtons, ["jitsi-start-btn"]);
    assert.deepEqual(result.fullSizeAlone, {
        title: true,
        readiness: true,
        startDisabled: true,
        buttons: [
            "jitsi-start-btn",
            "jitsi-leave-alone-btn",
            "jitsi-remain-alone-btn",
        ],
    });
    assert.deepEqual(result.restoredAlone, result.fullSizeAlone);
    assert.deepEqual(result.aloneButtons, [
        "jitsi-leave-alone-btn",
        "jitsi-remain-alone-btn",
    ]);
    assert.deepEqual(result.restoredButtons, result.initialButtons);
    assert.deepEqual(
        result.afterStyle,
        result.beforeStyle,
        "PiP preserves the existing overlay presentation",
    );
    assert.equal(result.suppliedOptions.portal, false);
    assert.equal(result.suppliedOptions.topLayer, true);
    assert.equal(result.suppliedOptions.preserveBrowsingContext, true);
    assert.equal(result.sameParent, true);
    assert.equal(result.coversFrame, true);
    assert.equal(
        result.overflow,
        0,
        "The alone prompt fits the existing minimum PiP size without vertical scrolling",
    );
    assert.equal(result.initialContentHidden, true);
    assert.equal(result.retainedMinimumSize, true);
    console.log(
        "Meeting viewport and PiP overlay appearance, separate states and no-scroll checks passed.",
    );
} finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
}
