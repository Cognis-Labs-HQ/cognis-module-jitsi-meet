# Share Guest Whiteboard Access

**Feature Branch:** work

## Authorize Meeting-Scoped Guest State

Whiteboard state updates now validate link-share guests through the Share gateway against the requested meeting and use the same stable synthetic identity as meeting presence for consensus votes.

## Reuse Host-Created Whiteboards

Link-share guests now use the meeting's existing Whiteboard mapping and wait for an authorized account or host to create one when no mapping exists.

## Use Generic Share Delegation

Jitsi Meet now extends `resolve-share-delegated-access` instead of publishing a Whiteboard-specific capability. It proves the exact active meeting-to-board relationship and declares `meeting:join` as the source permission while Share independently validates the guest token.

## Split Oversized Modules

Moved schema creation and credential backfill into a focused store-schema module, split the UI regression coverage into two cohesive test files, and restored normal whitespace between declarations and methods.

## Commits

- [afbb29a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/afbb29a0276ea2f9a870b3f50429448a0db04a8c)
- [777e683](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/777e6839d246ceffe0d999227554c85da8b0f103)
- [88e72f2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/88e72f2b8ceb38fd137d22d97ab2749bc4a1e2bb)
- [c0f05fb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c0f05fb22382b2f18b2ecbacee654a6007944b78)
- [3583bce](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3583bce288b495d3d44f1efe049063f267c82ad3)
- [18fb935](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/18fb935e94e6819bc4884599f80f7a07a9d24fc7)
