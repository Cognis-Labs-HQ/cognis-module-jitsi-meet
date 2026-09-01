import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function readJitsiUiBundle() {
    const uiDir = resolve(ROOT, "ui");
    const rootSources = readdirSync(uiDir)
        .filter((entry) => entry.endsWith(".js"))
        .sort()
        .map((entry) => readFileSync(join(uiDir, entry), "utf8"));
    const appDir = resolve(uiDir, "app");
    const appSources = readdirSync(appDir)
        .filter((entry) => entry.endsWith(".js"))
        .sort()
        .map((entry) => readFileSync(join(appDir, entry), "utf8"));
    return [...rootSources, ...appSources].join("\n");
}

function readJitsiApiBundle() {
    const apiDir = resolve(ROOT, "api");
    return readdirSync(apiDir)
        .filter((entry) => entry.endsWith(".js"))
        .sort()
        .map((entry) => readFileSync(join(apiDir, entry), "utf8"))
        .join("\n");
}

test("navbar mounts the ping request only on Meetings routes and aborts it on navigation", () => {
    const source = readFileSync(resolve(ROOT, "ui/navbar.js"), "utf8");

    assert.match(source, /MEETINGS_PATHS\.has\(window\.location\.pathname\)/);
    assert.match(
        source,
        /if \(!MEETINGS_PATHS[\s\S]*unmountMeetingPing\(\)[\s\S]*return;/,
    );
    assert.match(
        source,
        /apiFetch\("\/api\/v1\/modules\/jitsi-meet\/ping",\s*\{[\s\S]*signal: controller\.signal/,
    );
    assert.match(
        source,
        /window\.addEventListener\("popstate", syncMeetingLink\)/,
    );
});

test("meeting chat polling respects cancelled keyring access", () => {
    const source = readFileSync(resolve(ROOT, "ui/app/chat.js"), "utf8");
    assert.match(source, /keyring:isAccessSuppressed/);
    assert.match(
        source,
        /function startNativeChatPolling\(\)[\s\S]*keyring:isAccessSuppressed/,
    );
});

test("meeting share joins use the scoped guest access token", () => {
    const source = readFileSync(
        resolve(ROOT, "ui/app/meeting-room.js"),
        "utf8",
    );
    assert.match(
        source,
        /meetings\/join[\s\S]*accessToken:\s*state\.shareAccessToken \|\| undefined/,
    );
    assert.match(
        source,
        /meetings\/join[\s\S]*suppressAccessDeniedEvent:\s*true/,
    );
    assert.match(
        source,
        /suppliedMeetingPassword[\s\S]*!state\.shareAccessToken/,
    );
});

test("new meetings can start with an empty participant stage and prompt for a link share after joining", () => {
    const preflightSource = readFileSync(
        resolve(ROOT, "ui/app/participants.js"),
        "utf8",
    );
    const embedSource = readFileSync(
        resolve(ROOT, "ui/app/meeting-room.js"),
        "utf8",
    );
    const shareButtonSource = readFileSync(
        resolve(ROOT, "ui/share-button.js"),
        "utf8",
    );
    const meetingsSource = readFileSync(
        resolve(ROOT, "ui/app/meetings-list.js"),
        "utf8",
    );
    assert.match(
        preflightSource,
        /canStart:\s*state\.preflightPassed && !state\.meeting\?\.id/,
    );
    assert.doesNotMatch(embedSource, /if \(selected\.length === 0\)/);
    assert.doesNotMatch(embedSource, /canStart:[^,]*selected\.length/);
    assert.match(
        embedSource,
        /state\.promptShareOnJoin =\s*Boolean\(state\.meeting\?\.id\) && selected\.length === 0/,
    );
    assert.match(
        embedSource,
        /videoConferenceJoined[\s\S]*state\.promptShareOnJoin = false;[\s\S]*openMeetingSharePopup/,
    );
    assert.match(shareButtonSource, /allowedMethodIds:\s*\["link"\]/);
    assert.match(
        embedSource,
        /videoConferenceJoined[\s\S]*if \(state\.promptShareOnJoin\)/,
    );
    assert.match(
        meetingsSource,
        /state\.preflightPassed && participantCount === 0[\s\S]*ready_without_participants/,
    );
    assert.match(meetingsSource, /participantCount > 0[\s\S]*ready_to_start/);
});

test("meeting link guests derive participants from the scoped meeting payload", () => {
    const chatSource = readFileSync(resolve(ROOT, "ui/app/chat.js"), "utf8");
    const appSource = readFileSync(resolve(ROOT, "ui/app/index.js"), "utf8");
    assert.match(
        chatSource,
        /state\.shareAccessToken && state\.chatParticipantEntries\.length > 0/,
    );
    assert.match(chatSource, /state\.lastMeetingParticipants/);
    assert.match(chatSource, /participant\?\.displayName \|\| username/);
    assert.match(appSource, /if \(state\.shareAccessToken\) return;/);
});

test("meeting link chat uses scoped message APIs without requesting room metadata", () => {
    const chatSource = readFileSync(resolve(ROOT, "ui/app/chat.js"), "utf8");

    assert.doesNotMatch(chatSource, /loadMeetingChatParticipants/);
    assert.match(chatSource, /messagesClient\(\)\.listRoomMessages\(roomId/);
});

test("meeting link guests can join without participant-card data", () => {
    const appSource = readFileSync(resolve(ROOT, "ui/app/index.js"), "utf8");
    const meetingSource = readFileSync(
        resolve(ROOT, "ui/app/meetings-list.js"),
        "utf8",
    );
    assert.match(appSource, /allowParticipantlessJoin: limitedShareView/);
    assert.match(
        meetingSource,
        /!allowParticipantlessJoin\s*&&\s*state\.selectedParticipants\.length === 0/,
    );
});

test("meetings search popup adds confirmed users directly to meeting participants", () => {
    const source = readFileSync(resolve(ROOT, "ui/app/index.js"), "utf8");
    assert.match(source, /category: "user",\s*typeFilter: "user"/);
    assert.match(
        source,
        /onSelectMultiple:\s*\(results\)\s*=>[\s\S]*addParticipant\(participantEntry\)/,
    );
    assert.doesNotMatch(
        source,
        /onSelectMultiple:\s*\(results\)\s*=>[\s\S]*state\.availableParticipants\.push/,
    );
    assert.match(
        source,
        /avatarKey:\s*typeof result\?\.avatarKey === "string"/,
    );
});

test("active meetings render inside the initial overlay above its start action", () => {
    const markupSource = readFileSync(resolve(ROOT, "ui/markup.js"), "utf8");
    const meetingsSource = readFileSync(
        resolve(ROOT, "ui/app/meetings-list.js"),
        "utf8",
    );
    const activeMeetingsIndex = markupSource.indexOf(
        'id="jitsi-active-meetings"',
    );
    const startButtonIndex = markupSource.indexOf('id="jitsi-start-btn"');
    const participantsMarkupIndex = markupSource.indexOf(
        "export function buildParticipantsMarkup",
    );

    assert.ok(activeMeetingsIndex > 0);
    assert.ok(activeMeetingsIndex < startButtonIndex);
    assert.ok(activeMeetingsIndex < participantsMarkupIndex);
    assert.match(
        meetingsSource,
        /activeMeetingsSection\.hidden = activeMeetingsLocked/,
    );
});

test("persisted meetings fill the scrollable participant workspace", () => {
    const markupSource = readFileSync(resolve(ROOT, "ui/markup.js"), "utf8");
    const meetingsSource = readFileSync(
        resolve(ROOT, "ui/app/meetings-list.js"),
        "utf8",
    );
    const cssSource = readFileSync(resolve(ROOT, "ui/jitsi-meet.css"), "utf8");

    assert.match(markupSource, /jitsi-participants-layout/);
    assert.match(markupSource, /id="jitsi-persisted-meetings"/);
    assert.match(meetingsSource, /meetings\/persisted/);
    assert.match(meetingsSource, /meeting\.participants\.slice\(0, 10\)/);
    assert.match(
        cssSource,
        /grid-template-columns: minmax\(12rem, 3fr\) minmax\(0, 7fr\)/,
    );
    assert.match(
        cssSource,
        /jitsi-available-participants-column[\s\S]*overflow-y: auto/,
    );
    assert.match(cssSource, /jitsi-persisted-meetings[\s\S]*overflow-x: auto/);
    assert.match(cssSource, /jitsi-persisted-meeting-avatar:nth-child\(10\)/);
    assert.match(cssSource, /module-jitsi-meet-active-card-orbit/);
});

test("jitsi participant avatars reuse social avatar hydration and hide staged avatars while active", () => {
    const source = readJitsiUiBundle();
    const cssSource = readFileSync(resolve(ROOT, "ui/jitsi-meet.css"), "utf8");
    assert.match(source, /buildProfileAvatarMarkup/);
    assert.match(source, /handleProfileAvatarError/);
    assert.match(source, /hydrateProfileAvatars/);
    assert.match(
        source,
        /root\.addEventListener\("error", handleProfileAvatarError/,
    );
    assert.match(
        source,
        /const stagedEntries = utils\.isMeetingActive\(\)\s*\?\s*\[\]\s*:\s*state\.selectedParticipants;/,
    );
    assert.match(source, /hydrateProfileAvatars\(availablePool\)\.catch/);
    assert.match(cssSource, /\.jitsi-participant-avatar-img/);
});

test("jitsi meeting group chats use the unique stored meeting title", () => {
    const source = readJitsiApiBundle();
    assert.match(
        source,
        /title:\s*buildMeetingChatTitle\(meeting\.meetingName\)/,
    );
    assert.doesNotMatch(source, /new Date\(parsedCreatedAt\)/);
    assert.match(source, /allowSingleMember:\s*true/);
    assert.doesNotMatch(source, /participantUsernames\.length > 1/);
});

test("jitsi chat loads room keys through the messages adapter loading flow", () => {
    const chatSource = readFileSync(resolve(ROOT, "ui/app/chat.js"), "utf8");
    const resourcesSource = readFileSync(
        resolve(ROOT, "api/ui-resources.js"),
        "utf8",
    );
    assert.match(
        chatSource,
        /await loadChatRoomKey\(roomId,[\s\S]*recoverMissing:\s*true,[\s\S]*accessToken:\s*state\.shareAccessToken/,
    );
    assert.doesNotMatch(chatSource, /adapters\/auth\/keyring/);
    assert.match(resourcesSource, /chatLoadingModuleUrl/);
});

test("jitsi meeting window has light-theme overlay overrides", () => {
    const source = readFileSync(resolve(ROOT, "ui/jitsi-meet.css"), "utf8");
    assert.match(
        source,
        /body\[data-theme="light"\] \.jitsi-route-root \.jitsi-overlay\s*\{/,
    );
    assert.match(
        source,
        /body\[data-theme="light"\] \.jitsi-route-root \.jitsi-spinner\s*\{/,
    );
    assert.match(
        source,
        /body\[data-theme="light"\][\s\S]*\.jitsi-staged-participants[\s\S]*\.jitsi-participant-avatar-label\s*\{/,
    );
});

test("meeting styles remain scoped to the Meetings route root", () => {
    const source = readFileSync(resolve(ROOT, "ui/jitsi-meet.css"), "utf8");
    const topLevelSelectorLines = source
        .split("\n")
        .filter(
            (line) =>
                line.startsWith(".") ||
                (line.startsWith("body[") &&
                    line.includes(".jitsi-route-root")),
        );
    assert.ok(topLevelSelectorLines.length > 0);
    assert.ok(
        topLevelSelectorLines.every((line) =>
            line.includes(".jitsi-route-root"),
        ),
    );
    assert.doesNotMatch(source, /@media[^\{]*\{\s*\.jitsi-(?!route-root)/);
    const themeSelectors = [...source.matchAll(/body\[data-theme="light"\]/g)];
    assert.ok(themeSelectors.length > 0);
    assert.ok(
        themeSelectors.every(({ index, 0: match }) =>
            /^\s+\.jitsi-route-root/.test(source.slice(index + match.length)),
        ),
    );
    assert.match(source, /@keyframes module-jitsi-meet-spin/);
    assert.doesNotMatch(source, /@keyframes jitsi-spin/);
});

test("meetings page composer uses a dedicated layout preference key", () => {
    const source = readJitsiUiBundle();
    assert.match(source, /preferenceKey:\s*"meetings-layout-v3"/);
    assert.match(source, /requireAccountSession:\s*!limitedShareView/);
});

test("jitsi meetings embed gates privileged settings by local moderator role and uses reduced toolbar", () => {
    const source = readJitsiUiBundle();
    const constantsSource = readFileSync(
        resolve(ROOT, "ui/constants.js"),
        "utf8",
    );
    const embedSource = readFileSync(
        resolve(ROOT, "ui/meeting-embed.js"),
        "utf8",
    );
    assert.match(
        constantsSource,
        /export const MEETING_SUBJECT = "Cognis Classroom";/,
    );
    const toolbarArrayMatch = constantsSource.match(
        /const JITSI_TOOLBAR_BUTTONS = \[([\s\S]*?)\];/,
    );
    assert.ok(toolbarArrayMatch);
    const toolbarArraySource = toolbarArrayMatch[1];
    assert.equal(/"chat"/.test(toolbarArraySource), false);
    assert.equal(/"invite"/.test(toolbarArraySource), false);
    assert.equal(/"settings"/.test(toolbarArraySource), false);
    assert.match(source, /subject: MEETING_SUBJECT,/);
    assert.match(source, /currentUserIsJitsiModerator\(apiInstance\)/);
    assert.match(source, /"subject",[\s\S]*MEETING_SUBJECT/);
    assert.match(source, /preferredTheme: themeMode,/);
    assert.match(
        source,
        /interfaceConfigOverwrite: \{[\s\S]*DEFAULT_BACKGROUND: defaultBackground/,
    );
    assert.match(source, /disableDeepLinking: true,/);
    assert.match(source, /avatarUrl: state\.currentProfile\?\.avatarUrl/);
    assert.match(source, /"avatarUrl",[\s\S]*state\.currentProfile\.avatarUrl/);
    assert.match(
        embedSource,
        /hashParams\.set\("config\.disableDeepLinking", "true"\)/,
    );
    assert.match(
        embedSource,
        /hashParams\.set\("userInfo\.avatarUrl", profile\.avatarUrl\)/,
    );
    assert.match(
        embedSource,
        /hashParams\.set\("config\.subject", MEETING_SUBJECT\)/,
    );
    assert.match(
        embedSource,
        /hashParams\.set\("config\.preferredTheme", themeMode\)/,
    );
    assert.match(
        embedSource,
        /hashParams\.set\([\s\S]*"interfaceConfig\.DEFAULT_BACKGROUND",[\s\S]*resolveJitsiDefaultBackground\(themeMode\)/,
    );
    assert.match(source, /"password",[\s\S]*meetingPassword/);
    assert.match(
        source,
        /addEventListener\("passwordRequired", async \(\) => \{/,
    );
    assert.match(source, /const submitMeetingPassword = \(\) =>/);
    assert.match(source, /meeting:\$\{state\.meeting\.id\}:password/);
    assert.match(source, /meetingKeyring\.resolve\(/);
    assert.match(source, /fallback:\s*\(\) => suppliedMeetingPassword/);
    assert.match(source, /action:\s*i18n\.t\("ui\.reuse\.join"\)/);
    assert.match(source, /process:\s*meetingProcess/);
    assert.match(
        source,
        /participantRoleChanged[\s\S]*getParticipantRole\(event\) === "moderator"/,
    );
});

test("jitsi meetings lock participants and block navigation while meeting is active", () => {
    const source = readJitsiUiBundle();
    assert.match(source, /function isMeetingActive\(\)/);
    assert.match(source, /jitsi-participants-disabled/);
    assert.match(
        source,
        /window\.addEventListener\(\s*"beforeunload"[\s\S]*event\.returnValue = "";/,
    );
    assert.doesNotMatch(source, /function isRefreshShortcut\(event\)/);
    assert.doesNotMatch(source, /window\.addEventListener\(\s*"keydown"/);
    assert.match(
        source,
        /window\.addEventListener\(\s*"click"[\s\S]*module\.jitsi_meet\.overlay\.leave_blocked/,
    );
});

test("active non-disposable meetings accept participant drops without unstaging invitees", () => {
    const source = readJitsiUiBundle();
    assert.match(
        source,
        /if \(!\(state\.pendingParticipantUsernames instanceof Set\)\) \{\s*state\.pendingParticipantUsernames = new Set\(\)/,
    );
    assert.match(source, /meeting\?\.hasInvitedParticipants/);
    assert.match(source, /meetings\/participants\/add/);
    assert.match(
        source,
        /!utils\.isMeetingActive\(\)[\s\S]*targetZone === "available"/,
    );
    assert.match(
        source,
        /addParticipant\(fromAvailable\);\s*renderParticipants\(\);[\s\S]*?meetings\/participants\/add/,
    );
    assert.match(
        source,
        /participant_addition_declined[\s\S]*?participants\.invite_rejected/,
    );
    assert.match(
        source,
        /removeParticipant\(normalized\)[\s\S]*?state\.availableParticipants\.push\(fromAvailable\)[\s\S]*?renderParticipants\(\)/,
    );
    assert.match(
        source,
        /pendingParticipantUsernames\.add\(normalized\)[\s\S]*?meetings\/participants\/add/,
    );
    assert.match(
        source,
        /for \(const username of state\.pendingParticipantUsernames\)[\s\S]*?participantUsernames\.add\(username\)/,
    );
});

test("active meetings are locked while the user is joined to a meeting", () => {
    const source = readJitsiUiBundle();
    const cssSource = readFileSync(resolve(ROOT, "ui/jitsi-meet.css"), "utf8");
    assert.match(
        source,
        /activeMeetingsLocked = Boolean\([\s\S]*?state\.meeting\?\.id[\s\S]*?jitsi-active-meetings-disabled[\s\S]*?button\.disabled = activeMeetingsLocked/,
    );
    assert.match(
        source,
        /activeMeetingsEl\.addEventListener\([\s\S]*?if \(state\.meeting\?\.id \|\| isMeetingActive\(\)\) return/,
    );
    assert.match(
        source,
        /joinMeetingById[\s\S]*?state\.requestedMeetingId = ""[\s\S]*?state\.requestedMeetingStart = false[\s\S]*?clearRequestedMeetingParameters\(\)/,
    );
    assert.match(
        cssSource,
        /\.jitsi-active-meetings-disabled[\s\S]*?pointer-events: none/,
    );
});

test("participant rendering preserves an active meeting overlay state and shows an empty-pool message", () => {
    const source = readJitsiUiBundle();
    assert.match(
        source,
        /if \(updateStage && !utils\.isMeetingActive\(\) && !state\.meeting\?\.id\) \{\s*utils\.updateOverlay/,
    );
    assert.match(
        source,
        /state\.availableParticipants\.length === 0[\s\S]*module\.jitsi_meet\.participants\.available_none/,
    );
});

test("dragging an available participant reveals the active meeting dropzone", () => {
    const source = readJitsiUiBundle();
    const cssSource = readFileSync(resolve(ROOT, "ui/jitsi-meet.css"), "utf8");
    assert.match(source, /setActiveParticipantDropzoneVisible/);
    assert.match(source, /placeMeetingOverlayForActiveWindow\(root\)/);
    assert.match(
        source,
        /placeMeetingOverlayForActiveWindow\(root\) \?\?[\s\S]*?root\.querySelector\("#jitsi-overlay"\)/,
    );
    assert.match(
        source,
        /!utils\.isMeetingActive\(\) && !state\.meeting\?\.id/,
    );
    assert.match(
        source,
        /event\.dataTransfer\.effectAllowed = "move";[\s\S]*setActiveParticipantDropzoneVisible\(true\)/,
    );
    assert.match(source, /document\.addEventListener\("dragend", cancel/);
    assert.match(source, /document\.addEventListener\("drop", cancel/);
    assert.match(source, /window\.addEventListener\("blur", cancel/);
    assert.match(source, /event\.key === "Escape"[\s\S]*cancel\(\)/);
    assert.match(source, /module\.jitsi_meet\.participants\.drop_to_invite/);
    assert.match(
        source,
        /dropPreviousMessage[\s\S]*message\.textContent = overlay\.dataset\.dropLabel/,
    );
    assert.doesNotMatch(cssSource, /jitsi-overlay-participant-drop/);
    assert.doesNotMatch(source, /"dragleave"/);
    assert.match(
        cssSource,
        /\.jitsi-stage-frame[\s\S]*z-index: 2;[\s\S]*\.jitsi-overlay[\s\S]*grid-area: 1 \/ 1;[\s\S]*z-index: 3;[\s\S]*\.jitsi-overlay\.jitsi-drop-active[\s\S]*z-index: 4;/,
    );
});

test("starting a meeting uses the Cognis page loading wheel until join completes", () => {
    const source = readJitsiUiBundle();
    assert.match(source, /\{ beginPageLoading, mountWhenDirect \}/);
    assert.match(
        source,
        /prepareMeetingStart[\s\S]*callbacks\.beginPageLoading\(\)[\s\S]*finally[\s\S]*finishPageLoading\(\)/,
    );
});

test("local Jitsi kick events remove account participants or invalidate guest links", () => {
    const source = readJitsiUiBundle();
    assert.match(source, /addEventListener\("participantKickedOut"/);
    assert.match(
        source,
        /addEventListener\("errorOccurred"[\s\S]*isLocalParticipantKick\(event\)/,
    );
    assert.match(source, /kickedParticipant\?\.local === true/);
    assert.match(source, /meetings\/participants\/kicked/);
    assert.match(source, /accessToken: state\.shareAccessToken \|\| undefined/);
    assert.match(source, /module\.jitsi_meet\.overlay\.kicked/);
    assert.match(
        source,
        /payload\.data\.participants[\s\S]*state\.availableParticipants = state\.allParticipants\.filter/,
    );
});

test("meeting participant surfaces and chat refresh membership in real time", () => {
    const source = readJitsiUiBundle();
    const cssSource = readFileSync(resolve(ROOT, "ui/jitsi-meet.css"), "utf8");
    assert.match(source, /ACTIVE_MEETINGS_REFRESH_INTERVAL_MS = 5_000/);
    assert.match(source, /async function refreshAvailableParticipants\(\)/);
    assert.match(
        source,
        /refreshAvailableParticipants[\s\S]*?renderParticipants\(\{ updateStage: false \}\)/,
    );
    assert.match(
        source,
        /loadActiveMeetings[\s\S]*callbacks\.refreshAvailableParticipants/,
    );
    assert.match(
        source,
        /payload\.data\.chatRoomId[\s\S]*await callbacks\.updateNativeChat\(\)/,
    );
    assert.match(source, /module\.jitsi_meet\.participants\.invite_success/);
    assert.match(
        source,
        /jitsi-active-meetings-empty jitsi-participants-empty/,
    );
    assert.match(
        cssSource,
        /\.jitsi-participants-empty\s*{\s*grid-column: auto;/,
    );
    assert.doesNotMatch(source, /and must be invited again/);
});

test("SPA participant avatars force availability-provider refresh", () => {
    const source = readJitsiUiBundle();
    assert.match(source, /ui:ensureProvidersLoaded/);
    assert.match(source, /ui:availabilityRenderer/);
    assert.match(source, /availabilityRenderer\.refresh\(container\)/);
});

test("jitsi meetings reset participant state and disable mini chat until ready", () => {
    const source = readJitsiUiBundle();
    const cssSource = readFileSync(resolve(ROOT, "ui/jitsi-meet.css"), "utf8");
    assert.match(source, /async function resetMeetingState\(\s*\{/);
    assert.match(source, /resetParticipantSelection\(\);/);
    assert.doesNotMatch(source, /jitsi-chat-hint/);
    assert.match(source, /function setNativeChatReady\(ready\)/);
    assert.match(source, /jitsi-chat-disabled/);
    assert.match(source, /chatInput\.disabled = !ready;/);
    assert.match(source, /aria-busy/);
    assert.match(cssSource, /\.jitsi-chat-pane\.jitsi-chat-disabled/);
    assert.match(cssSource, /pointer-events: none;/);
});

test("meetings page defaults meeting and chat panels to a 70-30 split while keeping them resizable", () => {
    const source = readJitsiUiBundle();
    assert.match(
        source,
        /id:\s*"jitsi-stage"[\s\S]*gridSize:\s*\{[\s\S]*default:\s*\[7,\s*5\][\s\S]*min:\s*\[6,\s*4\]/,
    );
    assert.match(
        source,
        /id:\s*"jitsi-chat"[\s\S]*gridSize:\s*\{[\s\S]*default:\s*\[3,\s*5\][\s\S]*min:\s*\[3,\s*4\]/,
    );
    assert.doesNotMatch(
        source,
        /id:\s*"jitsi-stage"[\s\S]*gridSize:\s*\{[\s\S]*max:\s*"full"/,
    );
    assert.doesNotMatch(
        source,
        /id:\s*"jitsi-chat"[\s\S]*gridSize:\s*\{[\s\S]*max:\s*"full"/,
    );
});

test("meetings UI recovers a live session after composer edit rerenders the iframe", () => {
    const source = readJitsiUiBundle();
    assert.match(
        source,
        /function recoverMeetingSessionAfterComposerRender\(\)/,
    );
    assert.match(source, /isMeetingEmbedMissing\(\)/);
    assert.match(source, /state\.jitsiApi = null;/);
    assert.match(source, /void callbacks[\s\S]*\.joinMeeting\(\)/);
    assert.match(
        source,
        /const bindSignal = bindController\.signal;[\s\S]*recoverMeetingSessionAfterComposerRender\(\);/,
    );
});

test("reclaim session button uses success outline styling", () => {
    const source = readFileSync(resolve(ROOT, "ui/markup.js"), "utf8");
    const cssSource = readFileSync(resolve(ROOT, "ui/jitsi-meet.css"), "utf8");
    assert.match(source, /id="jitsi-reclaim-btn" class="btn-confirm"/);
    assert.match(
        source,
        /id="jitsi-start-btn" class="btn-confirm btn-animated"/,
    );
    assert.match(
        cssSource,
        /\.jitsi-section-heading[\s\S]*color: var\(--text\)/,
    );
});

test("find participants button uses confirm styling", () => {
    const source = readFileSync(resolve(ROOT, "ui/markup.js"), "utf8");
    assert.match(
        source,
        /id="jitsi-find-participants-btn" class="btn-confirm"/,
    );
});

test("meetings mini chat sends on Enter and hides explicit send button", () => {
    const source = readJitsiUiBundle();
    assert.doesNotMatch(source, /id="jitsi-chat-send"/);
    assert.match(source, /chatInput\.addEventListener\(\s*"keydown"/);
    assert.match(source, /event\.key !== "Enter"/);
    assert.match(source, /chatForm\.requestSubmit\(\)/);
});

test("meetings mini chat supports participant private-chat switching and return-to-meeting action", () => {
    const appSource = readJitsiUiBundle();
    const markupSource = readFileSync(resolve(ROOT, "ui/markup.js"), "utf8");
    const cssSource = readFileSync(resolve(ROOT, "ui/jitsi-meet.css"), "utf8");
    const stringsSource = readFileSync(
        resolve(ROOT, "ui/languages/en/strings.xml"),
        "utf8",
    );

    assert.match(markupSource, /id="jitsi-chat-participant-strip"/);
    assert.match(markupSource, /id="jitsi-chat-return-btn"/);
    assert.match(markupSource, /<header class="jitsi-chat-header">/);
    assert.match(
        markupSource,
        /id="jitsi-chat-heading" class="jitsi-section-heading"/,
    );
    assert.match(appSource, /chatMode:\s*"meeting"/);
    assert.match(appSource, /lastMeetingChatRoomId/);
    assert.match(appSource, /async function activatePrivateChatForParticipant/);
    assert.match(appSource, /async function activateMeetingChat/);
    assert.match(appSource, /state\.chatMode !== "private"/);
    assert.match(appSource, /if \(!state\.meeting\?\.id\) return \[\];/);
    assert.match(appSource, /strip\.hidden = entries\.length === 0;/);
    assert.match(appSource, /state\.lastMeetingParticipants = \[\];/);
    assert.match(appSource, /messagesClient\(\)\.openPrivateRoom\(/);
    assert.match(cssSource, /\.jitsi-chat-participant-strip/);
    assert.match(cssSource, /overflow-y: hidden;/);
    assert.match(
        cssSource,
        /\.jitsi-chat-participant-strip::-webkit-scrollbar/,
    );
    assert.match(cssSource, /\.jitsi-chat-header/);
    assert.match(cssSource, /\.jitsi-chat-return-btn/);
    assert.match(cssSource, /\.jitsi-chat-participant-item\.active/);
    assert.match(stringsSource, /module\.jitsi_meet\.chat\.return_to_meeting/);
    assert.match(
        stringsSource,
        /module\.jitsi_meet\.chat\.private_open_failed/,
    );
});

test("meetings session state polling handles closed meetings and distinct leave messaging", () => {
    const source = readJitsiUiBundle();
    assert.match(source, /latestState\.endedAt/);
    assert.match(source, /module\.jitsi_meet\.overlay\.meeting_closed/);
    assert.match(source, /getResponse\.status === 404/);
    assert.match(source, /module\.jitsi_meet\.overlay\.join_failed/);
    assert.match(source, /module\.jitsi_meet\.overlay\.meeting_left/);
    assert.match(source, /honorMeetingClosed: false/);
    assert.match(
        source,
        /addEventListener\("readyToClose", handleMeetingLeft\)/,
    );
    const constantsSource = readFileSync(
        resolve(ROOT, "ui/constants.js"),
        "utf8",
    );
    assert.match(
        constantsSource,
        /MEETING_TERMINATED_TEXT = "meeting terminated"/,
    );
    assert.match(
        constantsSource,
        /MEETING_DESTROYED_TEXT = "conference\.destroyed"/,
    );
    assert.match(source, /message\.includes\(MEETING_DESTROYED_TEXT\)/);
    assert.match(source, /canStart: state\.preflightPassed/);
    assert.match(source, /if \(meetingExitPromise\) return meetingExitPromise/);
    assert.match(
        source,
        /await resetMeetingState\([\s\S]*await leaveStatePromise/,
    );
    assert.match(source, /addEventListener\("notificationTriggered"/);
    assert.match(source, /reportTerminated: true/);
});
