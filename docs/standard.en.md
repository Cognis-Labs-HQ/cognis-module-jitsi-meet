# Jitsi Meet Module

The Jitsi Meet module provides Cognis-native meeting orchestration with participant selection, reusable meeting rooms, session reclaim, Messages chat integration, and an optional shared Whiteboard.

## Usage Examples

- Join or reclaim meetings from `/meetings` and `/meeting` without full-page navigation.
- Select participants, share meeting access, and use the meeting's Messages chat.
- Monitor active and upcoming meetings from Administration → Meetings.
- Embed the Meetings route as an overlay, fullscreen, or picture-in-picture component page.

## Technical Specification

- API calls require a valid Cognis access token, and meeting details are returned only to authorized participants or scoped share guests.
- Meeting passwords are generated per meeting record. Meeting display names are unique four-word phrases without a product prefix; the same name identifies the Whiteboard and the undated Messages chat. Participant-free disposable meetings do not create Messages chats, and any previously associated chat is permanently deleted when the meeting ends.
- Module-owned persistence stores meeting configuration, participants, presence, lifecycle state, Whiteboard state, and consensus votes.
- Session reclaim disconnects the user's previous active meeting session.

### Integration Contract

- `bootstrap.js` is the sole platform entrypoint, and ctx capabilities and flows are the only cross-component integration surface.
- The Meetings SPA uses the Cognis router and page composer. Embedded callers pass a serializable `meetingId` in `focusState`; embedded mounts are frameless and do not duplicate host navigation.
- Browser utilities and the complete common stylesheet catalog are loaded through the required `ui:reuse` capability before the Meetings surface is rendered. Cognis core supplies standard control presentation, while module CSS owns only Jitsi-specific layout.
- The optional Whiteboard integration is exposed when the base `whiteboard:uiGateway` canvas factory, component-page, and floating-window capabilities are available; optional persistent-canvas and participant-save methods enhance the integration without controlling button visibility. Only participant-free meetings use a disposable canvas. Meetings with invited participants use a persistent resource canvas, save its mapping for every participant, and automatically open the mapped canvas when the meeting loads.
- The organizer can open the Whiteboard immediately. Other participants require a strict majority of currently present non-organizer participants. The open state is persisted so current and later participants automatically open the same canvas and move the meeting into picture-in-picture.
- Before a Whiteboard component opens, Meetings requests keyring access in the parent page so any unlock challenge has a popup host. Whiteboards then spawn through the component-page broker as embedded overlay components with document-owned scrolling. Meetings scopes the borderless appearance to its Whiteboard stage and removes that local state synchronously when the component closes, so SPA navigation cannot leave the shared page shell borderless.
- The Whiteboard control is a standard `<button>` matching the adjacent Share control. It uses core `btn-neutral` presentation by default and the same accent-backed `active` marker as selected navigation items together with `btn-confirm` while active, and its label changes to “Close Whiteboard”. Selecting the active control closes it for the meeting. If preparation or mounting fails, Meetings logs the failure, displays “Error loading whiteboard,” and disables the control for that browser mount so polling cannot repeatedly retry it. Refreshing or navigating away and back creates a new mount and permits another attempt.
