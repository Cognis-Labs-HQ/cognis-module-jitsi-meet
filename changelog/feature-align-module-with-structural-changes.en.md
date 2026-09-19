# Align Jitsi Meet with the Scoped Module Runtime

**Feature Branch:** feature-align-module-with-structural-changes

## Use the Lifecycle-Scoped Context

Jitsi Meet now obtains capabilities and runs or extends host flows directly through its scoped module context. Share management, account cleanup, Whiteboard integration, configuration enablement checks, and provider hooks no longer depend on the private system context, so disable and re-enable cycles remain fully tracked by Cognis.

## Declare the Current Integration Contract

The manifest now identifies the trusted privileged integration required for host-owned meeting capabilities and flows, uses Bootstrap as its sole runtime integration entrypoint, and synchronizes version 1.5.212 and all declared file digests. Structural tests cover the new boundary.

## Keep Inactive Overlay Controls Hidden

The meeting lobby now enforces HTML hidden-state behavior inside the module surface, preventing host button display rules from exposing authentication, reclaim, leave, or remain controls before their matching meeting state. The release version and integrity digests are synchronized at 1.5.212.

## Restore Nextcloud Whiteboard Discovery

Jitsi now resolves the server capabilities published by the current Nextcloud Whiteboard module. The availability endpoint recognizes the enabled provider again, restoring the meeting Whiteboard button as well as board verification, membership updates, and cleanup.

## Load the Dedicated UI Provider

Jitsi now declares `whiteboard:uiGateway` as an optional browser capability requirement. Cognis can therefore load the dedicated provider introduced by the latest Nextcloud Whiteboard changes before mounting Meetings, without relying on the Whiteboard navbar to initialize the canvas factory.

## Use Browser Provider Discovery for Visibility

After Cognis PR #222 made external capability-provider registration lifecycle-aware, the Meetings control now uses the loaded `whiteboard:uiGateway` directly instead of removing itself based on a separate backend availability request. The backend endpoint remains available for diagnostics.

## Use the Unified Whiteboard Capability Namespace

Jitsi now resolves `whiteboard:fetchBoardData`, `whiteboard:membership`, and `whiteboard:deleteCanvas`, matching the latest Nextcloud Whiteboard provider contract. Server verification, participant membership, delegated access, and cleanup no longer request the superseded module-specific namespace.

## Commits

- [7c8e314](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/7c8e31420c361f86e1d20a025e9ce4ffa23abb28)
- [6042833](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/60428332b3deae87b46d0c4eb125986b28426a8b)
- [055fd2a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/055fd2a7a760c5c29d1e5c9abe9d3956763712aa)
- [f20e6ae](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f20e6ae22b52b88b285b0d6388d5ca619f0bf7f0)

- [1e557a1](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1e557a1aa154d546f37276c86c77358583c8bef7)
