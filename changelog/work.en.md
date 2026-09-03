# Messages video calls with disposable Jitsi meetings

**Feature Branch:** work

## Start restricted calls from Messages

Jitsi Meet now supplies the browser VoIP provider used by direct and group chats. Calls include only the initiating room's members and create no separate meeting chat.

## Keep calls disposable and focused

Messages calls cannot be shared, extended with more participants, or connected to a Whiteboard. Returning to Messages preserves the live meeting in a movable picture-in-picture window, and the meeting record is deleted when the call ends.

## Provider available on initial render

The navbar registration now advertises `voip:startCall`, allowing Cognis to load Jitsi before Messages checks provider availability and to display the video-camera action on the first chat render.

## Commits

- [39f6fde](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/39f6fde4a0a48b73f1ff77259ae47ea15c125049)
- [4800983](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/4800983502abcdd530a34419f6fe8ae6ead042f1)
