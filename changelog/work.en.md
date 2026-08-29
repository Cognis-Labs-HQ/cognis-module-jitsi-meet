# Share Guest Whiteboard Access

**Feature Branch:** work

## Authorize Meeting-Scoped Guest State

Whiteboard state updates now validate link-share guests through the Share gateway against the requested meeting and use the same stable synthetic identity as meeting presence for consensus votes.

## Reuse Host-Created Whiteboards

Link-share guests now use the meeting's existing Whiteboard mapping and wait for an authorized account or host to create one when no mapping exists.

## Expose Delegated Whiteboard Associations

Jitsi Meet now publishes `meetings:resolveWhiteboardAssociation`. It returns an active meeting only when the requested board exactly matches authoritative meeting state and the real Share guest claim is authorized for that meeting; missing, inactive, closed, ambiguous, and mismatched associations are denied.

## Commits

- [afbb29a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/afbb29a0276ea2f9a870b3f50429448a0db04a8c)
- [777e683](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/777e6839d246ceffe0d999227554c85da8b0f103)
