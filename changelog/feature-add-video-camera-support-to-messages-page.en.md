# Messages video calls with disposable Jitsi meetings

**Feature Branch:** feature-add-video-camera-support-to-messages-page

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

## Simplify embedded call chrome and identify VoIP calls

Component-window meetings now hide the “Meeting Window” header together with the overlay and no longer add a Back to messages button. Messages supplies “Cognis VoIP Call” as the Jitsi meeting subject through component metadata, while regular meetings retain “Cognis Classroom.”

## Close component windows when calls end

After a component-mounted meeting finishes teardown because the participant leaves, is kicked, or the conference terminates, Jitsi now discards the containing host component window. Full Meetings-page sessions remain open.

## Commits

- [cc6a92c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/cc6a92c0054168293a38133b4e520d50bd8344c2)
- [1e4b462](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1e4b46262d54f5cd87adb9f138535cf465c06251)
