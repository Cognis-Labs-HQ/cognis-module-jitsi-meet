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

## Commits

- [3bd6d6a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3bd6d6a16b4b495f91dbf1f7e55e7aa86d1381fd)
- [b68432b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b68432b0f3db343ef0db7d706aeaad5000063e96)
