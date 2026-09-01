# Invite participants to active meetings

**Feature Branch:** feature-update-participant-handling-during-meetings

## Extend active non-disposable meetings

Participants can now be dragged into an active meeting that began with invitees. The meeting membership and encrypted Messages chat are updated, the new participant receives an invitation, and they can claim the meeting password when joining. Staged participants are not returned to the available list after the meeting starts.

## Keep active meeting surfaces usable

Participant refreshes no longer reopen the lobby overlay over a joined meeting, so notification and active-list joins remain usable. The available participant column now displays “No available participants.” when empty.

## Reveal the active participant dropzone

Dragging an available participant now temporarily reveals a localized drop target over an eligible active meeting window. Dropping invites the participant, while ending the drag restores the uninterrupted meeting view.

## Layer the dropzone over the Jitsi embed

A valid participant drag now activates the dropzone directly from the avatar drag event. The dropzone exactly matches the embedded Jitsi window, moves above the iframe while dragging, and returns below it when the participant is dropped or the drag ends.

## Keep the green drag guide visible

The active participant target now keeps the same green outline throughout the entire drag, adds an inset green edge and dashed target, and clears the guide only when the drag ends or the participant is dropped.

## Revoke access for kicked attendees

The meeting client now recognizes local Jitsi kick events and errors. Kicked account users are removed from stored membership and reappear as available invitees, while kicked guests have only the Share link used for their session revoked; presence is also made inactive.

## Release the persistent route root on unmount

Routed, shared, and embedded Meetings mounts now avoid claiming an already-aborted root and remove `.jitsi-route-root` when their lifecycle signal aborts. Async initialization stops before creating later presentation work, while existing cleanup continues to dispose observers, handlers, timers, chat work, whiteboards, and the Jitsi embed.

## Prevent participant-key collisions and hide reserved users

Active membership changes now use a meeting-scoped participant key, preventing PostgreSQL uniqueness failures when the resulting roster matches another meeting. Participant discovery omits users actively present in another meeting, and the active-invite API enforces the same availability rule without hiding scheduled invitees.

## Refresh live participant integrations

Available participants and active meetings now refresh every five seconds, avatar presence providers initialize after SPA navigation, meeting chat reloads expanded membership and messages, and successful active invitations show a toast. Existing persistent whiteboards receive expanded participant access through an optional provider capability. Empty participant copy matches the active-meeting empty state, kick copy is shorter, and the advertised picture-in-picture minimum is 320 × 180 pixels.

## Distinguish Whiteboard actions

The Whiteboard button now uses the confirm treatment when it opens a board and switches to the cancel treatment while it displays “Close Whiteboard.”

## Scale the meeting PiP minimum

The base meeting PiP minimum is now 400 × 225 pixels, 25% larger than before. The third active participant increases both dimensions once by 25%, and Cognis applies the capped minimum immediately through its floating-window updater.

## Verify the Whiteboard expansion contract

Meetings now validates the exact `whiteboard:uiGateway.expandCanvasAccess` contract supplied by Nextcloud Whiteboard PR 24. A successful update must identify the requested canvas and return every requested participant in the expanded access list before Meetings records the synchronization as complete.

## Stop unauthorized Whiteboard expansion retries

Only the meeting organizer now invokes the owner-authorized canvas expansion capability. Invited participants make no expansion request, and a failed owner request is remembered for that exact canvas and participant set so polling and embed lifecycle updates cannot repeatedly submit the same forbidden request.

## Keep overlays with PiP and recover automatic Whiteboards

Meeting overlays, including the alone-participant prompt, now move into the floating Jitsi frame while Whiteboard PiP is active and return to the stage when it closes. Automatic Whiteboard opening now retries transient dynamic-module import failures through the full bounded backoff instead of stopping after the first failure.

## Cap PiP growth at three participants

The meeting PiP now has only two minimum-size states: 400 × 225 pixels for up to two active participants and 500 × 282 pixels for three or more. Larger meetings no longer keep increasing the minimum and taking over the available screen.

## Restore Whiteboard controller parsing

Meeting-frame and overlay DOM references now remain local to the Meetings surface instead of being redeclared from the Whiteboard capability payload. The browser can parse and load the controller again, and a direct JavaScript syntax regression check protects the entrypoint.

## Keep active-meeting drops on PiP

Starting a participant drag now reasserts the overlay parent for the currently active meeting window. When Whiteboard PiP is open, the green participant dropzone appears over the floating Jitsi frame; otherwise it remains over the normal meeting stage.

## Prioritize Jitsi screen sharing and unify Whiteboard visibility

Jitsi’s real-time local and remote screen-sharing participant event now closes the synchronized Whiteboard for everyone and disables reopening until sharing stops, returning the normal area to the conference. A backend capability check is now the shared Whiteboard visibility decision, so every account renders the same disabled control while browser providers initialize or hides it when the provider is unavailable.

## Stop automatic Whiteboard failure loops and expose diagnostics

Automatic account opening now waits for an already-unlocked keyring instead of attempting a browser-gated unlock without user activation. A single warning asks the user to select Whiteboard when interaction is required, and failed automatic mounting is not retried for the same board. Real failures now identify the failing stage in the toast and write structured identifiers, the error message, and the complete Error object to both the host log and browser console.

## Keep active-meeting overlays on their live window

Joining an existing meeting no longer lets participant rendering restore the lobby or preflight overlay. Overlay placement now detects the meeting frame’s actual floating parent rather than relying only on a local release callback, and participant dragging uses that relocated overlay directly so the green dropzone follows Whiteboard PiP.

## Bind and clean up the PiP participant dropzone

The participant target now detects Cognis’ actual `floating-window` class and resolves the current overlay and Jitsi frame from the live DOM before every transition, so it binds to the PiP element rather than the Whiteboard stage. Document-level drag-end and drop cleanup, plus Escape and window-blur handling, remove the target when a drag is cancelled.

## Reuse the meeting target, show core loading, and explain Whiteboard activation

Active-meeting participant dragging now reuses the existing meeting overlay and green target design without the additional dashed popup. Starting a meeting holds Cognis core’s shared page-loading wheel from the Start Meeting click through the completed Jitsi join attempt. The reported Whiteboard failure was traced to Cognis component-page spawn authorization: automatic account mounting without current browser activation now defers with a one-time action prompt instead of retrying an unauthorized spawn until it reports `whiteboard_component_window_unavailable`.

## Explain screen-share locks, resume Whiteboards, and approve active invitations

The disabled Whiteboard action now exposes a localized hover explanation while screen sharing owns the meeting surface. Synchronized account boards that encounter Cognis’ user-activation requirement now arm abort-safe input listeners and automatically resume on the next activation instead of requiring a Whiteboard-specific click. Active participant invitations request consensus through Share’s optional approval capability before mutation, reject explicit declines, and fail open with structured logs if approval infrastructure is unavailable.

## Start consensus on drop, roll back declines, and lock meeting switches

Active participant drops now optimistically update the participant pools and immediately issue the approval-backed API request. A declined vote restores the proposed participant to the available list and gives the inviter a dedicated localized rejection toast. The Active Meetings grid and its controls are now always disabled while the local user remains joined to a meeting.

## Use Share’s real approval flow and remove the duplicate PiP handle

When the direct Share approval capability is absent, active participant additions now run the existing Share mint approval stage, wait for its decision, and revoke the temporary token immediately, so current deployments no longer skip consensus. Whiteboard PiP no longer binds the meeting stage header as an extra movement controller alongside Cognis’ floating-window toolbar.

## Require final Share approval for active-meeting invitations

Active-meeting participant additions now require the declared `share:requestApproval` capability directly. Only an explicit final approval accepts the participant; declined, pending, or malformed decisions return the participant to the available list. Runtime failures remain fail-open and are logged, without any legacy mint-and-revoke compatibility path.

## Restore meeting teardown and avoid redundant Whiteboard expansion

Leaving or terminating a conference now runs one immediate teardown, restores the meeting overlay, clears participant selection, and awaits the active-meeting and available-participant refresh. Whiteboard access synchronization now treats the initial membership as already authorized and calls the expansion provider only after participants change, preventing repeated owner-only requests during polling.

## Secure meeting state and participant discovery

Participant discovery now verifies meeting access before excluding a meeting from active-presence filtering. Screen-sharing state uses its independent Meetings endpoint and is reset between meeting instances so stale locks cannot carry forward.

## Prioritize every attendee's screen sharing

Every authorized account participant or Share guest can report Jitsi's observed screen-sharing event. Any attendee's screen share therefore closes and locks the synchronized Whiteboard for the whole meeting until Jitsi reports that sharing stopped.

## Explain active participant approval requests

Active-meeting invitation approvals now tell Share which participant is being added and name the target meeting, so approvers see the concrete action and destination instead of generic share-link wording.

## Finish Whiteboard teardown before showing exit overlays

Leaving or terminating a meeting now closes the Whiteboard canvas, releases its picture-in-picture window, and restores the overlay to the Jitsi stage before disposing the conference. Meeting Closed and Meeting Left messages therefore appear in the normal stage.

## Keep staged invitations stable during refreshes

Participants optimistically moved into an active meeting now remain staged while the invitation request and periodic membership refreshes overlap. The pending marker is cleared when the server confirms membership or the invitation fails, preventing avatars from oscillating between the stage and available list.

## Initialize pending invitations after SPA navigation

The Meetings participant controller now initializes its pending-invitation set when each route mount binds the controller. SPA navigation can therefore safely mount Meetings even when the host retained state from an earlier module instance, without failing participant refreshes.

## Restore the closed-meeting overlay after PiP disposal

Whiteboard teardown now discards the component canvas before moving the meeting overlay back to the normal Jitsi stage. Component-page cleanup can no longer remove the restored overlay, so moderator termination from an open PiP shows the Meeting Closed message instead of an empty stage.

## Restore exit overlays into the live stage

Whiteboard component disposal can replace its stage wrapper, making previously captured DOM references stale. Exit cleanup now resolves the current meeting frame and stage wrapper from the mounted route before restoring the overlay, so Meeting Closed remains visible in the live composer surface after moderator termination.

## Restore the proven PiP exit sequence

Meeting exit teardown now matches the previously working sequence: the overlay returns to the stage before the floating Jitsi window is released, while Whiteboard component disposal continues asynchronously with structured failure logging. Closing the Jitsi embed and rendering Meeting Closed no longer wait for component-page disposal that can reclaim the stage DOM.

## Isolate the Whiteboard component from the meeting stage

The Whiteboard component now mounts into a dedicated host instead of taking ownership of the wrapper that also contains Jitsi and the meeting overlay. Discarding the component can no longer remove the Meeting Closed UI. PiP teardown hides and disposes only the Whiteboard host, then restores Jitsi and its overlay independently.

## Keep the meeting overlay in the stage layout

The pre-meeting and closed-meeting overlay is now a full-size grid item rather than an absolutely positioned child whose parent could collapse when Jitsi and Whiteboard were hidden. A protective Whiteboard shell adds another ownership boundary around the component host, preventing component cleanup from removing sibling meeting UI even when the host platform cleans a target's parent.

## Exclude the meeting stage from participant refreshes

Periodic available-participant refreshes now update only participant and active-meeting surfaces. They no longer rerender staged avatars or replace the stage message, so Meeting Closed and Left Meeting remain visible. Whiteboard disposal also triggers a final restoration from the retained overlay element and its last presentation state if host cleanup detached it.

## Keep overlay recovery compatible with SPA module caching

Post-Whiteboard overlay recovery now reuses the established `updateOverlay` utility directly instead of adding a new cross-module utility method. Mixed module instances during SPA navigation can no longer reject the cleanup promise with `restoreMeetingOverlay is not a function`, while current mounts still reapply the retained Meeting Closed or Left Meeting presentation.

## Prevent exit overlays from reacting to the next click

Meeting teardown now clears the active meeting before synchronizing Whiteboard controls. A deferred automatic Whiteboard opener can therefore no longer be rearmed during exit and consume the next click to hide the Meeting Closed or Meeting Left overlay.

## Restore the complete meeting stage after cleanup

Overlay recovery now retains and restores the complete meeting frame wrapper when component cleanup detaches it. The Meeting Closed or Meeting Left presentation therefore returns together with the stage after participant and active-meeting lists redraw.

## Keep active meeting resources synchronized

Persistent Whiteboards now confirm their full participant access on the first synchronization, so attendees invited after a meeting starts can open the existing canvas. Messages updates retain the meeting’s existing chat room while changing its membership for added and removed users, and the mini chat redraws from that room. Tests also lock the generated meeting name and URL to the persisted non-disposable meeting entity across membership changes.

## Restore the participant dropzone over PiP

The active-participant dropzone now switches from its normal stage grid placement to absolute inset positioning when it is moved inside the floating Jitsi frame. Dragging an available participant once again covers the complete PiP meeting window with the invitation target.

## Stop participant additions from failing during chat reuse

The participant-add API now reuses the meeting’s persisted Messages room directly instead of asking exact-member resolution to return that room and rejecting the different room it creates. The browser updates membership through the host Messages client, redraws the existing mini chat, and reports a localized error with structured diagnostics if chat membership cannot be changed.

## Keep meeting identity, chat, and Whiteboard membership aligned

The meeting module invokes the focused server-side Messages add-member or remove-member operation before committing the corresponding participant change. The persisted chat room ID never changes, clients only redraw that room, and Whiteboard expansion receives the same committed participant set. Schema initialization no longer regenerates stored meeting names, slugs, or URLs, removing the identity drift that separated Jitsi, Messages, and Whiteboard resources.

## Use focused Messages member operations

Meeting participant changes now call the simple `social:messages:addRoomMember` or `social:messages:removeRoomMember` capability for the meeting’s stored room. Room creation remains a separate one-time operation, the meeting keeps owning the room association, and no aggregate synchronization capability is required.

## Use the canonical Messages membership capability

Active meeting invitations and participant removals now use the unified `social:messages:membership` capability with canonical actor and user account IDs, matching the current Cognis Messages integration contract.

## Restore chat access when rejoining

Every authenticated meeting join now re-applies the idempotent Messages membership operation before loading chat. A participant who previously left or archived the meeting chat can therefore see it again after rejoining the meeting.

## Use canonical Whiteboard membership operations

Active participant additions and removals now update persistent canvases through `whiteboard:membership` with canonical organizer and participant account IDs before committing the meeting roster. The former browser-side aggregate access expansion is no longer used.

## Auto-approve invitations for a lone attendee

When no more than one participant is actively present, adding another participant now succeeds immediately instead of waiting for consensus from people who have already left. Meetings with multiple active attendees continue to use the Share approval decision.

## Stabilize notification joins and active-meeting locking

Consumed notification meeting parameters are now removed from the URL before joining, and the active-meetings section locks as soon as a meeting is selected, including notification entry paths. Meeting-ended notifications no longer include an action URL or an email meeting link.

## Delegate handle normalization to Profile identity

All server-side handle canonicalization now uses the public `social:profile:identity` capability. Meeting storage, access checks, participant discovery, Share orchestration, Whiteboard routes, and lifecycle operations no longer maintain or import module-owned normalization rules.

## Preserve directory-backed participant matching

Canonical Profile identity normalization is also applied when comparing directory-backed participant identifiers, preserving meeting access after a profile handle changes without reintroducing module-owned normalization.

## Poll active meetings without profile conflicts

Passive active-meeting discovery now returns a successful empty list when the authenticated account does not yet resolve to a usable profile handle. The resolution failure is logged with structured context while profile-dependent meeting operations continue to require a profile, preventing the periodic refresh from producing repeated 409 conflicts.

## Reliably detect active participant meetings

When current profile resolution does not provide a handle, active-meeting discovery now continues authorization with the authenticated account identity. This keeps every Cognis-active meeting visible when the account belongs to its stored participants, including meetings that retain an earlier profile handle.

## Commits

- [736ed26](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/736ed2651843b76e095f075a58b0ee7823128942)
- [b95fb10](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b95fb1027087f679a699ea807295f7b1286bb8b0)
- [0523439](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/05234396cd0e1bfc99075aecd9575291df1fab54)
- [ff60844](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ff6084469d7c8c18c631d6c59bac0b65fdf04b44)
- [0afee2e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/0afee2e9720010b6a2b5c8de256310dd77efd947)
- [3aa0da6](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3aa0da6b54b2bf66dd36e760630cf7c50d7a55b3)
- [a854724](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a8547244e698f6e3ef1c4b93d31531891a8edae2)
- [12de19a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/12de19a4fcf312a67e238efd23c0beb0ffe03d2e)
- [a47b5b4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a47b5b48340e023192dc88a1cbbc6f2c4ecb4587)
- [790401f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/790401f6d0c6714179d977e0d9384c59bc91f30c)
- [28774f3](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/28774f3df4a49adabc7e5470442e4cc087555e87)
- [4c26402](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/4c26402d1005c86a6f28eecc78883e447bb97c11)
- [206b29f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/206b29f70af70eab3d63d8dae871f182dc97f40a)
- [5f7683b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/5f7683b1c03719763333174cd6802bf4d33d37e9)
- [33eddd2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/33eddd2c63b80998f6d8e9ee44b6152c0080628f)
- [1386015](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1386015409eeb5bd252208dcdff27b809e4db00e)
- [eb8aef2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/eb8aef223aa633bcd302ee27dd934a63e92bcf78)
- [2d07b3b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2d07b3b6d0bd57563c83706f37c5dffcbf01f59f)
- [b88f6db](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b88f6db738e3bfad4ea1fd84ffecd2afe8bcb91f)
- [6a1e873](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6a1e873ff9454735dcbbcc0ed3290d7a446ac8b6)
- [cef74a0](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/cef74a09b02dfc3f50523dcadaf497488f9822ef)
- [812a79e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/812a79eb9960118a6addc5d17147e565db413639)
- [402045d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/402045d752ae3dcfd03497565a0c6bf70328ab66)
- [3b50f6d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3b50f6d1707d136ad222a615771e7a43d0289481)
- [cc022ac](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/cc022ace92fafd44941961ea8282b3f051c94f5e)
- [e65d307](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e65d3078012ebca12c5a0c5cda15235a8c216c96)
- [2a9cc59](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2a9cc59e8ad051da54ca7919de34fde15256fde9)
- [2d72282](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2d722820c4bd77d0c7ef6dd8991ec63c8ed11b52)
- [f6d7cdb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f6d7cdb9645e336a672b7749a7aab616b74b32d9)
- [b064315](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b0643159333c67f4117d5afc6fdbdcad9ba1b1ec)
- [c373996](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c37399694fa2c71da5ddda3f26133eebf5e985f2)
- [b8d6adb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b8d6adbd9c3aec0cf7e34e60233f804445f0baa5)
- [3c87494](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3c87494d228a96afa177602e3a3c7ae8e40d5c01)
- [8019153](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8019153c46dd027cc05b849a272327e3114a1c63)
- [d105cf3](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d105cf394e47fefc26c894d8ba0278e97b7f09b2)
- [0e5340a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/0e5340abd33d63446a5d6bf557748040c1e49fc7)
- [8c26ddf](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8c26ddf4ca40c8964c36e15ad43ef055a31c627b)
- [d18e4d2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d18e4d21b84c5f88898873bd83d74f3a74840e10)
- [6eb02e6](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6eb02e68d05d3bb907945a891232023f45908e89)
- [8454f05](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8454f05f4aab00b90e83f46c039a1a31a0b2ff72)
- [a243551](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a24355173a41a0c442dc624f54b7e22fd88b1313)
- [4514fab](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/4514fab46af476bda59562f58440bb0f19003ccf)
- [b778ee7](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b778ee7b3dd80dd15582ac7e982a1b435869236a)
- [3b6bda6](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3b6bda658696fdf143e042b6b14d8ff96d36b0dd)
- [e0e916f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e0e916f59892bc0c812451a359ca2b36e6864cff)
- [93727a1](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/93727a180bc1bdede576460b6d3bdf54dcae3604)
- [f7d14b3](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f7d14b3ccaef984bf26b51d4e82a96fe80d3077b)
- [d6f689a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d6f689a8d46f17897c4d1abf65f93673e99b4b30)

- [8665186](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/86651863fcf6af7736904af8c01f7cc89d5a45de)

- [59c24f4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/59c24f423c6f965dc02c97444c955c334cf4c7c5)
- [5675466](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/56754666a4937045764a6ab61dff35010e5c64f1)
- [3d93676](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3d93676af78496cbcd33ad943e7a62ca11553745)
- [a3e1cf2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a3e1cf2ccc718579c47d66551fe480a1727981b2)
- [483e085](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/483e0858f5afc6861ee502a816a770fa7f393290)
- [6c42f79](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6c42f79e0872703d785ac3b8e1143cd0fd68d077)
- [05be888](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/05be8883b9154da291ebf195c09d5048067ac026)
- [5288d1d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/5288d1d9cb3343ca92529ef66f35e55d6fb77c22)
- [d6fa13f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d6fa13fe33cc5e764127f0d83721ac0a549568cb)
