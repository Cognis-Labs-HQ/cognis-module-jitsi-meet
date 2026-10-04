# Stabilize meeting lists, Whiteboard integration, and account cleanup

**Feature Branch:** work

## Complete initial meeting-list rendering

Successful empty active and persisted meeting responses now replace their loading presentations, so accounts without meetings see the correct empty state immediately.

## Respect optional Whiteboard availability

The meeting toolbar now stays hidden when the browser Whiteboard canvas factory is unavailable. Server-side verification continues to use the stable `whiteboard:` capabilities published by the latest Nextcloud Whiteboard module, preventing unavailable providers from reaching state synchronization.

## Clean up resources before deleting meetings

Account deprovisioning now deletes mapped Whiteboards, Messages chatrooms, and meeting shares before removing an unusable meeting from storage, with structured failure logging and owner-authorized capability calls.

## Document lifecycle-scoped integration

All supported documentation now describes Whiteboard capability resolution exclusively through the lifecycle-scoped module context.

## Verify both Whiteboard integration surfaces before canvas creation

Meeting Whiteboards now confirm that the browser exposes the correct canvas factory for the meeting type and that the server exposes the provider verification capability before creating a canvas. This preserves PiP initialization when the complete provider contract is available while preventing failed launches from leaving duplicate canvases behind.

## Commits

- [9894d9e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/9894d9ee1130f3aff7144bd2e17adc72795e986a)
- [dccbd01](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/dccbd01cb316ab7d02708b4d43a56fea53f7b060)
