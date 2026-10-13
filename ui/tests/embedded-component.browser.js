import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

globalThis[Symbol.for("cognis.uiCtx")] = {
    capabilities: {
        get: () => ({ importModule: async () => ({ escapeHtml: String }) }),
    },
};
const { buildStageMarkup } = await import("../markup.js");
const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    headless: true,
});
try {
    const page = await browser.newPage();
    const styles = await readFile(
        new URL("../meeting-stage.css", import.meta.url),
        "utf8",
    );
    await page.setContent(`<!doctype html><style>
        * { box-sizing: border-box; }
        .jitsi-route-root { height: 400px; width: 900px; }
        .jitsi-stage-header { height: 60px; flex: none; }
        .mount-host { min-height: 12rem; overflow: visible; }
        .mounted-component { display: block; min-height: 0; }
        .provider-surface { height: 100%; contain: size; display: grid; grid-template-rows: 60px minmax(0, 1fr); overflow: hidden; }
        .provider-canvas { height: 100%; overflow: hidden; }
        ${styles}
    </style><div class="jitsi-route-root">${buildStageMarkup({ t: (key) => key })}</div>`);
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
    const windowSource = await readFile(
        new URL("../meeting-window.js", import.meta.url),
        "utf8",
    );
    await page.addScriptTag({
        content:
            windowSource.replace("export function", "function") +
            "\nwindow.floatMeetingWindow = floatMeetingWindow;",
    });
    const floating = await page.evaluate(() => {
        const frame = document.querySelector("#jitsi-meeting-frame");
        const overlay = document.querySelector("#jitsi-overlay");
        const parent = frame.parentElement;
        frame.hidden = false;
        overlay.hidden = false;
        const release = window.floatMeetingWindow(
            frame,
            overlay,
            (element) => {
                document.body.append(element);
                element.style.cssText =
                    "position:fixed;left:10px;top:10px;width:300px;height:180px";
                return () => {
                    parent.append(element);
                    element.style.cssText = "";
                };
            },
            {},
        );
        const frameRect = frame.getBoundingClientRect();
        const overlayRect = overlay.getBoundingClientRect();
        const matches = ["left", "top", "width", "height"].every(
            (key) => frameRect[key] === overlayRect[key],
        );
        release();
        return {
            matches,
            restored:
                frame.parentElement === parent &&
                !frame.classList.contains("jitsi-route-root"),
        };
    });
    assert.equal(
        floating.matches,
        true,
        "The overlay must cover the meeting after it leaves the route root",
    );
    assert.equal(floating.restored, true);
    console.log(
        "The actual meeting markup bounds its component mount across opening and resizing.",
    );
} finally {
    await browser.close();
}
