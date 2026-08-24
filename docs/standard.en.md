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
- Session reclaim allows a user to disconnect their previous active session.

### Integration Contract

- `bootstrap.js` is the only module entrypoint consumed by the platform.
- The bootstrap ctx is the only integration bus for this module (API routes, UI registration, capabilities, and future CLI/DB wiring).
- Direct imports from other modules or core internals are forbidden; integration must happen via ctx-provided surfaces.
- Component-page callers pass a serializable `meetingId` in `focusState`; the embedded mount stays inside the supplied root and uses a frameless composer without duplicating the host navigation.
- Meeting termination detection includes Jitsi `conference.destroyed` failures, the post-call Start Meeting action is immediately restored, and the embedded toolbar omits participant, performance, and background controls.
- When the optional Nextcloud Whiteboard browser capability `whiteboard:uiGateway` is active, the meeting stage exposes a synchronized disposable whiteboard component window and keeps the uninterrupted meeting in picture-in-picture until the whiteboard is closed.
- Background whiteboard restoration passes the provider share context and suppresses repeated action-error toasts after a failed automatic mount.
