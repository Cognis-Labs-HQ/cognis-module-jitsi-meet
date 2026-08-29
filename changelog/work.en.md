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

## Enable Safe Guest Whiteboard Controls

Share views now mount the Whiteboard control and authenticate state requests with the scoped guest token. The API permits guests to open or close only the exact canvas already mapped to their meeting and rejects mapping creation or replacement. Guest orchestration no longer requires the account-only canvas factory, so remote open state reaches component spawning and moves the meeting into its floating picture-in-picture presentation. Component-window mounting now uses a longer bounded exponential-backoff retry so organizers can recover when an invited participant opens the board before the organizer’s provider window is ready. Limited guest mounts now pass their routed share token into identity resolution and skip account profile and participant-search requests, preventing account-only profile 404 responses from blocking meeting joins. Guest keyring resolution remains available for meeting passwords, chat, and Whiteboards. The actual freeze was an unbounded microtask loop: an unmapped guest canvas preparation returned immediately and its completion recursively scheduled the same preparation. Guests now wait for a mapped board to arrive through synchronized meeting state without scheduling canvas creation.

## Commits

- [afbb29a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/afbb29a0276ea2f9a870b3f50429448a0db04a8c)
- [777e683](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/777e6839d246ceffe0d999227554c85da8b0f103)
- [88e72f2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/88e72f2b8ceb38fd137d22d97ab2749bc4a1e2bb)
- [c0f05fb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c0f05fb22382b2f18b2ecbacee654a6007944b78)
- [3583bce](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3583bce288b495d3d44f1efe049063f267c82ad3)
- [18fb935](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/18fb935e94e6819bc4884599f80f7a07a9d24fc7)
- [91c689d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/91c689df7e719ec03fc207c82d283510362d69c8)
- [54caf84](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/54caf840c8578bca200e7d9c897bc62413547cff)
- [2512c1f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2512c1fcb45ffe494b0c6945edea7031d303b5b8)
- [78f8ba7](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/78f8ba77509b5f104ae076d7d98840865791a312)
- [53a9f98](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/53a9f9870c3a8a0ca546e8da6e33b9dc4f861db7)
- [ce6c974](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ce6c9744f96ea5613e11efbcd12fe771ca49afd3)
- [39a4794](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/39a4794771a7c673ee9c92fba37e9fdf9ba9a449)
