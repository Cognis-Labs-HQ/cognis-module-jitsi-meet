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

## Activate Whiteboard before preparing its canvas

The Whiteboard control now becomes interactive as soon as its browser and component-window providers are ready. Canvas creation starts only after activation, and an uncommitted canvas is reused across retries or remounts so a failed state synchronization does not create duplicates.

## Commits

- [9894d9e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/9894d9ee1130f3aff7144bd2e17adc72795e986a)
- [dccbd01](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/dccbd01cb316ab7d02708b4d43a56fea53f7b060)
- [1d99048](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1d990487c733d1d4e9db03b9e2ec54d0f04632d1)
