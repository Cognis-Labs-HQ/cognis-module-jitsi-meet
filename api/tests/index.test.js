import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

test("jitsi manifest declares its supplied capabilities and dependencies", () => {
    const manifest = JSON.parse(
        readFileSync(resolve(ROOT, "manifest.json"), "utf8"),
    );

    assert.deepEqual(manifest.requiresCapabilities, [
        "auth:requireAuth",
        "ui:profileAvatarRenderer",
        "files:uiClient",
        "social:profileUiClient",
        "social:profile:identity",
        "social:messagesUiClient",
        "social:messages:deleteChatroom",
        "social:messages:membership",
        "social:messages:resolveRoomMembership",
        "share:uiClient",
        "share:uiGateway",
        "share:openPopup",
        "share:requestApproval",
        "ui:log",
        "ui:showToast",
        "ui:openErrorPopup",
        "ui:reuse",
        "component-pages:spawn",
        "component-pages:discard",
        "ui:makeFloatingWindow",
    ]);
    assert.deepEqual(manifest.capabilities, [
        "meeting:video",
        "meeting:chat",
        "meeting:moderation",
        "meeting:getMeetingChat",
        "voip:startCall",
    ]);
    assert.deepEqual(manifest.requires, [
        "e8732526-8976-54ef-828b-ed0dfe21bd9e",
        "4387fae9-26dd-5a80-84b2-e5f4833b7fb9",
        "0da92508-63fa-53ed-918c-e6f08692a382",
        "062a74f5-5699-52fb-98a3-63ec6538bdfc",
    ]);
});

function readJitsiApiBundle() {
    const apiDir = resolve(ROOT, "api");
    return readdirSync(apiDir)
        .filter((entry) => entry.endsWith(".js"))
        .sort()
        .map((entry) => readFileSync(join(apiDir, entry), "utf8"))
        .join("\n");
}

test("active participant additions require a final Share approval decision", () => {
    const source = readJitsiApiBundle();
    assert.match(source, /getCapability\("share:requestApproval"\)/);
    assert.match(
        source,
        /result === true \|\| result\?\.approved === true[\s\S]*?result === false \|\| result\?\.approved === false/,
    );
    assert.doesNotMatch(source, /Participant addition consensus/);
    assert.doesNotMatch(source, /share_approval_mint_failed/);
    assert.match(source, /participant addition is rejected/);
    assert.match(source, /return \{ approved: false, failOpen: false \}/);
    assert.match(source, /participant_addition_declined/);
    assert.match(
        source,
        /action: `add \$\{participantUsername\} as a meeting participant`/,
    );
    assert.match(source, /target: meetingName/);
});

test("participant Whiteboard opens request approval from active meeting peers", () => {
    const source = readJitsiApiBundle();
    assert.match(source, /requestWhiteboardOpenApproval/);
    assert.match(source, /action: "open the meeting Whiteboard"/);
    assert.match(source, /operation: "request_whiteboard_open_approval"/);
});

test("disposable Messages calls stay out of Meetings discovery", () => {
    const source = readFileSync(
        resolve(ROOT, "api/meetings-routes.js"),
        "utf8",
    );
    assert.match(source, /if \(!meeting \|\| meeting\.disposable\) continue;/);
});

test("jitsi bootstrap uses scoped lifecycle registrations", () => {
    const bootstrapSource = readFileSync(resolve(ROOT, "bootstrap.js"), "utf8");

    assert.match(bootstrapSource, /ctx\.contributePublicCapability\(/);
    assert.match(bootstrapSource, /ctx\.registerFlow\(flow\)/);
    assert.match(bootstrapSource, /if \(!ctx\.flow\.exists\(flow\.id\)\)/);
    assert.match(
        bootstrapSource,
        /stages: \["resolve-providers", "resolve-panels", "compose-surface"\]/,
    );
    assert.match(
        bootstrapSource,
        /stages: \["validate-request", "provision-session", "finalize-join"\]/,
    );
    assert.doesNotMatch(bootstrapSource, /getCapability\(['"]system:ctx['"]\)/);
});

test("jitsi API registers configured CSP origins through auth capability", () => {
    const indexSource = readFileSync(resolve(ROOT, "api/index.js"), "utf8");
    const bundleSource = readJitsiApiBundle();

    assert.match(indexSource, /auth:registerPageScriptOrigins/);
    assert.match(
        bundleSource,
        /registerConfiguredJitsiOrigin\(registerScriptOrigins, saved\)/,
    );
    assert.match(indexSource, /ctx\.getCapability\("auth:requireAuth"\)/);
});

test("jitsi resolves guest access through the Share gateway contract", () => {
    const source = readFileSync(resolve(ROOT, "api/index.js"), "utf8");
    assert.match(source, /ctx\.getCapability\(\s*"share:resolveGuestAccess"/);
    assert.match(source, /resourceType: "meeting"/);
    assert.match(source, /const legacyMeetingAccess/);
    assert.match(source, /legacyMeetingAccess\?\.authorized === true/);
});

test("kicked share guests can revoke only the link represented by their claims", () => {
    const apiSource = readFileSync(resolve(ROOT, "api/index.js"), "utf8");
    const hooksSource = readFileSync(
        resolve(ROOT, "api/share-hooks.js"),
        "utf8",
    );
    assert.match(apiSource, /resolveShareGuestId\(claims\)/);
    assert.match(apiSource, /selfRevocation: true/);
    assert.match(
        hooksSource,
        /input\.selfRevocation === true[\s\S]*resolveShareGuestId\(input\.claims\)[\s\S]*input\.shareId/,
    );
});

test("meeting state polling publishes current membership for participant refreshes", () => {
    const source = readFileSync(
        resolve(ROOT, "api/meetings-routes.js"),
        "utf8",
    );
    assert.match(
        source,
        /activeParticipants:[\s\S]*participants: resolved\.participants,[\s\S]*sessionActive:/,
    );
});

test("meeting share guests receive the Jitsi meeting password", () => {
    const source = readJitsiApiBundle();

    assert.match(
        source,
        /if \(shareGuestAccess\.isGuest\)[\s\S]*meetingPassword:\s*meeting\.meetingPassword/,
    );
});

test("jitsi authorizes its scoped guest chat through a neutral Messages contract", () => {
    const source = readJitsiApiBundle();

    assert.match(source, /social:messages:registerExternalRoomAuthorizer/);
    assert.match(source, /getMeetingByChatRoomId\(roomId\)/);
    assert.match(source, /requiredCapability/);
    assert.match(source, /social:messages:membership/);
});

test("participant-free meetings delete their identity, shares, and chat when closed", () => {
    const source = readJitsiApiBundle();

    assert.match(
        source,
        /const participantlessMeeting = resolved\.participants\.every/,
    );
    assert.match(source, /deleteResourceShares\?\.\(/);
    assert.match(source, /social:messages:deleteChatroom/);
    assert.match(
        source,
        /typeof deleteChatroom !== "function"[\s\S]*authorized Messages chatroom deletion capability/,
    );
    assert.match(source, /deleteReferencedMeetingResource\(\{/);
    assert.match(source, /deleteChatroom\(\{/);
    assert.match(source, /roomId: resolved\.meeting\.chatRoomId/);
    assert.match(source, /actorAccountId: claims\.sub/);
    assert.match(source, /await store\.deleteMeeting\(meeting\.id\)/);
    assert.match(source, /async deleteMeeting\(meetingId\)/);
});

test("jitsi API logs stored CSP origin registration failures", () => {
    const source = readFileSync(resolve(ROOT, "api/index.js"), "utf8");

    assert.match(source, /Failed to register stored Jitsi CSP origin/);
    assert.match(source, /operation: "register_stored_jitsi_origin"/);
});

test("jitsi participant lookup delegates follow filtering to profile search", () => {
    const source = readJitsiApiBundle();

    assert.match(source, /includeHidden = hasMinRole\(claims\.role, "admin"\)/);
    assert.match(source, /profileStore\.searchProfiles\(query, 50, \{/);
    assert.match(source, /followingAccountId: claims\.sub/);
    assert.match(source, /candidateHandles: activeParticipantHandles/);
    assert.match(source, /activeParticipantHandles\.length > 0/);
    assert.match(source, /avatarKey: profile\.avatarKey \?\? null/);
});

test("jitsi meeting notifications target authenticated account ids", () => {
    const source = readFileSync(resolve(ROOT, "api/index.js"), "utf8");

    assert.match(source, /recipientUsername: recipient\.accountId/);
    assert.match(source, /profileStore\s*\.getProfile\(recipientUsername\)/);
    assert.match(source, /resolve_meeting_notification_recipient/);
    assert.match(
        source,
        /store\.getMeetingById\([\s\S]*?notificationMeeting\?\.disposable\) return;/,
    );
});

test("jitsi meeting creation resolves hidden participants only for admins", () => {
    const apiSource = readJitsiApiBundle();
    const accessSource = readFileSync(
        resolve(ROOT, "api/reuse/meeting-access.js"),
        "utf8",
    );

    assert.match(
        accessSource,
        /if \(!includeHidden && profile\.visibility === "hidden"\) continue/,
    );
    assert.match(
        apiSource,
        /\{ includeHidden: hasMinRole\(claims\.role, "admin"\) \}/,
    );
});

test("jitsi meetings API exposes current events query endpoint", () => {
    const apiSource = readFileSync(resolve(ROOT, "api/index.js"), "utf8");
    const routesSource = readFileSync(
        resolve(ROOT, "api/meetings-routes.js"),
        "utf8",
    );

    assert.match(apiSource, /calendar:listCalendars/);
    assert.match(apiSource, /calendar:listEvents/);
    assert.match(
        routesSource,
        /\/api\/v1\/modules\/jitsi-meet\/events\/current/,
    );
    assert.match(routesSource, /ownership must be one of all, own, or invited/);
});
