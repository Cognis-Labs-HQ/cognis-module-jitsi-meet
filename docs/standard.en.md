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

Saved meetings may share a Messages conversation. Historical `chat_room_id` references are not unique; `jitsi_chat_calls` reserves one disposable call per conversation and one conversation per call. Creation and reassignment reserve within their owning transaction, so conflicts leave no orphan rows. Room lookup prefers the reserved call, otherwise the most recently updated saved meeting. Deletion and configuration reset release reservations. Serialized schema initialization prevents concurrent configuration and lifecycle requests from racing.

Presence expires after missed heartbeats. Joining deactivates the account’s other meeting sessions, and ended meetings ignore remaining presence. Participant-free meetings are disposable and delete their owned chat and meeting record when they end; Messages-initiated calls preserve their source conversation. A departing link-share guest stays on the Left Meeting overlay. Ending a disposable meeting also removes its meeting shares.

### Optional Whiteboard Contract

Nextcloud Whiteboard is a soft dependency. Browser discovery resolves `whiteboard:uiGateway` after the host UI context exists, plus component-page and floating-window capabilities. The browser canvas factory determines control availability; missing factories omit the control. Activation checks the server availability endpoint before creation. Server verification requires the published `whiteboard:fetchBoardData`, `whiteboard:membership` and `whiteboard:deleteCanvas` contracts; Nextcloud Whiteboard 2.3.146 or newer supplies the verification contract. Availability diagnostics include provider version, integrity and trust information.

Jitsi uses the public gateway methods `requestCanvasPage({signal})` and `openCanvas({whiteboardId, elementId, signal})`. The Whiteboard provider owns its route IDs, canvas layout, transport and session semantics. Jitsi supplies only the exact board ID and its own mount target; it releases the returned window on teardown. Presentation requires Whiteboard 2.3.147 or newer. Membership changes use the server-owned public membership contract. Jitsi bounds its embedded component host to the meeting viewport and stretches the mounted root into a definite grid row. This keeps contained provider surfaces visible without letting their intrinsic size expand the meeting window.

An enabled Whiteboard provider with an incomplete public UI contract leaves a disabled control with an explanatory tooltip and logs the missing capability methods. A failed provider load is also explained. An absent optional provider omits the control. Avatar availability is independent of Whiteboard readiness; a profile availability 404 does not disable it.

Invited meetings use `createCanvas`; participant-free meetings use `createDisposableCanvas`. Canvas mappings must match the exact board ID, meeting title and expected creator account. Membership updates resolve the actual board owner and canonical participant account IDs. Link guests reuse only a verified existing mapping and never create or replace it. Share delegates access only while the exact meeting-to-board relationship is currently open.

The organizer opens immediately; other participants require a strict majority of present non-organizers through Share approval. Screen sharing prevents opening. Parent-page keyring authorization precedes the embedded component window. Automatic opening waits for browser activation, and a failed automatic attempt is not repeated for that board. Retry delays are bounded and abortable; cancellation releases timers and listeners and prevents another spawn.

Concurrent canvas preparation shares its pending factory operation. A failed synchronization can reuse that uncommitted canvas across remounts, while a different provider instance has an isolated cache. A result arriving after navigation or a meeting change cannot alter the current trigger.

Joining an active meeting restores the authorized account’s membership in its open persistent Whiteboard before returning the join payload, independently of chat selection. Automatic account opening runs `jitsi-meet:follow-whiteboard` to verify the exact open mapping, grant owner-authorized membership and confirm the mapping again before mounting. Following never starts another approval vote or changes open state; a closed or replaced board cancels quietly. Link guests retain delegated access, and closed mappings do not make the optional provider a join dependency.

Meeting selection stays locked while loading, resolving a keyring, awaiting authentication or reclaim, and throughout an embedded conference. Join requests share their pending operation; cancellation and stale responses cannot replace the current target. Active discovery includes authorized invited meetings with current presence while authentication is pending. Restarting a persistent meeting restores its saved canvas through the public owner-authorized membership contract. An unavailable or deleted optional canvas is logged and leaves the meeting join available.

### UI Mounts and Conference Sessions

Meetings uses the Cognis page composer, SPA router, host-initialized UI context and `ui:reuse`. Module CSS targets Jitsi-owned surfaces and controls; it does not override composer presentation. Embedded mounts accept `meetingId` in `focusState` and omit duplicated navigation. Each active mount claims `.jitsi-route-root`; abort removes its claim and module-owned observers, timers, handlers and conference work. Polling checks mount lifetime, request order and meeting identity before applying results, including ended and reclaimed states. Successful empty responses end the loading presentation, and unchanged responses preserve existing participant DOM.

Whiteboards mount through the host component-page broker. PiP movement uses the host floating-window toolbar; overlays and invitation dropzones follow the live meeting frame and return on release. The minimum size is 400 × 225, increasing once to 500 × 282 when a third active participant joins. Drag cancellation, Escape and window blur remove the invitation target. A joined user cannot switch to another active meeting. Concurrent conference-exit events share one teardown, which closes frames, stops chat polling and refreshes availability. Status controls and preflight indicators resolve from the active overlay even after it leaves the page root; floating frames keep their module styles and the overlay covers the video viewport.

Before embedding, the module clears only Jitsi’s cached authentication session identifier and preserves other preferences. Denied or malformed browser storage is logged and does not prevent joining. After a DOM reparenting reconnect, a previously successful join may resubmit its resolved password; repeated rejection before a successful join still requests an updated keyring value. Starting a meeting holds the host page-loading token through preflight and the join attempt.

### Cleanup and Release Verification

Final persisted departure and account deprovisioning share owner-authorized external resource cleanup. Missing resources are logged and do not block cleanup; other failures propagate before the meeting record is removed. Account deletion updates original and active rosters, retains usable rooms and deletes unusable meetings. One child-first table catalog includes presence, state, participants and disposable-call reservations for record deletion.

Module 1.5.242 synchronizes manifest, package and lockfile versions and verifies packaged SHA-256 hashes. Tests use module-local public-contract fakes and enforce component isolation, namespace ownership, source size, documentation structure and locale parity. Release notes use one German, English, Indonesian and Japanese changelog set per PR.
