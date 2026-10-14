# Align Jitsi Meet with Cognis Contracts

**Feature Branch:** feature-align-module-with-structural-changes

## Use scoped ctx and executed action flows

Bootstrap obtains external services only through the lifecycle-scoped ctx and contributes module-owned routes, providers, capabilities and hooks. Enabled store operations execute named `jitsi-meet:*` flows with `initialize-store` and `execute-action` stages; internal operations retain their existing transaction. Authorization precedes routed actions, and incomplete runners fail rather than silently bypassing work. Disabled configuration uses the restricted lifecycle entrypoint because Cognis does not register module flows while disabled.

## Keep meeting and conversation identities stable

Saved meetings retain distinct chat rooms, enforced by current schema constraints and provider-owned source bindings; disposable-call reservations prevent competing calls.

## Respect the optional Whiteboard provider

The optional browser canvas factory is discovered after host initialization, while the server resolves the provider-declared Whiteboard capabilities dynamically. Activation verifies availability before creating a canvas. Guests follow an existing mapping without creating one. Concurrent preparation shares a pending factory call, retries reuse uncommitted results, provider replacement isolates the cache, and cancelled window retries stop before spawning again. Membership and mapping verification use canonical account identities.

## Reuse cleanup and reject stale UI work

Account deletion updates saved rosters or cleans external resources before deleting unusable meetings. Final departure and account cleanup reuse owner-authorized resource deletion, and all meeting-row cleanup includes call reservations through one catalog. Shared abortable delays release their listeners on completion and cancellation. Polling checks mount lifetime, request order and meeting identity before applying results, including ended or reclaimed responses.

## Preserve host presentation and conference sessions

Meetings uses host page composer, router, profile previews, controls, overlays and floating-window behavior. Hidden-state rules target Jitsi-owned controls and surfaces. Empty meeting responses complete the initial loading state. Whiteboard mounting retains keyring authorization and synchronized screen-sharing locks. Jitsi authentication-session cleanup preserves other browser preferences and permits browsers that deny storage access to continue joining.

## Publish one synchronized release contract

Module 1.5.250 synchronizes package versions and SHA-256 inventory. Standard documentation describes current supported behavior in German, English, Indonesian and Japanese. This PR uses one changelog set with consolidated implementation links. Behavioral tests cover scoped action execution, permission denial, cancelled retries, concurrent canvases and stale responses alongside structural isolation checks.

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

## Preserve the full-size alone prompt

Restore the original heading, disabled Start button and preflight indicator in the main-window alone prompt. Restrict the compact presentation to PiP so its minimum size remains free of vertical scrolling. Browser checks verify the full-size controls before floating and their restoration on release.

## Unique meeting conversations

Restore unique chat-room IDs. Request distinct saved-meeting chats and resolve a saved room by its ID after participant changes; replace a deleted room through Messages. Preserve transactional call reservations and rollback conflicts.

## Template structure and scoped cleanup

Place route handlers in domain directories, styles and reusable markup in their own UI directories, and release notes under docs/changelog. Adopt template contributor guidance and camel-case action flows. Complete browser provider, health and keyring cleanup; keyring reset clears delivery receipts while preserving meetings and canvases.

## Developer contracts and command scope

Document current public interfaces in all four languages. Distinguish checkout-local npm scripts from modules-prefixed operational commands. Replace the misleading provider-minimum label with tested-release diagnostics; availability remains capability-based. Use Chromium/CDP regression checks without Playwright.

## Retain valid meeting owners and optional presentation

Remove the obsolete raw component-page spawn requirement; the optional Whiteboard gateway owns page creation. Account deletion transfers retained meetings to a surviving organizer without changing their chat-room identity. Guides describe public contracts without release numbers; the synchronized release is 1.5.250.

## Cognis and provider artwork

Replace the marketplace banner with a Cognis + provider composition, keeping its branding within the central visible band and preserving the existing icon.

## Consistent marketplace descriptions

Use short action summaries and concrete feature descriptions across marketplace metadata, keeping localized meanings aligned.

## Meeting administration and recovery

Release 1.5.251 adds administration recovery for conflicting meeting references.

Administration → Meetings offers Active, All meetings and Issues pill filters. The admin-only listing reads existing meeting records without requiring schema initialization, flags duplicate participant sets and URLs plus shared chat-room/canvas references, and never exposes passwords. Terminate ends Cognis presence and closes the meeting for connected Cognis clients; it does not claim to administer an independently joined Jitsi conference. Active meetings must be terminated before deletion. Delete removes meeting-owned records and shares, deleting a chat room or canvas only when no other meeting references it. Cleanup failures retain the meeting record for retry; already absent resources permit cleanup to continue. Deleting duplicate references clears cached uniqueness failures so ordinary schema initialization can retry. Non-admin routes retain normal schema enforcement. Meeting discovery stops automatic polling on a failed response and reports the failure instead of repeatedly retrying it.

## Exclusive integration source bindings

Meeting chats declare `source: {sourceType: "meeting", sourceId: meeting.id}` through the Messages resolver. Canvas activation claims the same identity through `whiteboard:sourceBinding`. Provider-owned claims reject competing meeting bindings; Jitsi never edits their binding columns. Administration deletion releases only the deleted meeting’s binding when another historical reference survives. Messages-initiated call cleanup releases its source claim while retaining the source conversation. Creating a new call rolls back its meeting record if chat binding fails. Messages source binding is required; Whiteboard remains optional and is available only when its source-binding contract exists.

## Scoped browser actions and authoritative administration

Configuration and enablement initialize only the configuration table, so meeting integrity failures do not prevent enabling the module and opening administration recovery. Administration initializes only the auxiliary participant-history table needed for inspection; it preserves meeting constraints.

## Readable meeting administration

Meeting lists share one panel with space between Active and Upcoming sections. Meeting names, IDs and expandable chat/canvas references stay together; compact issue pills leave room for participants, activity and actions. Filter buttons use the host neutral control without positional hover movement. Upcoming lists only inactive, unended meetings with a valid future schedule; elapsed, missing and invalid schedules remain available in All meetings.

Release 1.5.252 — administration layout and schedule filtering.

## Meeting-owned canvas persistence

Release 1.5.253 — Persistent meetings use `createCanvas`; only meetings explicitly marked disposable use `createDisposableCanvas`. Participant counts and changing invitation lists do not change canvas persistence. Saved matching canvas mappings are reused when reopening a meeting.

## Stable meeting canvas identifiers

Release 1.5.254 — Jitsi supplies the meeting UUID as `resourceId` and `meeting` as `resourceType`; the display name is only the title. Reopening the same meeting requests the same generic provider reference, even after its name changes. Whiteboard owns persistence, access checks and concurrent reference resolution without knowledge of Jitsi internals.

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
- [ed255e0](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ed255e0ff54d332cd92dc1781d11a3009be14f68)
- [1b064f2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1b064f20fef5a6c239a7772a24913b370c445332)
- [daabd62](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/daabd620f48c797c05df6171576fb2e33c1d8849)
- [f47348f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f47348f871886d8fa72ca0e8fa1c0e6a126357ed)
- [202c527](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/202c527a84226b8beea541a3902136d8be2a9384)
- [adb2cb2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/adb2cb2af083776f91d58ce963cf565fe96ffb3b)
- [2abb9b4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2abb9b447b81299f68ecf92a02cf935efe33c1df)
- [3318f35](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3318f352bff2c16c79688dde53cfaa3c737c21ee)
