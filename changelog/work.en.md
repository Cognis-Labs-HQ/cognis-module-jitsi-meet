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

## Commits

- [15f072f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/15f072fa11c997d9c427c4fb01c132068eeb73ec)
- [c4612ac](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c4612ac89019f9643fefbd41b79cfb8c30797fc6)
