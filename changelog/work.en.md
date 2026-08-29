# Share Guest Whiteboard Access

**Feature Branch:** work

## Authorize Meeting-Scoped Guest State

Whiteboard state updates now validate link-share guests through the Share gateway against the requested meeting and use the same stable synthetic identity as meeting presence for consensus votes.

## Reuse Host-Created Whiteboards

Link-share guests now use the meeting's existing Whiteboard mapping and wait for an authorized account or host to create one when no mapping exists.

## Commits

- [52ed541](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/52ed541e59bb4dac0ef6736e184061da4c533790)
