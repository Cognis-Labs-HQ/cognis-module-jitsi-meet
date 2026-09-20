# Align Jitsi Meet with the Scoped Module Runtime

**Feature Branch:** feature-align-module-with-structural-changes

## Use the Lifecycle-Scoped Context

Jitsi Meet now obtains capabilities and runs or extends host flows directly through its scoped module context. Share management, account cleanup, Whiteboard integration, configuration enablement checks, and provider hooks no longer depend on the private system context, so disable and re-enable cycles remain fully tracked by Cognis.

## Declare the Current Integration Contract

The manifest now keeps the module unprivileged, publishes its browser capability through the lifecycle-scoped provider catalog, uses Bootstrap as its sole runtime integration entrypoint, and synchronizes version 1.5.221 and all declared file digests. Structural tests cover the new boundary.

## Keep Inactive Overlay Controls Hidden

The meeting lobby now enforces HTML hidden-state behavior inside the module surface, preventing host button display rules from exposing authentication, reclaim, leave, or remain controls before their matching meeting state. The release version and integrity digests are synchronized at 1.5.221.

## Restore Nextcloud Whiteboard Discovery

Jitsi now resolves the server capabilities published by the current Nextcloud Whiteboard module. The availability endpoint recognizes the enabled provider again, restoring the meeting Whiteboard button as well as board verification, membership updates, and cleanup.

## Load the Dedicated UI Provider

Jitsi now declares `whiteboard:uiGateway` as an optional browser capability requirement. Cognis can therefore load the dedicated provider introduced by the latest Nextcloud Whiteboard changes before mounting Meetings, without relying on the Whiteboard navbar to initialize the canvas factory.

## Use Browser Provider Discovery for Visibility

After Cognis PR #222 made external capability-provider registration lifecycle-aware, the Meetings control now uses the loaded `whiteboard:uiGateway` directly instead of removing itself based on a separate backend availability request. The backend endpoint remains available for diagnostics.

## Use the Provider-Declared Whiteboard Contracts

Jitsi now resolves `whiteboard:fetchBoardData`, `whiteboard:membership`, and `whiteboard:deleteCanvas`, which are the capabilities declared by the current Nextcloud Whiteboard manifest. It no longer depends on the undeclared `whiteboard:api` implementation facade, restoring server verification and synchronized meeting Whiteboards.

## Initialize the Exposed Browser Runtime

Following Cognis PR #224, the Meetings browser entry imports the deployment-exposed `/static/reuse/ui-ctx.js` runtime resource so direct loads and refreshes initialize the same context as SPA navigation. Other browser utilities continue to resolve through `ui:reuse`; Jitsi now uses `ctx.registerCapabilityProvider` for `voip:startCall`, removes the redundant `meetings:isProviderAvailable` capability, and does not request privileged access.

## Keep the Whiteboard Integration Optional

Jitsi resolves Whiteboard verification, membership, and deletion capabilities only when the optional provider is enabled. These server capabilities no longer block Jitsi enablement, while `whiteboard:uiGateway` remains the browser-provider discovery contract.

## Declare the Database Runtime Dependency

Jitsi now declares `db:executor`, which its disabled configuration routes, enable test, and enabled meeting store all require. Cognis can initialize the database provider before registering `/config`, so configuration no longer falls back to HTTP 503 and enablement validation can run against the saved Jitsi URL.

## Keep Server Capabilities Module-Owned

The authenticated meeting-chat resolver is now published as `jitsi-meet:getMeetingChat`. Every capability contributed by Jitsi therefore remains in the module-owned namespace and passes Cognis boundary validation without privileged access.

## Update Saved Meetings After Account Deletion

When Cognis deletes an account, Jitsi now removes the account from both live and original participant records. Reusable meetings are re-keyed for the remaining saved roster, while meetings with fewer than two saved participants are deleted.

## Commits

- [7c8e314](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/7c8e31420c361f86e1d20a025e9ce4ffa23abb28)
- [6042833](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/60428332b3deae87b46d0c4eb125986b28426a8b)
- [055fd2a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/055fd2a7a760c5c29d1e5c9abe9d3956763712aa)
- [f20e6ae](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f20e6ae22b52b88b285b0d6388d5ca619f0bf7f0)

- [1e557a1](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1e557a1aa154d546f37276c86c77358583c8bef7)

- [e869c66](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e869c6682d4b2ff13db0a72afd6889c9aa5f282f)

- [2432bb4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2432bb4857744996c6cebb5e92eba8ac72cf490a)

- [6af5e9d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6af5e9d449b87a30616d01a4aa3cbd06754c3d16)

- [3e99028](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3e99028a46b22727d6a74c79be66307e2cdf689f)

- [a94d066](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a94d06602a508b05c7d5ce5a389212aa7a2a3ac8)

- [18feef0](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/18feef04c15884d664bfc838e565fd4de5505129)

- [34a9e73](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/34a9e730d6389aa4ba0fd49e4594f3219c47c7dd)

- [444c415](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/444c415532dc20a285123231368cf2c30e376f1a)

- [d8c7696](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d8c769663b694a244b402304b37047c5e3bea699)

- [33a2ecd](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/33a2ecdb02e84101247c48c7247b527a4863077f)
