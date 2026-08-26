# Jitsi Meet Module

The Jitsi Meet module provides Cognis-native meeting orchestration with participant selection, reusable meeting rooms, session reclaim, Messages chat integration, and an optional shared Whiteboard.

## Usage Examples

- Join or reclaim meetings from `/meetings` and `/meeting` without full-page navigation.
- Select participants, share meeting access, and use the meeting's Messages chat.
- Monitor active and upcoming meetings from Administration → Meetings.
- Embed the Meetings route as an overlay, fullscreen, or picture-in-picture component page.

## Technical Specification

- API calls require a valid Cognis access token, and meeting details are returned only to authorized participants or scoped share guests.
- Meeting passwords are generated per meeting record. Meeting display names include the generated Jitsi room slug; the same name identifies its Whiteboard and prefixes its dated Messages chat title.
- Module-owned persistence stores meeting configuration, participants, presence, lifecycle state, Whiteboard state, and consensus votes.
- Session reclaim disconnects the user's previous active meeting session.

### Integration Contract

- `bootstrap.js` is the sole platform entrypoint, and ctx capabilities and flows are the only cross-component integration surface.
- The Meetings SPA uses the Cognis router and page composer. Embedded callers pass a serializable `meetingId` in `focusState`; embedded mounts are frameless and do not duplicate host navigation.
- Browser utilities and reusable styles are obtained through the required `ui:reuse` capability. The core page-builder supplies standard control presentation, while module CSS owns only Jitsi-specific layout.
- The optional Whiteboard integration is exposed only when `whiteboard:uiGateway`, component-page, and floating-window capabilities are available. Participant meetings use a persistent resource canvas; participant-free meetings use a disposable canvas.
- The organizer can open the Whiteboard immediately. Other participants require a strict majority of currently present non-organizer participants. The open state is persisted so current and later participants automatically open the same canvas and move the meeting into picture-in-picture.
- Whiteboards spawn through the component-page broker as borderless overlay components. Cognis core owns component-window containment, borderless stage state, cleanup, and PiP positioning; Meetings relaxes its stage clipping only while the broker's borderless state is active.
- Selecting the active Whiteboard control closes it for the meeting. If preparation or mounting fails, Meetings logs the failure, displays “Error loading whiteboard,” and disables the control for that browser mount so polling cannot repeatedly retry it. Refreshing or navigating away and back creates a new mount and permits another attempt.
