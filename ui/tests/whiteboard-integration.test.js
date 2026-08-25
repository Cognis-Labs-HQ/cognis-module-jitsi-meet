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
    const buttonSource = readFileSync(
        resolve(ROOT, "ui/whiteboard-button.js"),
        "utf8",
    );
    const appSource = readJitsiUiBundle();
    const stylesheet = readFileSync(resolve(ROOT, "ui/jitsi-meet.css"), "utf8");
    assert.doesNotMatch(apiSource, /spawnWhiteboardWindow/);
    assert.doesNotMatch(apiSource, /nextcloud-whiteboard/);
    assert.match(buttonSource, /module\.nextcloud\.whiteboard\.canvas/);
    assert.match(buttonSource, /whiteboard:uiGateway/);
    assert.match(buttonSource, /createDisposableCanvas/);
    assert.match(
        buttonSource,
        /disposableCanvas = participantHandles\.length === 0/,
    );
    assert.match(buttonSource, /instantCanvas: trigger\.disposableCanvas/);
    assert.match(buttonSource, /disposable: trigger\.disposableCanvas/);
    assert.match(buttonSource, /component-pages:request/);
    assert.match(buttonSource, /component-pages:spawn/);
    assert.match(buttonSource, /ui:makeFloatingWindow/);
    assert.match(buttonSource, /trigger\.componentWindowPending = true/);
    assert.match(
        buttonSource,
        /whiteboardActive !== true &&[\s\S]*?componentWindowPending !== true/,
    );
    assert.match(
        buttonSource,
        /makeFloatingWindow\([\s\S]*?const authorizedSpawnPromise = spawnComponentWindow/,
    );
    assert.doesNotMatch(buttonSource, /pointer(?:down|move|up)/i);
    assert.doesNotMatch(buttonSource, /componentPage\.load/);
    assert.match(buttonSource, /elementId:\s*trigger\.frameWrap\.id/);
    assert.match(buttonSource, /whiteboardId/);
    assert.match(buttonSource, /context:\s*\{[\s\S]*?whiteboardId/);
    assert.match(buttonSource, /componentWindow\?\.discard/);
    assert.match(buttonSource, /if \(trigger\.componentWindow\) return/);
    assert.match(buttonSource, /ui:ensureProvidersLoaded/);
    assert.match(
        buttonSource,
        /ensureProvidersLoaded\(\{ force: attempt > 0 \}\)/,
    );
    assert.match(buttonSource, /crypto\?\.randomUUID/);
    assert.match(buttonSource, /mode:\s*"overlay"/);
    assert.match(buttonSource, /frameless:\s*true/);
    assert.match(buttonSource, /component-pages:discard/);
    assert.match(
        buttonSource,
        /const authorizedSpawnPromise = spawnComponentWindow[\s\S]*void \(async \(\)/,
    );
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
        /\.jitsi-stage-frame-wrap > \.component-page-window[\s\S]*?width:\s*100%;[\s\S]*?height:\s*100%;/,
    );
    assert.match(
        stylesheet,
        /> \.component-page-window > \.workspace[\s\S]*?margin:\s*0;[\s\S]*?padding:\s*0;/,
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
