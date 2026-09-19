# Align Jitsi Meet with the Scoped Module Runtime

**Feature Branch:** feature-align-module-with-structural-changes

## Use the Lifecycle-Scoped Context

Jitsi Meet now obtains capabilities and runs or extends host flows directly through its scoped module context. Share management, account cleanup, Whiteboard integration, configuration enablement checks, and provider hooks no longer depend on the private system context, so disable and re-enable cycles remain fully tracked by Cognis.

## Declare the Current Integration Contract

The manifest now identifies the trusted privileged integration required for host-owned meeting capabilities and flows, uses Bootstrap as its sole runtime integration entrypoint, and synchronizes version 1.5.208 and all declared file digests. Structural tests cover the new boundary.

## Keep Inactive Overlay Controls Hidden

The meeting lobby now enforces HTML hidden-state behavior inside the module surface, preventing host button display rules from exposing authentication, reclaim, leave, or remain controls before their matching meeting state. The release version and integrity digests are synchronized at 1.5.208.

## Restore Nextcloud Whiteboard Discovery

Jitsi now resolves the namespaced server capabilities published by the current Nextcloud Whiteboard module. The availability endpoint recognizes the enabled provider again, restoring the meeting Whiteboard button as well as board verification, membership updates, and cleanup.

## Wait for Provider Enablement

The Meetings client now retries the backend Whiteboard availability decision with bounded exponential backoff. A provider completing its capability registration while the page mounts can therefore populate the Whiteboard control instead of leaving its slot permanently empty.

## Commits

- [17491e9](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/17491e947e3c67ebd030080bf619df59b1e2775f)
- [c7ac761](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c7ac7619266b446dff0101b80ab7a95afbab3174)
- [a77d961](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a77d961bb5180a245430205e9347db4b2d66b009)
