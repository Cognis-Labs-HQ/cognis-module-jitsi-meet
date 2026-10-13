# Align Jitsi Meet with Cognis Contracts

**Feature Branch:** feature-align-module-with-structural-changes

## Use scoped ctx and executed action flows

Bootstrap obtains external services only through the lifecycle-scoped ctx and contributes module-owned routes, providers, capabilities and hooks. Enabled store operations execute named `jitsi-meet:*` flows with `initialize-store` and `execute-action` stages; internal operations retain their existing transaction. Authorization precedes routed actions, and incomplete runners fail rather than silently bypassing work. Disabled configuration uses the restricted lifecycle entrypoint because Cognis does not register module flows while disabled.

## Keep meeting and conversation identities stable

Persistent meetings retain their normalized original participant set, room identity and password across membership changes and restarts. Saved meetings may share a Messages room; separate disposable-call reservations prevent competing calls without imposing uniqueness on historical chat references. Reservations and meeting changes remain transactional. Presence expires after missed heartbeats, and ended meetings exclude residual presence.

## Respect the optional Whiteboard provider

The optional browser canvas factory is discovered after host initialization, while the server resolves the provider-declared Whiteboard capabilities dynamically. Activation verifies availability before creating a canvas. Guests follow an existing mapping without creating one. Concurrent preparation shares a pending factory call, retries reuse uncommitted results, provider replacement isolates the cache, and cancelled window retries stop before spawning again. Membership and mapping verification use canonical account identities.

## Reuse cleanup and reject stale UI work

Account deletion updates saved rosters or cleans external resources before deleting unusable meetings. Final departure and account cleanup reuse owner-authorized resource deletion, and all meeting-row cleanup includes call reservations through one catalog. Shared abortable delays release their listeners on completion and cancellation. Polling checks mount lifetime, request order and meeting identity before applying results, including ended or reclaimed responses.

## Preserve host presentation and conference sessions

Meetings uses host page composer, router, profile previews, controls, overlays and floating-window behavior. Hidden-state rules target Jitsi-owned controls and surfaces. Empty meeting responses complete the initial loading state. Whiteboard mounting retains keyring authorization and synchronized screen-sharing locks. Jitsi authentication-session cleanup preserves other browser preferences and permits browsers that deny storage access to continue joining.

## Publish one synchronized release contract

Module 1.5.242 synchronizes package versions and SHA-256 inventory. Standard documentation describes current supported behavior in German, English, Indonesian and Japanese. This PR uses one changelog set with consolidated implementation links. Behavioral tests cover scoped action execution, permission denial, cancelled retries, concurrent canvases and stale responses alongside structural isolation checks.

## Restore Whiteboard access before automatic opening

Joining an active meeting restores the authorized account’s membership in its open persistent Whiteboard before returning the join payload, independently of chat selection. Automatic account opening runs `jitsi-meet:follow-whiteboard` to verify the exact open mapping, grant owner-authorized membership and confirm the mapping again before mounting. Following never starts another approval vote or changes open state; a closed or replaced board cancels quietly. Link guests retain delegated access, and closed mappings do not make the optional provider a join dependency.

## Public presentation contract

Jitsi uses the public gateway methods `requestCanvasPage({signal})` and `openCanvas({whiteboardId, elementId, signal})`. The Whiteboard provider owns its route IDs, canvas layout, transport and session semantics. Jitsi supplies only the exact board ID and its own mount target; it releases the returned window on teardown. Presentation requires Whiteboard 2.3.147 or newer. Membership changes use the server-owned public membership contract.

## Explain unavailable Whiteboard controls

An enabled Whiteboard provider with an incomplete public UI contract leaves a disabled control with an explanatory tooltip and logs the missing capability methods. A failed provider load is also explained. An absent optional provider omits the control. Avatar availability is independent of Whiteboard readiness; a profile availability 404 does not disable it.

## Protect meeting transitions and restore persistent canvases

Meeting selection stays locked while loading, resolving a keyring, awaiting authentication or reclaim, and throughout an embedded conference. Join requests share their pending operation; cancellation and stale responses cannot replace the current target. Active discovery includes authorized invited meetings with current presence while authentication is pending. Restarting a persistent meeting restores its saved canvas through the public owner-authorized membership contract. An unavailable or deleted optional canvas is logged and leaves the meeting join available.

## Bound the meeting component mount

Jitsi bounds its embedded component host to the meeting viewport and stretches the mounted root into a definite grid row. This keeps contained provider surfaces visible without letting their intrinsic size expand the meeting window. Chromium regression coverage uses the actual meeting markup in standards mode, checking opening and resizing. The integration remains independent of Whiteboard rendering internals.

## Keep live meeting overlays in PiP

Meeting status updates resolve the overlay from its active window rather than pulling a portal-mounted overlay back into the main page. Buttons, messages and preflight indicators are updated and rebound inside that overlay; floating frames remain valid live embeds during composer refreshes. The PiP frame retains the module style scope, and the overlay covers the frame with absolute positioning. Closing PiP restores the original scope and placement. Behavioral tests cover status updates outside the page root and Chromium checks the floating overlay bounds.

## Restore the original overlay presentation

PiP uses the existing floating-window options to keep the meeting in its original DOM ancestry while displaying it in the browser top layer. This preserves inherited theme and typography without adding a new route scope. The native popover inherits the frame foreground. The alone prompt displays its message and Leave/Remain actions, without the initial title, participant selection, Start button or preflight status. Browser tests compare normal and PiP appearance, confirm zero vertical overflow at the existing minimum size, and verify that returning to the initial state restores its controls. The original floating-window handle retains minimum-size updates.

## Commits

- [7c8e3142](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/7c8e31420c361f86e1d20a025e9ce4ffa23abb28)
- [60428332](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/60428332b3deae87b46d0c4eb125986b28426a8b)
- [055fd2a7](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/055fd2a7a760c5c29d1e5c9abe9d3956763712aa)
- [f20e6ae2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f20e6ae22b52b88b285b0d6388d5ca619f0bf7f0)
- [1e557a1a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1e557a1aa154d546f37276c86c77358583c8bef7)
- [e869c668](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e869c6682d4b2ff13db0a72afd6889c9aa5f282f)
- [2432bb48](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2432bb4857744996c6cebb5e92eba8ac72cf490a)
- [6af5e9d4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6af5e9d449b87a30616d01a4aa3cbd06754c3d16)
- [3e99028a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3e99028a46b22727d6a74c79be66307e2cdf689f)
- [a94d0660](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a94d06602a508b05c7d5ce5a389212aa7a2a3ac8)
- [18feef04](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/18feef04c15884d664bfc838e565fd4de5505129)
- [34a9e730](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/34a9e730d6389aa4ba0fd49e4594f3219c47c7dd)
- [444c4155](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/444c415532dc20a285123231368cf2c30e376f1a)
- [d8c76966](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d8c769663b694a244b402304b37047c5e3bea699)
- [33a2ecdb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/33a2ecdb02e84101247c48c7247b527a4863077f)
- [09c93f4d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/09c93f4d5bb52cff518455cda7494ca302cb3b7f)
- [bce5f43f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/bce5f43fef2cc079f596771553e947adc2a77e28)
- [d0ed7631](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d0ed763193e09ee5807ff0ffa89718f45b65ffbb)
- [b864da0c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b864da0c1388c35000b8f21117ab7b52340f13a8)
- [c69fa5fc](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c69fa5fc53db518779c9ac7905cc2919d4911aae)
- [8e79fd7d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8e79fd7d77cc8857bb1482f245ea9aa56a7afeb7)
- [de197326](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/de19732675ee9d054088787f8710adfc96c809ce)
- [82899c91](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/82899c9148162acd33805632d5ce0d749e40ba6c)
- [9894d9ee](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/9894d9ee1130f3aff7144bd2e17adc72795e986a)
- [dccbd01c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/dccbd01cb316ab7d02708b4d43a56fea53f7b060)
- [1d990487](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1d990487c733d1d4e9db03b9e2ec54d0f04632d1)
- [561ab35f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/561ab35f41d807651f2ec5c28b5ab43eda928305)
- [30603f26](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/30603f2679ed778ee2a3467de9d18b4932445836)
- [736abfbf](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/736abfbf2a8579b7c6961755ad26cb6446a54cac)
- [04158e4a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/04158e4a2da493d1413d5bbb7f580e0066cac468)
- [e8042612](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e8042612c8e55a549db7aa32cbc8ab9e0d1cdd04)
- [6bd01f73](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6bd01f73b330f9d69169a81693325f3c89d445da)
- [b26fc491](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b26fc4912e6d48c8b31c18b474af3b2fd625b642)
- [65f51269](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/65f5126935c0e9f0ed63e89def8110589b88edde)
- [b1311b8d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b1311b8d637806ae49c5b96067c4627cd6f182e5)
- [8d709449](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8d70944999fb802c5b776d1760d370d45696c427)

- [1e6f727](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1e6f7271ff3b1fece3c748f71b10d502c7351aa8)

- [a1bceaa](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a1bceaa85535892a60cc3f3203d265a87e0b136e)

- [f129d7d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f129d7d1fea5518b657e7bd88991c3c5e96ee029)
