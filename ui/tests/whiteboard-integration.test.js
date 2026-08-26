import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function readJitsiUiBundle() {
    return readFileSync(resolve(ROOT, "ui/app/mount-surface.js"), "utf8");
}

test("meeting whiteboards use ctx discovery and synchronized component windows", () => {
    const apiSource = readFileSync(
        resolve(ROOT, "api/whiteboard-routes.js"),
        "utf8",
    );
    const apiIndexSource = readFileSync(resolve(ROOT, "api/index.js"), "utf8");
    const storeSource = readFileSync(resolve(ROOT, "api/store.js"), "utf8");
    const meetingsRoutesSource = readFileSync(
        resolve(ROOT, "api/meetings-routes.js"),
        "utf8",
    );
    const buttonSource = readFileSync(
        resolve(ROOT, "ui/whiteboard-button.js"),
        "utf8",
    );
    const helpersSource = readFileSync(
        resolve(ROOT, "ui/jitsi-helpers.js"),
        "utf8",
    );
    const appIndexSource = readFileSync(
        resolve(ROOT, "ui/app/index.js"),
        "utf8",
    );
    const reuseResourcesSource = readFileSync(
        resolve(ROOT, "ui/reuse/resources.js"),
        "utf8",
    );
    const appSource = readJitsiUiBundle();
    const stylesheet = readFileSync(resolve(ROOT, "ui/jitsi-meet.css"), "utf8");
    assert.doesNotMatch(apiSource, /spawnWhiteboardWindow/);
    assert.doesNotMatch(apiSource, /nextcloud-whiteboard/);
    assert.match(
        storeSource,
        /state\.whiteboardId[\s\S]*?whiteboardOpen:\s*state\.whiteboardActive/,
    );
    assert.match(buttonSource, /state\.meeting\?\.state\?\.whiteboardOpen/);
    assert.match(
        meetingsRoutesSource,
        /state:\s*buildPollingMeetingState\(meeting, state\)/,
    );
    assert.match(
        meetingsRoutesSource,
        /state:\s*buildPollingMeetingState\([\s\S]*?resolved\.meeting,[\s\S]*?resolved\.state/,
    );
    assert.match(
        buttonSource,
        /sharedOpenRequested = true;[\s\S]*?trigger\.button\.click\(\)/,
    );
    assert.match(buttonSource, /module\.nextcloud\.whiteboard\.canvas/);
    assert.match(buttonSource, /whiteboard:uiGateway/);
    assert.match(buttonSource, /createDisposableCanvas/);
    assert.match(buttonSource, /title:\s*state\.meeting\.meetingName/);
    assert.match(
        buttonSource,
        /disposableCanvas = participantHandles\.length === 0/,
    );
    assert.match(buttonSource, /instantCanvas: trigger\.disposableCanvas/);
    assert.match(buttonSource, /disposable: trigger\.disposableCanvas/);
    assert.match(buttonSource, /component-pages:request/);
    assert.match(buttonSource, /component-pages:spawn/);
    assert.match(
        buttonSource,
        /spawnComponentPage\(\{[\s\S]*?borderless:\s*true/,
    );
    assert.match(buttonSource, /ui:makeFloatingWindow/);
    assert.match(buttonSource, /trigger\.componentWindowPending = true/);
    assert.match(
        buttonSource,
        /if \(trigger\.componentWindow\)[\s\S]*?closeComponentWindow\(trigger\)[\s\S]*?active:\s*false/,
    );
    assert.match(
        buttonSource,
        /setButtonActive\(button, true\)[\s\S]*?trigger\.componentWindowPending = true/,
    );
    assert.match(
        buttonSource,
        /whiteboardOpen !== true &&[\s\S]*?componentWindowPending !== true/,
    );
    assert.match(
        buttonSource,
        /apiFetch\([\s\S]*?active:\s*true[\s\S]*?makeFloatingWindow\([\s\S]*?await spawnComponentWindowWithRetry/,
    );
    assert.match(
        buttonSource,
        /for \(let attempt = 0; attempt < 4; attempt \+= 1\)[\s\S]*?waitForProviderRetry\(trigger\.signal, 250\)/,
    );
    assert.match(
        buttonSource,
        /Failed to fetch dynamically imported module[\s\S]*?break;/,
    );
    assert.match(buttonSource, /loadFailed:\s*false/);
    assert.match(
        buttonSource,
        /trigger\.loadFailed !== true[\s\S]*?trigger\.button\.click\(\)/,
    );
    assert.match(
        buttonSource,
        /trigger\.loadFailed = true;[\s\S]*?setButtonDisabled\(trigger\.button, true\)[\s\S]*?whiteboard\.load_failed/,
    );
    assert.match(buttonSource, /document\.createElement\("a"\)/);
    assert.match(
        buttonSource,
        /dataset\.hovered === "true"[\s\S]*?classList\.toggle\("btn-confirm", confirmed\)[\s\S]*?classList\.toggle\("btn-neutral", !confirmed\)/,
    );
    assert.match(
        buttonSource,
        /"mouseenter"[\s\S]*?setButtonHovered\(button, true\)[\s\S]*?"mouseleave"[\s\S]*?setButtonHovered\(button, false\)/,
    );
    assert.match(buttonSource, /aria-disabled/);
    assert.match(
        apiIndexSource,
        /"\/static\/styles\/page-builder\.css"[\s\S]*?"\/static\/modules\/jitsi-meet\/jitsi-meet\.css"/,
    );
    assert.doesNotMatch(buttonSource, /pointer(?:down|move|up)/i);
    assert.doesNotMatch(buttonSource, /componentPage\.load/);
    assert.match(buttonSource, /elementId:\s*trigger\.frameWrap\.id/);
    assert.match(buttonSource, /whiteboardId/);
    assert.match(buttonSource, /context:\s*\{[\s\S]*?whiteboardId/);
    assert.match(buttonSource, /componentWindow\?\.discard/);
    assert.match(buttonSource, /ui:ensureProvidersLoaded/);
    assert.match(
        buttonSource,
        /ensureProvidersLoaded\(\{ force: attempt > 0 \}\)/,
    );
    assert.match(buttonSource, /crypto\?\.randomUUID/);
    assert.match(buttonSource, /mode:\s*"overlay"/);
    assert.match(buttonSource, /frameless:\s*true/);
    assert.match(buttonSource, /component-pages:discard/);
    assert.match(buttonSource, /whiteboard\/state/);
    assert.match(buttonSource, /export function closeMeetingWhiteboard/);
    assert.match(appSource, /syncMeetingWhiteboardComponent/);
    assert.match(
        stylesheet,
        /\.jitsi-stage-frame-wrap\s*\{[\s\S]*?display:\s*grid;/,
    );
    assert.doesNotMatch(stylesheet, /\.jitsi-component-window/);
    assert.match(
        stylesheet,
        /\.jitsi-meeting-stage:has\([\s\S]*?\.component-page-stage--borderless[\s\S]*?height:\s*auto;/,
    );
    assert.match(
        stylesheet,
        /\.jitsi-stage-frame-wrap\.component-page-stage--borderless\s*\{[\s\S]*?height:\s*auto;[\s\S]*?overflow:\s*visible;/,
    );
    assert.match(
        buttonSource,
        /button\.className = "btn-neutral btn-animated";/,
    );
    assert.match(appIndexSource, /await loadReuseStylesheet\(\)/);
    assert.match(
        appIndexSource,
        /ensureStylesheetLoaded,[\s\S]*?from "\.\.\/jitsi-helpers\.js";/,
    );
    assert.match(
        helpersSource,
        /export function ensureStylesheetLoaded\(stylesheetUrl\)[\s\S]*?ensurePageStylesheet\(stylesheetUrl\)/,
    );
    assert.match(
        reuseResourcesSource,
        /uiCtx\.capabilities\.get\("ui:reuse"\)/,
    );
    assert.match(reuseResourcesSource, /reuseResources\.importModule\(path\)/);
    assert.match(
        reuseResourcesSource,
        /loadReuseStylesheet = \(\) => reuseResources\.loadCommonStyles\(\)/,
    );
    const lifecycleSource = readFileSync(
        resolve(ROOT, "api/meeting-lifecycle-routes.js"),
        "utf8",
    );
    const meetingRestartSource = lifecycleSource.slice(
        lifecycleSource.indexOf("if (!state.firstJoinedBy || state.endedAt)"),
        lifecycleSource.indexOf("meetingStarted = true"),
    );
    assert.doesNotMatch(meetingRestartSource, /whiteboardId:\s*null/);
});
