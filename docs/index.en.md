# Jitsi Meet Module

Jitsi Meet provides Cognis meeting rooms with participant selection, Messages chat, session reclaim, scoped sharing and an optional synchronized Whiteboard. External services are resolved through ctx; the module owns its API, browser resources and storage.

## Usage Examples

- In Administration → Modules, configure an HTTP(S) Jitsi instance URL, run the enablement test and enable Jitsi Meet. Administration → Meetings lists active and upcoming meetings.
- Open Meetings, select participants and start or join a room. A visible profile handle is required for profile-dependent operations. Existing active membership remains discoverable through the authenticated account identity if its profile handle becomes unavailable.
- Drop an available participant into a running meeting to request Share approval. A decline restores the participant to the available list and shows a toast.
- Select Whiteboard to open the meeting canvas, or Close Whiteboard to close it. Screen sharing disables that control with an explanatory tooltip. Link-share guests follow the organizer’s state without a visible control.

Browser callers obtain the module’s VoIP integration from the host-initialized context:

```js
const startCall = uiCtx.capabilities.get("voip:startCall");
const action = await startCall({
    source: "messages",
    room: { id: roomId, kind: "group" },
    users: members,
    supportedActions: ["component"],
});
```

The returned action describes a Meetings component; the caller launches it through the host component-page contract.

## Technical Specification

### Integration and Action Flows

`bootstrap.js` registers module-owned routes, UI contributions, public `jitsi-meet:getMeetingChat`, the browser `voip:startCall` provider, and hooks on existing host meeting, sharing and deprovisioning flows. The module is unprivileged and declares required component UUIDs and capabilities in its manifest. Optional Whiteboard services are discovered dynamically and do not prevent activation.

Enabled asynchronous store operations execute module-owned `jitsi-meet:*` flows with `initialize-store` and `execute-action` stages. Routed authorization and validation remain at the API boundary; owner handlers perform the actual operation, and internal store calls preserve transaction boundaries. Missing execution results are errors. Tests verify the complete asynchronous action catalog, real owner-stage execution and failure propagation using public-contract fakes.

The restricted `api/disabled.js` entrypoint registers configuration and enable-test endpoints without feature routes or UI. Cognis does not register disabled module flows, so this lifecycle configuration uses the same injected store directly. Uninstall removes configuration and optionally saved module data. Host-scoped route, capability, flow and hook registrations are removed by Cognis when the module is disabled.

### Configuration and API Access

All endpoints use `/api/v1/modules/jitsi-meet`. Configuration `GET` requires a user; `PUT`, `DELETE` and `/admin/enable-test` require an administrator and remain available while disabled. Configuration validates an HTTP(S) instance URL. The enablement test requires configured service liveness. The configured origin is supplied to the host CSP origin capability. Changing an existing instance clears module-owned meeting data through a database transaction.

Meeting creation, joins, presence, state, password claims, session reclaim, participant changes, chat summaries, persisted departures and Whiteboard changes require authenticated access and meeting authorization. Administration discovery requires an administrator. Profile identities and Messages, Share, notification and calendar data use host capabilities. Share guests must hold the exact resource capability required by the operation; permission denial is never retried without that capability. User shares and block relationships are checked through the host access contracts. Guest mounts do not query account-profile or participant-search endpoints.

### Meeting Identity and Persistence

Meeting IDs and passwords use cryptographic randomness. Names are host-generated four-word, title-cased passphrases reused as the room slug, URL and explicit Jitsi room name. Initialization never regenerates existing identities. Persistent meetings are resolved by their complete normalized original participant set and retain their room and password across membership changes and process restarts. Meeting credentials and state use module-owned storage with the host-injected database executor and scoped encryption.

Saved meetings own a unique Messages `chat_room_id`. Creating another saved meeting requests `reuseExisting: false`; reopening a meeting retains its existing room, and participant joins/leaves change membership rather than room identity. `jitsi_chat_calls` separately reserves one disposable call per conversation. Room assignment and call reservations are transactional, so conflicts roll back without orphan meeting rows. Serialized schema initialization prevents concurrent configuration and lifecycle requests from racing.

Presence expires after missed heartbeats. Joining deactivates the account’s other meeting sessions, and ended meetings ignore remaining presence. Participant-free meetings are disposable and delete their owned chat and meeting record when they end; Messages-initiated calls preserve their source conversation. A departing link-share guest stays on the Left Meeting overlay. Ending a disposable meeting also removes its meeting shares.

### Optional Whiteboard Contract

Nextcloud Whiteboard is a soft dependency. Browser discovery resolves `whiteboard:uiGateway` after the host UI context exists, alongside the floating-window capability. The browser canvas factory determines control availability; missing factories omit the control. Activation checks the server availability endpoint before creation. Server verification requires the published `whiteboard:fetchBoardData`, `whiteboard:membership` and `whiteboard:deleteCanvas` contracts. Availability diagnostics include provider version, integrity and trust information.

Jitsi uses the public gateway methods `requestCanvasPage({signal})` and `openCanvas({whiteboardId, elementId, signal})`. The Whiteboard provider owns its route IDs, canvas layout, transport and session semantics. Jitsi supplies only the exact board ID and its own mount target; it releases the returned window on teardown. Membership changes use the server-owned public membership contract. Jitsi bounds its embedded component host to the meeting viewport and stretches the mounted root into a definite grid row. This keeps contained provider surfaces visible without letting their intrinsic size expand the meeting window.

An enabled Whiteboard provider with an incomplete public UI contract leaves a disabled control with an explanatory tooltip and logs the missing capability methods. A failed provider load is also explained. An absent optional provider omits the control. Avatar availability is independent of Whiteboard readiness; a profile availability 404 does not disable it.

Persistent meetings use `createCanvas`; only meetings explicitly marked disposable use `createDisposableCanvas`. Participant counts and changing invitation lists do not change canvas persistence. Saved matching canvas mappings are reused when reopening a meeting. Canvas mappings must match the exact board ID, meeting title and expected creator account. Membership updates resolve the actual board owner and canonical participant account IDs. Link guests reuse only a verified existing mapping and never create or replace it. Share delegates access only while the exact meeting-to-board relationship is currently open.

The organizer opens immediately; other participants require a strict majority of present non-organizers through Share approval. Screen sharing prevents opening. Parent-page keyring authorization precedes the embedded component window. Automatic opening waits for browser activation, and a failed automatic attempt is not repeated for that board. Retry delays are bounded and abortable; cancellation releases timers and listeners and prevents another spawn.

Concurrent canvas preparation shares its pending factory operation. A failed synchronization can reuse that uncommitted canvas across remounts, while a different provider instance has an isolated cache. A result arriving after navigation or a meeting change cannot alter the current trigger.

Joining an active meeting restores the authorized account’s membership in its open persistent Whiteboard before returning the join payload, independently of chat selection. Automatic account opening runs `jitsi-meet:followWhiteboard` to verify the exact open mapping, grant owner-authorized membership and confirm the mapping again before mounting. Following never starts another approval vote or changes open state; a closed or replaced board cancels quietly. Link guests retain delegated access, and closed mappings do not make the optional provider a join dependency.

Meeting selection stays locked while loading, resolving a keyring, awaiting authentication or reclaim, and throughout an embedded conference. Join requests share their pending operation; cancellation and stale responses cannot replace the current target. Active discovery includes authorized invited meetings with current presence while authentication is pending. Restarting a persistent meeting restores its saved canvas through the public owner-authorized membership contract. An unavailable or deleted optional canvas is logged and leaves the meeting join available.

### UI Mounts and Conference Sessions

Meetings uses the Cognis page composer, SPA router, host-initialized UI context and `ui:reuse`. Module CSS targets Jitsi-owned surfaces and controls; it does not override composer presentation. Embedded mounts accept `meetingId` in `focusState` and omit duplicated navigation. Each active mount claims `.jitsi-route-root`; abort removes its claim and module-owned observers, timers, handlers and conference work. Polling checks mount lifetime, request order and meeting identity before applying results, including ended and reclaimed states. Successful empty responses end the loading presentation, and unchanged responses preserve existing participant DOM.

Whiteboards mount through the host component-page broker. PiP uses the host floating-window toolbar and browser top layer while retaining the original DOM ancestry, theme and typography. Overlays, status controls, preflight indicators and invitation dropzones follow the live meeting frame and return on release. The full-size alone prompt retains the heading, disabled Start button and preflight status alongside Leave/Remain. Only PiP hides those extra elements to fit its minimum size; returning to the main window restores them. The minimum size is 400 × 225, increasing once to 500 × 282 when a third active participant joins. Drag cancellation, Escape and window blur remove the invitation target. A joined user cannot switch to another active meeting. Concurrent conference-exit events share one teardown, which closes frames, stops chat polling and refreshes availability.

Before embedding, the module clears only Jitsi’s cached authentication session identifier and preserves other preferences. Denied or malformed browser storage is logged and does not prevent joining. After a DOM reparenting reconnect, a previously successful join may resubmit its resolved password; repeated rejection before a successful join still requests an updated keyring value. Starting a meeting holds the host page-loading token through preflight and the join attempt.

### Cleanup and Release Verification

If the deleted account organized a retained meeting, ownership passes to the first surviving participant in normalized handle order, including when the organizer previously left its rosters; other organizers and chat-room identities remain unchanged.

Final persisted departure and account deprovisioning share owner-authorized external resource cleanup. Missing resources are logged and do not block cleanup; other failures propagate before the meeting record is removed. Account deletion updates original and active rosters, retains usable rooms and deletes unusable meetings. One child-first table catalog includes presence, state, participants and disposable-call reservations for record deletion.

The module synchronizes manifest, package and lockfile versions and verifies packaged SHA-256 hashes. Tests use module-local public-contract fakes and enforce component isolation, namespace ownership, source size, documentation structure and locale parity. Release notes use one German, English, Indonesian and Japanese changelog set per PR.

Provider versions in availability responses are diagnostics: `testedProvider` names the tested release while `provider.version` reports the installed release from host assurance. Availability is gated by the public capability, not an undocumented minimum-version comparison. Integrators may implement the same neutral contract without using Nextcloud.

### Module Structure and Lifecycle

API registration is in `api/index.js`, domain handlers in `api/routes/<domain>/index.js`, CSS in `ui/styles/`, and reusable markup in `ui/templates/`. Use the template-derived AGENTS.md and run local scripts with `npm --prefix <checkout> test`; installed operations use `cognisctl modules:jitsi-meet:ping`. Browser providers export `mountProvider(scopedUiCtx)` and use scoped flows, capabilities and listeners. Navbar links are contributed through `ui:navbarLinks`. Server health contributions and keyring owners return cleanup attached with `ctx.registerDisposer`. Keyring reset clears password-delivery receipts for re-delivery and preserves meetings, membership and canvases.

The browser regression uses an installed Chromium executable through CDP, without Playwright. Run `CHROMIUM_EXECUTABLE_PATH=/path/to/chromium npm --prefix <checkout> run test:browser`. Regenerate hashes with `npm run manifest:hashes`, then run `npm run check:manifest`. Release metadata lives in `docs/changelog/` and is excluded from packaged digests.

The marketplace banner combines Cognis branding with the provider identity in a central crop-safe layout; the existing provider icon is retained.

## Meeting administration and recovery

Administration → Meetings offers Active, All meetings and Issues pill filters. The admin-only listing reads existing meeting records without requiring schema initialization, flags duplicate participant sets and URLs plus shared chat-room/canvas references, and never exposes passwords. Terminate ends Cognis presence and closes the meeting for connected Cognis clients; it does not claim to administer an independently joined Jitsi conference. Active meetings must be terminated before deletion. Delete removes meeting-owned records and shares, deleting a chat room or canvas only when no other meeting references it. Cleanup failures retain the meeting record for retry; already absent resources permit cleanup to continue. Deleting duplicate references clears cached uniqueness failures so ordinary schema initialization can retry. Non-admin routes retain normal schema enforcement. Meeting discovery stops automatic polling on a failed response and reports the failure instead of repeatedly retrying it.

## Exclusive integration source bindings

Meeting chats declare `source: {sourceType: "meeting", sourceId: meeting.id}` through the Messages resolver. Canvas activation claims the same identity through `whiteboard:sourceBinding`. Provider-owned claims reject competing meeting bindings; Jitsi never edits their binding columns. Administration deletion releases only the deleted meeting’s binding when another historical reference survives. Messages-initiated call cleanup releases its source claim while retaining the source conversation. Creating a new call rolls back its meeting record if chat binding fails. Messages source binding is required; Whiteboard remains optional and is available only when its source-binding contract exists.

Configuration and enablement initialize only the configuration table, so meeting integrity failures do not prevent enabling the module and opening administration recovery. Administration initializes only the auxiliary participant-history table needed for inspection; it preserves meeting constraints.

## Readable meeting administration

Meeting lists share one panel with space between Active and Upcoming sections. Meeting names, IDs and expandable chat/canvas references stay together; compact issue pills leave room for participants, activity and actions. Filter buttons use the host neutral control without positional hover movement. Upcoming lists only inactive, unended meetings with a valid future schedule; elapsed, missing and invalid schedules remain available in All meetings.

## Stable meeting canvas identifiers

Jitsi supplies the meeting UUID as `resourceId` and `meeting` as `resourceType`; the display name is only the title. Reopening the same meeting requests the same generic provider reference, even after its name changes. Whiteboard owns persistence, access checks and concurrent reference resolution without knowledge of Jitsi internals.

## Alone-in-meeting prompt after confirmed entry

The alone-in-meeting prompt follows a confirmed local Jitsi conference and current presence, rather than the invitation or membership count. It still observes the existing join/authentication grace period and Remain dismissal, and returns after another participant joins and later leaves. Pending authentication does not show an alone prompt. Once Jitsi confirms entry, stale authentication status cannot replace the live prompt. Full-window and PiP appearance and placement remain unchanged.

## One meeting identity per participant set

Creation reuses a database meeting with the same normalized current or original participant set, regardless of the caller’s context. There is no forceNew option. Creation uses a stable participant key and an atomic conflict-ignore insert; concurrent requests return the same ID. Membership changes preserve the creation key, and lookup and discovery no longer stop after a fixed record count. Historical matches prefer the single active meeting; multiple active matches require administrator recovery. Reuse restores the requested membership and cannot replace an existing chat association. Authentication waiters retain presence and poll the existing meeting; when authentication completes, they join that same ID. Confirmed Jitsi entry starts recurring presence tracking even if authentication flags are stale. The Meeting List remains blocked during joins and conferences, with a not-allowed cursor and inert cards.

## Recovery of deleted meeting and canvas references

An explicit canvas open refreshes its generic provider reference instead of trusting a prepared canvas ID. Missing canvases are recreated through the provider and mapped back to the meeting. An already-approved open canvas can be replaced without another consensus request only when the provider confirms that the previous canvas is absent and the replacement has the exact resource type and identifier. Explicit launch of a deleted meeting uses its loaded participant metadata and normal canonical creation, preserving its disposable setting and joining the returned replacement ID. Unknown references, guests and permission/service failures are not used to infer new resources. Deleted content is not restored; recovery creates a fresh item, with success notifications and bounded attempts.

Direct-load Meetings pages abort their mount when the host commits a route change or the document leaves. Discovery polling belongs to that mount, stops on abort and cannot restart afterward; late responses and cancelled requests cannot update the destination page or show Meetings errors there. Cancelled navigation keeps the current page alive.

References use the host’s collapsible section composer, matching Components. Expanded references survive meeting and upcoming-meeting polling, with keyboard-accessible disclosure controls. Filters are Active Meetings, All Meetings and Troubled Meetings, each with a distinct empty message.

Canvas source claims occur only after approval and inside the serialized state update. Membership or persistence failures release newly claimed canvases while preserving existing mapped claims. General meeting creation cannot provision disposable calls; recovery of conversation calls uses the existing conversation’s VoIP route. Superseded upcoming polls are ignored. Direct pages consume the host lifecycle signal instead of creating independent controllers.

## Handle connection loss during discovery

Meeting discovery stops polling after a network failure and catches timer rejections. Offline and cancelled requests do not open discovery error toasts or clear the last meeting lists. The module uses the optional host offline-state capability and keeps cleanup tied to the page signal. Active-meeting presence and state polling follow the same lifecycle and stop together after a failed background request.
