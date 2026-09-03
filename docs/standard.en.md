# Jitsi Meet Module

The Jitsi Meet module provides Cognis-native meeting orchestration with participant selection, reusable meeting rooms, session reclaim, Messages chat integration, and an optional shared Whiteboard.

Messages resolves Jitsi’s `voip:startCall` provider separately for each direct or group chat. Jitsi validates the room request with its authenticated API. If the room already references a meeting, it returns a same-origin `navigate` action for that meeting. Otherwise it creates one disposable meeting for the supplied room members and returns a host-owned `component` action for the Meetings route in overlay mode. Unsupported requests return `null`.

Cognis owns the temporary component stage and its cleanup. Jitsi does not alter the Messages DOM or invoke the component-page broker itself. After the component mounts, Back to messages preserves the live meeting and changes its window to picture-in-picture. Disposable calls use unique participant keys, create no meeting chat, and cannot be shared, extended with participants, or connected to a Whiteboard.

The navbar provider metadata lets Cognis load the provider before Messages performs its initial availability check, so the video-camera action is present on the first chat render.

## Usage Examples

- Join or reclaim meetings from `/meetings` and `/meeting` without full-page navigation.
- Select participants, share meeting access, and use the meeting's Messages chat.

Users who are actively present in another meeting are omitted from participant discovery and cannot be dragged into an active meeting; a scheduled invitation alone does not make a user unavailable.

Available participants and active meetings refresh every five seconds, including availability indicators after SPA navigation.

The participant finder passes Cognis core’s `user` result filter, and the active-meetings list appears only in the initial overlay directly above Start Meeting.

Notification meeting parameters are removed from the URL as soon as they are consumed.

Window focus changes without an active participant drag preserve the current overlay presentation, so an idle lobby remains startable.

The active-meetings section is locked whenever a meeting is selected or joined, including notification joins, and meeting-ended notifications contain no action or email link.

The Participants pane keeps available known users in a vertically scrollable 30% column and shows horizontally scrollable persistent-meeting cards in the remaining 70%; each card centers its stable name, arranges up to ten standard profile avatars around it, and uses a moving app-green border segment while that meeting is active.

Cards are compact clickable controls: selecting one restores its participant set to the stage and scrolls there so Start Meeting reuses the stable meeting; holding a card for three seconds changes its green tint to red and opens a confirmation that removes the current user, permanently deleting the meeting, chat room, and mapped Whiteboard after the final member leaves.

Previous Meeting cards size themselves to their title and wrapped avatar rows without creating vertical overflow.

Active status is drawn only as a moving segment along the card border, while a removal hold begins blending a constant-opacity green-to-red gradient immediately.

The confirmation uses destructive and neutral button treatments, and a completed departure is reported as informational feedback.

Find Participants is represented by a question-mark profile avatar at the start of Available Participants.

The shared Participants heading remains above both columns so the Available Participants and Previous Meetings titles are aligned.

The content-height gallery suppresses vertical overflow, and its removal hold uses a reliably animated constant-opacity gradient from the first pointer-down frame.

The Participants heading retains its natural inherited text height with zero outer heading margin; the pane allocates it independently while the participant layout flexes into the remaining parent space without being compressed by a forced heading size.

Previous Meetings remains horizontally scrollable by pointer, touch, wheel, and keyboard while its scrollbar track is visually suppressed.

A staged participant can be returned to Available Participants by clicking outside their profile link or dragging them back.

If a Previous Meeting selection is changed, Start Meeting creates a fresh room instead of loading a stable meeting name for the changed participant set.

The Find Participants avatar is hidden together with the empty pool when no available participant exists.

The active Previous Meeting indicator uses a thicker, longer, brighter green segment with a stronger glow and faster circuit around the card.

Releasing the pointer anywhere ends an unfinished participant drag and closes its stage dropzone.

Previous Meetings shows only one card for each canonical participant set, preferring the active room, so repeatedly expanding the same roster does not accumulate duplicate history cards.

The original participant set is recorded separately from live membership: Previous Meetings continues to represent that stable roster, and starting it reuses the same meeting ID and encrypted chat history even after participants were added to or removed from the live meeting.

Selecting a meeting in Previous Meetings or Active Meetings applies the selected treatment to its matching card in both sections.

Any authorized meeting participant can recreate a missing associated Messages room, and the replacement room ID is saved before chat loading resumes.

Disposable single-account meetings are excluded from Previous Meetings; only persistent meetings with an original or current multi-account roster are shown there.

Auto-share prompting is limited to a newly created empty stage; a stage populated from Previous Meetings or Active Meetings is treated as occupied even when it contains no participant other than the current account.

While a conference is joined, Previous Meetings is inert, greyed out, uses a prohibited cursor, and does not hydrate profile previews, while active-card animation continues.

Previous Meetings uses the same opacity-style blocked treatment as Active Meetings, without grayscale filtering; a transparent interaction shield owns the prohibited cursor so it remains visible across the complete card area.

- During an active non-disposable meeting, drag another available user into the meeting window to add them permanently to its participant set.

Cognis provisions their encrypted Messages chat access through the `social:messages:membership` capability using canonical actor and user account IDs, sends an invitation, and lets them claim the meeting password when joining.

Every authenticated join re-applies the idempotent membership operation before the chat is loaded, restoring access when a participant previously left or archived that meeting chat.

Participant refreshes never cover an active meeting with the lobby overlay, and an empty available-participant pool is identified explicitly.

Dragging an available user while a meeting is active reveals a localized drop target with exactly the embedded window bounds.

The target moves above the embed for the drag and returns below it after a drop or drag end.

A persistent green inset outline and dashed target remain visible for the entire participant drag.

When only one attendee is actively present, a new participant invitation is approved immediately without requesting consensus from absent participants.

Successful active invitations show a toast, update the existing encrypted chat room membership through the Messages API and redraw that same chat during state polling, and update an existing persistent Whiteboard through `whiteboard:membership` with canonical actor and user account IDs.

The meeting API completes the existing-room membership update before committing the meeting participant change, so clients never switch room IDs.

When Jitsi reports that the local attendee was kicked, authenticated users are removed from the stored participant set and become available for a new invitation; a kicked guest’s specific Share link is revoked.

All server-side username and handle canonicalization is delegated to the public `social:profile:identity` capability with the capability passed explicitly to each normalization call; the module does not maintain its own normalization rules.

Chatroom cleanup uses the public `social:messages:deleteChatroom` capability with `roomId` and canonical `actorAccountId`; Messages authorizes the room creator or its sole remaining participant and transactionally removes dependent chat records.

During meeting teardown, a referenced Whiteboard or chatroom that reports a standard not-found status, code, or message is treated as already deleted; the fallback is logged with structured resource metadata and cleanup proceeds to the remaining resources and meeting record.

The latest Messages integration exposes deletion as a flow-backed public capability; Jitsi declares `social:messages:deleteChatroom` as required and validates that it resolves to a callable function during API registration, failing early instead of surfacing a late cleanup error.

When the organizer expands an active meeting, the owner client also re-synchronizes the complete participant set through the Whiteboard UI gateway.

A non-organizer opening request uses Share approval so every other active account participant receives the consensus decision instead of relying only on passive state votes.

A submitted Whiteboard approval request produces an informational toast.

When a meeting owner leaves before the other members, their chat membership is removed while ownership metadata is retained; the final remaining member therefore deletes the chat as its authorized sole participant.

Opening a persistent meeting Whiteboard synchronizes its membership with both listed and currently present account participants before the canvas is exposed.

After sending a meeting or private message, the extracted interaction binder invokes the mounted chat refresh callback so the new message appears without a scope error.

Page-composer renders only bind interaction listeners; they do not invoke the chat updater during route mount, and post-send refresh uses a guaranteed wrapper that logs an unavailable chat operation instead of rejecting the SPA mount.

The stage and Messages composer elements retain matching five-row defaults and minimum sizes, occupy the complete twelve-column composer row with an eight-to-four split, and use a fresh layout preference so the malformed saved layout is not restored.

Whiteboard control discovery does not require every participant to expose canvas-creation methods; once the backend confirms the provider, mapped canvases can be mounted consistently for all meeting members.

Whiteboard mounting no longer applies a second signed-in-user canvas-factory gate after capability discovery, so one user connecting cannot make the control disappear for another participant.

- The Whiteboard action uses the confirm treatment while opening is available and switches to the cancel treatment while it reads “Close Whiteboard.” When Jitsi reports any local or remote screen-sharing participant, the shared Whiteboard closes for everyone and remains disabled until screen sharing stops. When the meeting moves into PiP for a Whiteboard, meeting overlays—including the active-participant dropzone—move into that floating surface and return to the stage when PiP closes. Each participant drag reasserts the current overlay host before showing the target, and a target moved into the floating Jitsi frame uses absolute inset bounds so it continues to cover the complete PiP window.
- Monitor active and upcoming meetings from Administration → Meetings.
- Embed the Meetings route as an overlay, fullscreen, or picture-in-picture component page.

The advertised picture-in-picture minimum is 400 × 225 pixels, 25% larger than Jitsi Meet's 320 × 180 smallest supported mobile surface. While the meeting is floating, the third active participant increases both minimum dimensions once by 25%, to 500 × 282 pixels; additional participants do not increase it further, and the module applies the single change through the host floating-window release handle.

## Technical Specification

- API calls require a valid Cognis access token, and meeting details are returned only to authorized participants or scoped share guests.

Active-meeting discovery authorizes participant membership through the authenticated account identity even when the account has no currently resolvable profile handle, so every Cognis-active meeting containing that participant remains visible while profile-dependent meeting operations remain unavailable.

Limited share mounts resolve identity only through the Share guest profile and never query account profile or participant-search endpoints.

Guest joins retain keyring resolution for the meeting password and encrypted chat.

A guest without an existing Whiteboard mapping waits for synchronized meeting state without repeatedly scheduling no-op canvas preparation.

- Meeting passwords are generated per meeting record.

Meeting names are four-word, title-cased passphrases generated through the host `reuse:generatePassphrase` capability.

The same hyphen-separated name is stored as the display name and Jitsi room slug, included in the meeting URL, and always passed explicitly to `JitsiMeetExternalAPI`; the module never asks Jitsi to generate or report a room name.

Schema initialization never regenerates or rewrites an existing meeting name, URL, or room slug.

The name is also propagated to meeting lists, Messages chats, shares, and Whiteboards.

Persistent meetings are resolved by their complete normalized participant set and reuse the same stored meeting ID, name, URL, room slug, password, and Messages room across process restarts, including after active membership changes.

Participant-free meetings are disposable, always receive a new identity and single-member Messages chat, and permanently delete both the chat and meeting record when they end.

The authenticated configuration `DELETE` endpoint remains available while the module is disabled so administrators can clear an invalid Jitsi URL.

- Module-owned persistence stores meeting configuration, participants, presence, lifecycle state, Whiteboard state, and consensus votes. Fresh-install schema initialization is serialized per database executor so simultaneous lifecycle and configuration requests cannot race while creating PostgreSQL tables. Schema creation and credential backfill live in a focused store-schema module, while the main store retains meeting, state, and presence operations.
- Session reclaim disconnects the user's previous active meeting session.

### Integration Contract

- `bootstrap.js` is the sole platform entrypoint, and ctx capabilities and flows are the only cross-component integration surface.
- Every routed, shared, and embedded Meetings mount claims `.jitsi-route-root` only while its lifecycle signal is active. An already-aborted mount never claims the persistent Cognis app root, and aborting an active mount removes the class and disposes module-owned observers, event handlers, timers, and embedded meeting work.
- The Meetings SPA uses the Cognis router and page composer. Embedded callers pass a serializable `meetingId` in `focusState`; embedded mounts are frameless and do not duplicate host navigation.
- Browser utilities and the complete common stylesheet catalog are loaded through the required `ui:reuse` capability before the Meetings surface is rendered. Meeting-frame and overlay elements are resolved from the module DOM and are never read from the Whiteboard provider capability payload. Cognis core supplies standard control presentation, while the module loads no provider-owned stylesheets and scopes every module CSS selector beneath `.jitsi-route-root`. Dead legacy meeting styles are not shipped.
- Nextcloud Whiteboard is declared as a soft module dependency so administrators can select it during installation without making it required.

A module-owned backend availability endpoint is the single visibility decision for every account client; browser capability discovery only initializes an already-approved control.

The optional integration is exposed when the base `whiteboard:uiGateway` canvas factory, component-page, and floating-window capabilities are available; the meeting API resolves the mapped canvas’s actual owner and invokes the owner-authorized `whiteboard:membership` `add` and `remove` functions with canonical account IDs before committing participant changes; the persistent `createCanvas` method from the provider contract creates normal canvases with the invited participant handles, while only participant-free meetings use `createDisposableCanvas`.

Meetings never fall back from persistent to disposable creation; before accepting or delegating a mapping, they resolve the provider at request time through the scoped or system ctx capability surface and verify its identity, meeting title, and (for new mappings) creator, save the mapping type, replace unknown or mismatched legacy mappings, and reuse the verified persistent canvas only when a user deliberately opens it.

Link-share guests receive non-interactive Whiteboard orchestration without a visible control or canvas-creation capability, follow the organizer’s synchronized open and close state, and reuse only the exact existing meeting mapping, and never invoke canvas creation or replace that mapping; their meeting-scoped Share identity authorizes synchronized state and supplies a stable identity for presence and consensus voting.

The module extends the generic `resolve-share-delegated-access` flow so Share can verify an exact, currently open meeting-to-board relationship.

Jitsi declares delegated Whiteboard read and write operations and the required `meeting:join` source capability; Share independently validates the original guest token.

- The organizer can open the Whiteboard immediately. Other participants require a strict majority of currently present non-organizer participants. The open state is synchronized only for the current meeting session so current participants open the same canvas and move the meeting into picture-in-picture. Ending the meeting clears that state; a persistent canvas mapping never opens merely because a new meeting session starts.
- Before a Whiteboard component opens, Meetings requests keyring access in the parent page so any unlock challenge has a popup host. Whiteboards then spawn through the component-page broker as embedded overlay components with document-owned scrolling. Meetings relies on the imported component-page and button classes instead of adding presentation classes or overriding the shared page shell.
- The Whiteboard control is a standard `<button>` matching the adjacent Share control.

It uses core `btn-confirm` presentation by default and the imported `active` and `btn-cancel` states while active, and its label changes to “Close Whiteboard”.

Selecting the active control closes it for the meeting.

Provider capabilities are loaded once through the host before Whiteboard preparation, and transient component-window mounting failures use a bounded exponential-backoff retry without re-registering or replacing the component page.

While an unlock prompt or component mount is pending, the control remains disabled with its normal “Whiteboard” label; it changes to “Close Whiteboard” only after the component window is mounted.

Stale work cancelled by meeting state or navigation changes is discarded without an error toast.

Synchronized automatic opening proceeds during current browser activation; otherwise signal-scoped input listeners resume it on the next activation so the keyring request and component spawn remain browser-authorized.

A failed automatic attempt is not repeated for the same board.

Every actual failure writes its stage, meeting and board identifiers, error message, and full Error object to both the host logger and browser console, while the localized toast identifies the failed stage.

- Active-meeting lobby rendering never reopens the preflight overlay after a meeting record has been selected. When the meeting frame has the host-owned `floating-window` state for Whiteboard picture-in-picture, meeting overlays and the participant invitation dropzone are resolved from the live DOM and reparented to that floating frame, then return to the normal stage when picture-in-picture closes. Cancelling a drag through drag end, a drop outside the target, Escape, or loss of window focus always removes the dropzone.
- Active participant invitation dragging reuses the normal meeting overlay structure and green active-target outline instead of rendering a separate popup. Starting a new meeting acquires Cognis core’s `beginPageLoading()` token from the module-provided `ui:reuse` page-entry resource before preflight or creation work and releases it only after the Jitsi join attempt completes. Because Cognis component-page spawning requires current browser user activation, synchronized account Whiteboards defer automatic mounting until the next browser activation rather than exhausting retries with `whiteboard_component_window_unavailable`.
- While Jitsi screen sharing locks Whiteboard access, the disabled Whiteboard control and its slot expose a localized hover title explaining the lock. A synchronized account Whiteboard that lacks current browser activation arms signal-scoped pointer and keyboard listeners and automatically continues mounting on the next user activation; closing the board or aborting the mount removes those listeners. Adding a participant to an active meeting requires Share’s `share:requestApproval` capability and proceeds only after an explicit final approval. Declines and incomplete decisions reject the addition, while runtime approval failures fail closed with structured error logging.
- Dropping an available user into an active meeting optimistically removes that user from availability and immediately starts the server-side Share consensus request. An explicit decline restores the user to the sorted available pool and shows the inviter a localized rejection toast; other request failures perform the same rollback with the generic failure toast. While the local user is joined to any meeting, the entire Active Meetings grid is marked disabled, every meeting button is disabled, and click handling refuses meeting switches until the current meeting ends.
- Whiteboard PiP delegates movement to Cognis’ host-owned floating-window toolbar. The module no longer supplies `.jitsi-stage-header` as a second drag handle when calling `ui:makeFloatingWindow`.
- Conference exit events are coalesced into one teardown. The meeting frame and Whiteboard close immediately, the meeting chat polling timer and room identity are cleared before any redraw, the normal overlay is restored, participant selection is cleared, and active meetings plus available participants finish refreshing before teardown completes. Persistent Whiteboard access expansion confirms the complete current membership with the provider on its first synchronization and repeats that expansion whenever membership changes.
