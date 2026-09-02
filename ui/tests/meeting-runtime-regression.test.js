import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deactivateMeetingChatState } from "../app/chat-state.js";

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

test("Jitsi toolbar hides participant, performance, and background controls", () => {
    const constantsSource = readFileSync(
        resolve(ROOT, "ui/constants.js"),
        "utf8",
    );
    assert.doesNotMatch(constantsSource, /"participants-pane"/);
    assert.doesNotMatch(constantsSource, /"videoquality"/);
    assert.doesNotMatch(constantsSource, /"select-background"/);
});

test("meeting state polling ignores responses after meeting teardown", () => {
    const source = readFileSync(
        resolve(ROOT, "ui/app/participants.js"),
        "utf8",
    );

    assert.match(source, /const meetingId = state\.meeting\?\.id/);
    assert.match(source, /if \(state\.meeting\?\.id !== meetingId\) return/);
    assert.match(
        source,
        /meetings\/state[\s\S]*accessToken:\s*state\.shareAccessToken/,
    );
});

test("interactive handlers import their extracted meeting embed dependencies", () => {
    const source = readFileSync(
        resolve(ROOT, "ui/app/interactive-handlers.js"),
        "utf8",
    );

    assert.match(
        source,
        /import \{ normalizeMeetingId \} from "\.\.\/jitsi-helpers\.js";/,
    );
    assert.match(
        source,
        /import \{ buildMeetingJoinUrl, resolveThemeMode \} from "\.\.\/meeting-embed\.js";/,
    );
    assert.match(
        source,
        /import \{ messagesClient \} from "\.\.\/reuse\/gateway-clients\.js";/,
    );
    assert.match(source, /resolveThemeMode\(event\?\.detail\?\.theme\)/);
    assert.match(source, /buildMeetingJoinUrl\(/);
    assert.match(source, /normalizeMeetingId\(/);
    assert.match(source, /messagesClient\(\)\.sendRoomMessage\(/);
    assert.match(source, /loadActiveMeetings,\s*resetMeetingState,\s*\}\) \{/);
    assert.match(source, /await updateCognisChat\(\)/);
    assert.doesNotMatch(source, /refreshCognisChat/);
});

test("window focus changes do not dismiss an idle meeting overlay", () => {
    const appSource = readJitsiUiBundle();
    const participantsSource = readFileSync(
        resolve(ROOT, "ui/app/participants.js"),
        "utf8",
    );

    assert.match(
        appSource,
        /if \(state\.dragUsername === null\) return;[\s\S]*setActiveParticipantDropzoneVisible\(false\)/,
    );
    assert.match(
        participantsSource,
        /if \(state\.overlayPresentation\) \{\s*utils\.updateOverlay\(state\.overlayPresentation\)/,
    );
});

test("meeting chat teardown clears the room and polling state after a kick", () => {
    let pollingStopped = false;
    const state = {
        chatRoomId: "meeting-room",
        chatRoomKey: "room-key",
        chatMode: "private",
        privateChatUsername: "alice",
        lastMeetingChatRoomId: "meeting-room",
        lastMeetingParticipants: ["alice"],
    };

    deactivateMeetingChatState(state, () => {
        pollingStopped = true;
    });

    assert.equal(pollingStopped, true);
    assert.equal(state.chatRoomId, "");
    assert.equal(state.chatRoomKey, null);
    assert.equal(state.lastMeetingChatRoomId, "");
    assert.deepEqual(state.lastMeetingParticipants, []);
});

test("share guests bind remote whiteboard orchestration without resharing controls", () => {
    const appSource = readJitsiUiBundle();
    const controlSource = readFileSync(
        resolve(ROOT, "ui/whiteboard-control.js"),
        "utf8",
    );
    const meetingRoomSource = readFileSync(
        resolve(ROOT, "ui/app/meeting-room.js"),
        "utf8",
    );

    assert.match(
        appSource,
        /if \(!inShareView\) \{[\s\S]*bindShareButton[\s\S]*\}\s*void bindWhiteboardButton/,
    );
    assert.equal(
        controlSource.match(
            /accessToken:\s*state\.shareAccessToken \|\| undefined/g,
        )?.length,
        3,
    );
    assert.match(
        controlSource,
        /requireCanvasFactory:\s*!state\.shareAccessToken/,
    );
    assert.match(
        controlSource,
        /\(!state\.shareAccessToken &&[\s\S]*createDisposableCanvas/,
    );
    assert.match(
        controlSource,
        /meetingWhiteboardShouldOpen\(state\.meeting\)[\s\S]*sharedOpenRequested = true;[\s\S]*trigger\.button\.click\(\)/,
    );
    assert.match(
        controlSource,
        /const meetingFrame =[\s\S]*makeFloatingWindow\([\s\S]*await spawnComponentWindowWithRetry\(/,
    );
    assert.match(
        controlSource,
        /updateMinimumSize[\s\S]*resolveMeetingPipMinimumSize/,
    );
    assert.match(meetingRoomSource, /contentSharingParticipantsChanged/);
    assert.match(meetingRoomSource, /jitsi-meet\/screen-sharing/);
    assert.match(controlSource, /screenSharingActive === true/);
    assert.match(
        controlSource,
        /if \(state\.shareAccessToken\) \{\s*button\.hidden = true;[\s\S]*aria-hidden/,
    );
});

test("limited share mounts never request account profile or participant data", () => {
    const appSource = readJitsiUiBundle();
    const helperSource = readFileSync(
        resolve(ROOT, "ui/jitsi-helpers.js"),
        "utf8",
    );

    assert.match(
        appSource,
        /limitedShareView \? Promise\.resolve\(\[\]\) : fetchParticipants\(""\)/,
    );
    assert.match(
        appSource,
        /fetchCurrentProfile\(\{\s*shareAccessToken: state\.shareAccessToken/,
    );
    assert.match(
        helperSource,
        /if \(shareAccessToken\) return fetchShareGuestProfile\(\);[\s\S]*profileClient\(\)\.getCurrentProfile\(\)/,
    );
});

test("jitsi API resets ended meetings and reports meetingClosed from presence updates", () => {
    const source = readJitsiApiBundle();
    assert.match(
        source,
        /!resolved\.state\.endedAt && conflictingSessions\.length > 0/,
    );
    assert.match(source, /endedBy:\s*resolved\.requesterUsername/);
    assert.doesNotMatch(source, /participantCount === 2/);
    assert.match(source, /meetingClosed:/);
    assert.match(
        source,
        /const meetingTerminated = body\.terminated === true;/,
    );
    assert.match(source, /meetingTerminated \|\|/);
});

test("meetings UI prompts a participant who becomes alone before leaving", () => {
    const source = readJitsiUiBundle();
    const markupSource = readFileSync(resolve(ROOT, "ui/markup.js"), "utf8");
    const constantsSource = readFileSync(
        resolve(ROOT, "ui/constants.js"),
        "utf8",
    );
    assert.match(markupSource, /id="jitsi-leave-alone-btn"/);
    assert.match(markupSource, /id="jitsi-remain-alone-btn"/);
    assert.match(constantsSource, /ALONE_PROMPT_GRACE_PERIOD_MS = 180_000/);
    assert.match(source, /function deferAloneParticipantPrompt\(/);
    assert.match(
        source,
        /state\.alonePromptBlockedUntil = Date\.now\(\) \+ delayMs;/,
    );
    assert.match(
        source,
        /function shouldPromptLocalUserAlone\(activeParticipants\)/,
    );
    assert.match(source, /Date\.now\(\) < state\.alonePromptBlockedUntil/);
    assert.match(
        source,
        /function updateAloneParticipantPrompt\(activeParticipants\)/,
    );
    assert.match(source, /module\.jitsi_meet\.overlay\.alone_prompt/);
    assert.match(source, /alonePromptDismissedMeetingId/);
    assert.match(
        source,
        /const joinPayload = await joinResponse\.json\(\);\n\s*state\.meeting = joinPayload\?\.data \?\? state\.meeting;\n\s*utils\.deferAloneParticipantPrompt\(\);/,
    );
    assert.match(
        source,
        /state\.meeting = joinPayload\?\.data \?\? state\.meeting;/,
    );
    assert.match(source, /authButton\.addEventListener\(/);
    assert.match(
        source,
        /if \(!state\.meeting\?\.id\) return;\n\s*deferAloneParticipantPrompt\(\);/,
    );
    assert.match(
        source,
        /apiInstance\.addEventListener\("passwordRequired", async \(\) => \{/,
    );
    assert.match(
        source,
        /utils\.deferAloneParticipantPrompt\(\);[\s\S]*meetingKeyring\.resolve[\s\S]*submitMeetingPassword\(\);/,
    );

    assert.match(source, /async function loadMeetingState\(\)/);
    assert.match(source, /module\.jitsi_meet\.overlay\.auth_waiting/);
    assert.match(
        source,
        /callbacks\.updateAloneParticipantPrompt\(\s*payload\?\.data\?\.activeParticipants,/,
    );
    assert.match(
        source,
        /if \(latestState\.authRequired && !latestState\.authCompletedAt\) \{[\s\S]*return;[\s\S]*\}/,
    );
    assert.match(
        source,
        /jitsi-leave-alone-btn[\s\S]*module\.jitsi_meet\.overlay\.meeting_left/,
    );
});

test("meeting presence waits for a confirmed join before allowing tracking", () => {
    const embedSource = readFileSync(
        resolve(ROOT, "ui/app/meeting-room.js"),
        "utf8",
    );
    const preflightSource = readFileSync(
        resolve(ROOT, "ui/app/participants.js"),
        "utf8",
    );
    assert.match(
        embedSource,
        /addEventListener\("videoConferenceJoined", \(event\) => \{[\s\S]*void callbacks\.keepPresenceAlive\(true\);/,
    );
    assert.match(
        embedSource,
        /new window\.JitsiMeetExternalAPI\(meetingHost, \{[\s\S]*roomName,/,
    );
    assert.match(
        embedSource,
        /await openMeetingEmbed\(\);\s*return \{ trackingAllowed: true \};/,
    );
    assert.doesNotMatch(
        embedSource,
        /frame\.hidden = false;[\s\S]*await callbacks\.keepPresenceAlive\(true\);/,
    );
    assert.match(
        embedSource,
        /if \(state\.meeting\.waitingForAuthentication\) \{[\s\S]*return \{ trackingAllowed: false \};/,
    );
    assert.match(
        embedSource,
        /if \(\s*state\.meeting\.state\?\.authRequired[\s\S]*return \{ trackingAllowed: false \};/,
    );
    assert.match(
        embedSource,
        /await openMeetingEmbed\(\);\n\s*return \{ trackingAllowed: true \};/,
    );
    assert.match(preflightSource, /function shouldTrackMeetingPresence\(\)/);
    assert.match(
        preflightSource,
        /function ensureMeetingTracking\(\) \{\n\s*if \(!shouldTrackMeetingPresence\(\)\) return;/,
    );
});

test("meetings overlay strings include alone participant prompt actions", () => {
    const source = readFileSync(
        resolve(ROOT, "ui/languages/en/strings.xml"),
        "utf8",
    );
    assert.match(source, /module\.jitsi_meet\.overlay\.alone_prompt/);
    assert.match(source, /module\.jitsi_meet\.overlay\.leave_meeting/);
    assert.match(source, /module\.jitsi_meet\.overlay\.remain_in_meeting/);
});

test("meetings mini chat filters room-event records from rendering", () => {
    const source = readJitsiUiBundle();
    assert.match(
        source,
        /\.filter\(\s*\(message\)\s*=>[\s\S]*application\/vnd\.cognis\.room-event\+json/,
    );
});

test("meetings mini chat supports the Messages reaction floating menu", () => {
    const appSource = readJitsiUiBundle();
    assert.match(
        appSource,
        /async function loadMessageUiResources\(\)[\s\S]*\/api\/v1\/modules\/jitsi-meet\/ui-resources/,
    );
    assert.match(appSource, /async function loadMessageReactionsController\(/);
    assert.match(appSource, /messageReactions\.renderReactionRow\(message\)/);
    assert.match(appSource, /messageReactions\.openEmojiPickerPopup/);
});

test("meetings speech bubbles use the same contrast-oriented color tokens as Messages", () => {
    const variantsCssSource = readFileSync(
        resolve(ROOT, "ui/jitsi-meet.css"),
        "utf8",
    );
    assert.match(
        variantsCssSource,
        /\.jitsi-chat-message[\s\S]*background:\s*var\(--color-surface-elevated\);/,
    );
    assert.match(
        variantsCssSource,
        /\.jitsi-chat-message-own[\s\S]*background:\s*var\(--color-accent\);/,
    );
});

test("jitsi API dispatches meeting lifecycle and participant notifications", () => {
    const source = readJitsiApiBundle();
    const uiResourcesSource = readFileSync(
        resolve(ROOT, "api/ui-resources.js"),
        "utf8",
    );
    assert.match(
        source,
        /registerNotificationCategory\("meetings", "Meetings"\)/,
    );
    assert.match(source, /subject: "Added to Meeting"/);
    assert.match(source, /subject: "Meeting Started"/);
    assert.match(source, /subject: "Meeting Ended"/);
    assert.match(source, /subject: "Participant Joined"/);
    assert.match(source, /subject: "Participant Left"/);
    assert.match(source, /function buildMeetingActionUrl\(meetingId\)/);
    assert.match(source, /function buildMeetingEmailLink\(meetingId\)/);
    assert.match(source, /function appendMeetingLinkToBody\(body, meetingId\)/);
    assert.match(source, /Meeting link: /);
    assert.match(source, /body: bodyWithMeetingLink/);
    assert.match(source, /organizerUsername: resolved\.meeting\.createdBy/);
    assert.match(source, /organizerUsername: meeting\.createdBy/);
    assert.match(source, /excludeUsernames: \[resolved\.requesterUsername\]/);
    assert.match(source, /excludedRecipients\.has\(normalizedCandidate\)/);
    assert.match(source, /senderName:/);
    assert.match(source, /notificationHasMeetingLink/);
    assert.match(source, /metadata\?\.event !== "meeting_ended"/);
    assert.match(
        source,
        /notificationHasMeetingLink[\s\S]*?actionUrl:[\s\S]*?buildMeetingActionUrl/,
    );
    assert.match(source, /resolveMessagesUiResources/);
    assert.match(
        uiResourcesSource,
        /\/api\/v1\/modules\/jitsi-meet\/ui-resources/,
    );
});

test("administration meetings section labels active and upcoming tables", () => {
    const source = readFileSync(
        resolve(ROOT, "ui/admin-meetings-section.js"),
        "utf8",
    );
    const stringsSource = readFileSync(
        resolve(ROOT, "ui/languages/en/strings.xml"),
        "utf8",
    );

    const adminRoutesSource = readFileSync(
        resolve(ROOT, "api/admin-meetings-routes.js"),
        "utf8",
    );
    const lifecycleRoutesSource = readFileSync(
        resolve(ROOT, "api/meeting-lifecycle-routes.js"),
        "utf8",
    );
    assert.match(
        source,
        /module\.jitsi_meet\.admin\.meetings\.active_table_heading/,
    );
    assert.match(
        source,
        /module\.jitsi_meet\.admin\.meetings\.upcoming_table_heading/,
    );
    assert.match(source, /createdByDisplayName/);
    assert.match(source, /row\.scheduledAt \?\? row\.createdAt/);
    assert.match(source, /<col style="width: 1%" \/>/);
    assert.match(source, /<col style="width: 24\.75%" \/>/);
    assert.match(source, /white-space: nowrap/);
    assert.match(source, /admin\.meetings\.meeting_url/);
    assert.match(source, /admin\.meetings\.schedule_date/);
    assert.match(stringsSource, /Active Meetings/);
    assert.match(stringsSource, /Upcoming Meetings/);
    assert.match(stringsSource, /Meeting URL/);
    assert.match(stringsSource, /Schedule Date/);
    assert.match(adminRoutesSource, /createdByDisplayName/);
    assert.match(lifecycleRoutesSource, /scheduledAt: body\.scheduledAt/);
});

test("meetings UI renders active meetings panel and deep-link join support", () => {
    const source = readJitsiUiBundle();
    const markupSource = readFileSync(resolve(ROOT, "ui/markup.js"), "utf8");
    const embedSource = readFileSync(
        resolve(ROOT, "ui/meeting-embed.js"),
        "utf8",
    );
    assert.match(
        markupSource,
        /module\.jitsi_meet\.participants\.active_meetings/,
    );
    assert.match(source, /\/api\/v1\/modules\/jitsi-meet\/meetings\/active/);
    assert.match(source, /requestedMeetingId/);
    assert.match(source, /String\(focusState\?\.meetingId \?\? ""\)/);
    assert.match(source, /frameless: Boolean\(focusState\)/);
    assert.match(source, /showTopbar: !focusState/);
    assert.match(source, /showNavbar: !limitedShareView && !focusState/);
    assert.match(
        source,
        /persistLayoutPreferences: !limitedShareView && !focusState/,
    );
    assert.match(
        source,
        /await joinMeetingById\(state\.requestedMeetingId, \{\s*autoStart: inShareView \|\| state\.requestedMeetingStart/,
    );
    assert.match(source, /searchParams\.get\("start"\) === "1"/);
    assert.doesNotMatch(source, /inShareView && Boolean\(resolvedMeetingId\)/);
    assert.match(source, /meetingPayload\.data\.participants/);
    assert.match(source, /shareAccessToken/);
    assert.match(source, /accessToken: state\.shareAccessToken \|\| undefined/);
    assert.match(
        source,
        /state\.selectedParticipants = meetingParticipantNames/,
    );
    assert.match(source, /callbacks\.renderParticipants\(\)/);
    assert.match(source, /username === currentUsername/);
    assert.match(
        source,
        /if \(!autoStart\) \{\s*state\.meeting = null;\s*callbacks\.renderParticipants\(\)/,
    );
    assert.match(source, /clearRequestedMeetingParameters\(\)/);
    assert.match(source, /module\.jitsi_meet\.meeting_not_found/);
    assert.match(source, /async function joinMeetingById/);
    assert.match(
        source,
        /await loadActiveMeetings\(\{ resolveRequested: true \}\)/,
    );
    assert.match(embedSource, /function readThemeCookie\(\)/);
    assert.match(embedSource, /explicitMode/);
    assert.match(embedSource, /const JITSI_THEME_BACKGROUNDS = \{/);
    assert.match(embedSource, /export function resolveJitsiDefaultBackground/);
    assert.match(embedSource, /document\.querySelector\("\.app-shell"\)/);
    assert.match(source, /async function switchAwayFromActiveMeeting\(\)/);
    assert.match(source, /await switchAwayFromActiveMeeting\(\)/);
    assert.match(markupSource, /role="grid"/);
});

test("meetings UI keeps Jitsi theme and active-meeting table responsive", () => {
    const appSource = readJitsiUiBundle();
    const cssSource = readFileSync(resolve(ROOT, "ui/jitsi-meet.css"), "utf8");
    assert.doesNotMatch(appSource, /jitsi-theme-sync/);
    assert.doesNotMatch(appSource, /applyJitsiWindowTheme/);
    assert.match(appSource, /const syncJitsiTheme = \(event\) =>/);
    assert.doesNotMatch(appSource, /function syncMobileChatPaneWidth\(\)/);
    assert.doesNotMatch(
        appSource,
        /const MOBILE_LAYOUT_MEDIA_QUERY = "\(max-width: 720px\)"/,
    );
    assert.match(
        appSource,
        /executeJitsiCommandIfSupported\(state\.jitsiApi, "overwriteConfig", \{[\s\S]*preferredTheme: nextThemeMode,[\s\S]*\}\);[\s\S]*interfaceConfigOverwrite at API creation/,
    );
    assert.match(appSource, /new MutationObserver\(syncJitsiTheme\)/);
    assert.match(appSource, /if \(themeChanged\) void openMeetingEmbed\(\);/);
    assert.match(appSource, /"cognis:themechange", syncJitsiTheme/);
    assert.match(
        cssSource,
        /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/,
    );
    assert.match(
        cssSource,
        /max-width: 720px[\s\S]*repeat\(2, minmax\(0, 1fr\)\)/,
    );
    assert.match(
        cssSource,
        /max-width: 520px[\s\S]*grid-template-columns: 1fr/,
    );
});

test("jitsi API exposes user active meetings endpoint", () => {
    const indexSource = readFileSync(resolve(ROOT, "api/index.js"), "utf8");
    const meetingsRoutesSource = readFileSync(
        resolve(ROOT, "api/meetings-routes.js"),
        "utf8",
    );
    assert.match(indexSource, /registerMeetingRoutes\(/);
    assert.match(
        meetingsRoutesSource,
        /"\/api\/v1\/modules\/jitsi-meet\/meetings\/active"/,
    );
    assert.match(
        meetingsRoutesSource,
        /const activeMeetings = await store\.listActiveMeetings\(\)/,
    );
    assert.match(
        meetingsRoutesSource,
        /if \(state\.authRequired && !state\.authCompletedAt\) continue;/,
    );
});

test("jitsi opts into composer DOM parking for its stateful iframe", () => {
    const source = readJitsiUiBundle();
    assert.match(source, /enableDomParking: true/);
});

test("meeting shares use the Cognis route and skip account setup", () => {
    const appSource = readJitsiUiBundle();
    const shareButtonSource = readFileSync(
        resolve(ROOT, "ui/share-button.js"),
        "utf8",
    );
    assert.match(shareButtonSource, /share:openPopup/);
    assert.match(shareButtonSource, /share:uiGateway/);
    assert.match(
        shareButtonSource,
        /shareUiGateway\.mountTrigger\(shareButtonSlot, \{/,
    );
    assert.match(shareButtonSource, /onActivate:/);
    assert.match(
        shareButtonSource,
        /if \(button\) \{\s*button\.disabled = !state\.jitsiConferenceJoined/,
    );
    assert.match(shareButtonSource, /destroy\(\)/);
    assert.doesNotMatch(
        shareButtonSource,
        /document\.createElement\("button"\)/,
    );
    assert.match(shareButtonSource, /contentUrl: `\/meetings\?meetingId=/);
    assert.match(shareButtonSource, /&start=1`/);
    assert.match(
        appSource,
        /accessToken: state\.shareAccessToken \|\| undefined/,
    );
    assert.match(
        appSource,
        /limitedShareView =\s*inShareView &&\s*Boolean\(shareContext\?\.guestAccessToken\) &&\s*shareContext\?\.directAccess !== true/,
    );
    assert.match(
        appSource,
        /if \(!limitedShareView\) await ensureFullAccountSession\(\)/,
    );
    assert.match(
        appSource,
        /createMeetingPageElements\(i18n, limitedShareView\)/,
    );
    assert.match(appSource, /if \(!inShareView\) \{[\s\S]*bindShareButton/);
});

test("active participant-free meetings remain joinable by their owner", () => {
    const source = readFileSync(
        resolve(ROOT, "ui/app/meetings-list.js"),
        "utf8",
    );
    assert.match(
        source,
        /const meetingHasActiveSession = state\.activeMeetings\.some/,
    );
    assert.match(
        source,
        /state\.selectedParticipants\.length === 0 &&\s*!meetingHasActiveSession/,
    );
});

test("active link-shared meetings ignore a stale closed state", () => {
    const apiSource = readJitsiApiBundle();
    assert.match(apiSource, /isActivelyOpen/);
    assert.match(apiSource, /activeMeetings\.some/);
    assert.match(apiSource, /endedAt: null/);
});

test("direct-account SPA shares mount the full Meetings page", () => {
    const appSource = readJitsiUiBundle();
    assert.match(
        appSource,
        /inShareView =\s*shareContext !== null &&\s*shareContext\?\.directAccess !== true/,
    );
});

test("meeting routes and standalone shell load only module-owned layout styles", () => {
    const apiSource = readFileSync(resolve(ROOT, "api/index.js"), "utf8");
    const appSource = readJitsiUiBundle();
    const uiResourcesSource = readFileSync(
        resolve(ROOT, "api/ui-resources.js"),
        "utf8",
    );
    const shellSource = readFileSync(resolve(ROOT, "ui/index.html"), "utf8");
    assert.doesNotMatch(apiSource, /\/static\/styles\/reuse\/layout\.css/);
    assert.doesNotMatch(shellSource, /\/static\/styles\/reuse\/layout\.css/);
    assert.match(apiSource, /\/static\/modules\/jitsi-meet\/jitsi-meet\.css/);
    assert.match(shellSource, /\/static\/modules\/jitsi-meet\/jitsi-meet\.css/);
    assert.doesNotMatch(appSource, /ensureStylesheetLoaded/);
    assert.doesNotMatch(uiResourcesSource, /stylesheetUrls/);
});

test("profile avatar rendering is centralized behind the host capability", () => {
    const bundleSource = readJitsiUiBundle();
    const avatarSurface = readFileSync(
        resolve(ROOT, "ui/app/profile-avatars.js"),
        "utf8",
    );
    assert.match(avatarSurface, /ui:profileAvatarRenderer/);
    assert.equal(bundleSource.match(/ui:profileAvatarRenderer/g)?.length, 1);
});

test("module CSS does not style host profile adapter structures", () => {
    const source = readFileSync(resolve(ROOT, "ui/jitsi-meet.css"), "utf8");
    assert.doesNotMatch(
        source,
        /\.(?:avatar-button|availability-|profile-capability-)/,
    );
    assert.match(source, /\.jitsi-participant-avatar-(?:bubble|img)/);
});

test("Jitsi UI uses host logging and feedback capabilities", () => {
    const feedbackSource = readFileSync(
        resolve(ROOT, "ui/reuse/feedback.js"),
        "utf8",
    );
    assert.match(feedbackSource, /ui:log/);
    assert.match(feedbackSource, /ui:showToast/);
    assert.match(feedbackSource, /ui:openErrorPopup/);

    const bundleSource = readJitsiUiBundle();
    assert.doesNotMatch(bundleSource, /console\.(?:error|warn)\(/);
    assert.doesNotMatch(bundleSource, /\/static\/reuse\/toast\.js/);
});
