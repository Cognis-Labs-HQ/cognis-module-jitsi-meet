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
    const buttonSource = [
        "whiteboard-control.js",
        "whiteboard-provider.js",
        "whiteboard-session.js",
    ]
        .map((file) => readFileSync(resolve(ROOT, "ui", file), "utf8"))
        .join("\n");
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
        /state\.whiteboardId[\s\S]*?whiteboardDisposable:\s*state\.whiteboardDisposable[\s\S]*?whiteboardOpen:\s*state\.whiteboardActive/,
    );
    assert.match(storeSource, /createdBy:\s*meeting\.createdBy/);
    assert.match(storeSource, /hasInvitedParticipants:\s*participants\.some/);
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
        /meetingWhiteboardShouldOpen\(state\.meeting\);[\s\S]*?sharedOpenRequested = true;[\s\S]*?trigger\.button\.click\(\)/,
    );
    assert.match(buttonSource, /module\.nextcloud\.whiteboard\.canvas/);
    assert.match(buttonSource, /whiteboard:uiGateway/);
    assert.match(buttonSource, /keyring:requestUnlock/);
    assert.match(buttonSource, /keyring:isUnlocked/);
    assert.match(buttonSource, /createDisposableCanvas/);
    assert.match(buttonSource, /createCanvas/);
    assert.match(
        buttonSource,
        /!disposableCanvas[\s\S]*?typeof trigger\.whiteboardGateway\.createCanvas !== "function"[\s\S]*?whiteboard_persistent_canvas_unavailable/,
    );
    assert.doesNotMatch(
        buttonSource,
        /typeof trigger\.whiteboardGateway\.createCanvas !== "function"\s*\?\s*trigger\.whiteboardGateway\.createDisposableCanvas/,
    );
    assert.doesNotMatch(buttonSource, /saveCanvasToParticipants/);
    assert.match(
        buttonSource,
        /createCanvas\(\{[\s\S]*?resourceId:\s*meetingName,[\s\S]*?title:\s*meetingName,[\s\S]*?participantHandles/,
    );
    assert.match(
        buttonSource,
        /createDisposableCanvas\(\{[\s\S]*?resourceType:\s*"meeting",[\s\S]*?resourceId:\s*meetingName/,
    );
    assert.match(buttonSource, /meetingHasInvitedParticipants/);
    assert.doesNotMatch(buttonSource, /shouldAutoOpenMappedCanvas/);
    assert.doesNotMatch(buttonSource, /autoOpenedMeetingIds/);
    assert.match(
        buttonSource,
        /await ensureWhiteboardKeyringUnlocked\(trigger, state\)[\s\S]*?unlock_meeting_whiteboard_keyring[\s\S]*?const response = synchronizeOpen/,
    );
    assert.match(buttonSource, /title:\s*meetingName/);
    assert.match(
        buttonSource,
        /setButtonActive\([\s\S]*?whiteboardOpen === true[\s\S]*?componentWindowPending/,
    );
    assert.match(buttonSource, /classList\.toggle\("active", confirmed\)/);
    assert.match(
        buttonSource,
        /button\.dataset\.activeLabel[\s\S]*?module\.jitsi_meet\.whiteboard\.close/,
    );
    assert.match(
        buttonSource,
        /disposableCanvas = !meetingHasInvitedParticipants/,
    );
    assert.match(buttonSource, /instantCanvas: trigger\.disposableCanvas/);
    assert.match(buttonSource, /disposable: trigger\.disposableCanvas/);
    assert.match(
        buttonSource,
        /stateWhiteboardDisposable === trigger\.disposableCanvas/,
    );
    assert.match(buttonSource, /component-pages:request/);
    assert.match(buttonSource, /component-pages:spawn/);
    assert.doesNotMatch(buttonSource, /jitsi-whiteboard-component-open/);
    assert.doesNotMatch(buttonSource, /spawnComponentPage\(\{\s*borderless:/);
    assert.doesNotMatch(stylesheet, /\.jitsi-whiteboard-component-open/);
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
        /const shouldOpen = meetingWhiteboardShouldOpen\(state\.meeting\);[\s\S]*?button\.disabled !== true[\s\S]*?componentWindowPending !== true/,
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
    assert.match(buttonSource, /document\.createElement\("button"\)/);
    assert.match(
        buttonSource,
        /getAttribute\("aria-pressed"\) === "true"[\s\S]*?classList\.toggle\("btn-confirm", confirmed\)[\s\S]*?classList\.toggle\("btn-neutral", !confirmed\)/,
    );
    assert.match(
        buttonSource,
        /button instanceof HTMLButtonElement[\s\S]*?button\.disabled = disabled/,
    );
    assert.match(
        apiIndexSource,
        /"\/static\/styles\/page-builder\.css"[\s\S]*?"\/static\/modules\/jitsi-meet\/jitsi-meet\.css"/,
    );
    assert.doesNotMatch(buttonSource, /pointer(?:down|move|up)/i);
    assert.doesNotMatch(buttonSource, /componentPage\.load/);
    assert.match(buttonSource, /elementId:\s*trigger\.frameWrap\.id/);
    assert.match(buttonSource, /whiteboardId/);
    assert.match(
        buttonSource,
        /const meeting = state\.meeting;[\s\S]*?const meetingId = meeting\.id;[\s\S]*?state\.meeting\?\.id !== meetingId[\s\S]*?trigger\.preparedMeetingId !== meetingId/,
    );
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
    assert.match(buttonSource, /contentScrolling:\s*false/);
    assert.match(
        buttonSource,
        /layout:\s*\{[\s\S]*?borderless:\s*true[\s\S]*?fillParent:\s*true[\s\S]*?scrollOwner:\s*"document"/,
    );
    assert.match(buttonSource, /component-pages:discard/);
    assert.match(buttonSource, /whiteboard\/state/);
    assert.match(buttonSource, /export function closeMeetingWhiteboard/);
    assert.match(appSource, /syncMeetingWhiteboardComponent/);
    assert.match(
        stylesheet,
        /\.jitsi-stage-frame-wrap\s*\{[\s\S]*?display:\s*grid;/,
    );
    assert.doesNotMatch(stylesheet, /\.jitsi-component-window/);
    assert.doesNotMatch(stylesheet, /\.component-page-stage--borderless/);
    assert.doesNotMatch(stylesheet, /\.component-page-window/);
    assert.match(
        buttonSource,
        /button\.className = "btn-neutral btn-animated";/,
    );
    assert.match(appIndexSource, /await loadCommonStyles\(\)/);
    assert.doesNotMatch(appIndexSource, /ensureStylesheetLoaded/);
    assert.doesNotMatch(helpersSource, /ensurePageStylesheet/);
    assert.match(
        reuseResourcesSource,
        /uiCtx\.capabilities\.get\("ui:reuse"\)/,
    );
    assert.match(reuseResourcesSource, /reuseResources\.importModule\(path\)/);
    assert.match(
        reuseResourcesSource,
        /loadCommonStyles = \(\) => reuseResources\.loadCommonStyles\(\)/,
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
    assert.match(meetingRestartSource, /whiteboardActive:\s*false/);
    assert.match(meetingRestartSource, /whiteboardOpenVotes:\s*\[\]/);
});
