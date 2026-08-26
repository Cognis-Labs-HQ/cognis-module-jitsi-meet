# Jitsi Meet Module

The Jitsi Meet module provides Cognis-native meeting orchestration with participant selection, meeting URL reuse, session reclaim, and Messages chat-room reuse.

## Usage Examples

- Configurable Jitsi instance URL and optional URI prefix rendered by Cognis from the manifest and persisted by the module-owned config endpoint
- `/meetings` and `/meeting` application routes with:
    - a page-scoped availability check that stops immediately after navigation away
    - meeting stage/overlay
    - participant selection and drag-and-drop
    - chat URL handoff to Messages adapter
- Meeting persistence in module-owned tables
- Participant-gated API access by username
- Classroom fallback participant authorization when `classroom_id` is set
- Active meeting monitoring section in Administration → Meetings
- UUID-based dependencies on the Social gateway, Profile adapter, Share gateway, and Messages adapter, plus capability-based `auth:requireAuth` and `ui:profileAvatarRenderer` runtime requirements
- An explicitly eligible Meetings component page, resolved by this module's immutable UUID and `module.jitsi.meet.meetings` route ID, with overlay, fullscreen, and picture-in-picture presentation modes

## Technical Specification

- API calls require a valid Cognis access token.
- Meeting details are only returned to allowed participants.
- Meeting passwords are generated per meeting record.
- Each meeting name includes its generated Jitsi room slug. The same unique name is passed to its Whiteboard, and its Messages chat title combines that name with the creation date.
- Session reclaim allows a user to disconnect their previous active session.

### Integration Contract

- `bootstrap.js` is the only module entrypoint consumed by the platform.
- The bootstrap ctx is the only integration bus for this module (API routes, UI registration, capabilities, and future CLI/DB wiring).
- Direct imports from other modules or core internals are forbidden; integration must happen via ctx-provided surfaces.
- Component-page callers pass a serializable `meetingId` in `focusState`; the embedded mount stays inside the supplied root and uses a frameless composer without duplicating the host navigation.
- Meeting termination detection includes Jitsi `conference.destroyed` failures, the post-call Start Meeting action is immediately restored, and the embedded toolbar omits participant, performance, and background controls.
- When the optional Nextcloud Whiteboard browser capability `whiteboard:uiGateway` is active, the meeting stage exposes a synchronized whiteboard component window that is persistent for participant meetings and disposable for participant-free meetings and keeps the uninterrupted meeting in picture-in-picture until the whiteboard is closed.
- Whiteboard availability is discovered without mounting UI. A user click invokes `component-pages:spawn` with the meeting-stage element ID, and the returned handle is discarded when the window closes or the meeting page unmounts.
- An opened Whiteboard remains mounted until the meeting closes or the highlighted Whiteboard button is selected again. Meetings with invited participants retain their resource-keyed canvas ID across later instances, while participant-free meetings remain disposable; provider loading and canvas preparation are repeated safely when SPA navigation changes the selected meeting.
- If the Whiteboard gateway is absent from a cached provider catalog, Meetings forces one provider-catalog refresh before hiding the integration. Window teardown uses the broker handle or stage-scoped discard fallback; global `component-pages:discardAll` remains owned by the Cognis SPA shell.
- Provider readiness is retried during SPA mounts, and each rendered meeting stage receives a collision-resistant destination ID so parked or stale DOM cannot capture a new component window. Whiteboards request overlay presentation rather than fullscreen presentation.
- The spawned Whiteboard requests the core component-window `borderless` contract and frameless rendering. The meeting stage responds directly to the broker-owned `component-page-stage` state by overriding its normal clipped overflow and fixed fill height, allowing the borderless component window to determine the stage height.
- Meetings activates the Cognis core floating-window capability before mounting the Whiteboard component page, so picture-in-picture remains visible throughout asynchronous component startup without module-owned positioning or styling.
- Whiteboard open state is stored only after the optional Whiteboard provider has supplied a canvas ID. The organizer may open it immediately; otherwise a strict majority of currently present non-organizer participants must request it. Once open, state polling automatically opens the same canvas for current and future meeting participants and moves their meeting into picture-in-picture. Starting or reclaiming the Jitsi instance preserves this per-meeting state; explicit meeting termination closes it. Initial loads and five-second state refreshes use the same public `whiteboardOpen` state shape.
