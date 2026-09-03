# Messages video calls with disposable Jitsi meetings

**Feature Branch:** work

## Start restricted calls from Messages

Jitsi Meet now supplies the browser VoIP provider used by direct and group chats. Calls include only the initiating room's members and create no separate meeting chat.

## Keep calls disposable and focused

Messages calls cannot be shared, extended with more participants, or connected to a Whiteboard. Returning to Messages preserves the live meeting in a movable picture-in-picture window, and the meeting record is deleted when the call ends.

## Provider available on initial render

The navbar registration now advertises `voip:startCall`, allowing Cognis to load Jitsi before Messages checks provider availability and to display the video-camera action on the first chat render.

## Room-aware host-owned call actions

Jitsi now resolves each room request to a normalized `component` action instead of creating and mounting a stage itself. Cognis Messages owns component spawning, cleanup, and launch feedback under the latest provider contract.

## Reuse meeting rooms and create collision-free calls

Each VoIP capability request now checks both meeting chatrooms and disposable-call source rooms. Existing meetings return a router redirect; unmatched rooms create one disposable component meeting with a unique participant key, preventing database constraint failures.

## Keep disposable calls embedded and hidden from Meetings

Rooms mapped to disposable calls now continue returning component actions instead of redirects, while only regular meeting chatrooms navigate to Meetings. Disposable calls are excluded from active meeting discovery as well as previous meeting history.

## Hide the meeting overlay in component windows

Meetings mounted through the component-page contract now suppress the meeting overlay for the component lifecycle, leaving the embedded call frame unobstructed while retaining the normal overlay on full Meetings pages.

## Commits

- [790fa2d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/790fa2d660b5f6a0c46cc3d18058790444867329)
- [3bf5559](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3bf5559f3f68dd9a57a56c5d1818e5fa931cacc9)
