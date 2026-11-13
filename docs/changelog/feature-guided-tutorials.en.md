# Guided tutorial

**Feature Branch:** feature-guided-tutorials

## Technical Specification

The play introduces meetings and staged participants without joining or creating a meeting. It requires an authenticated online session.

The module registers its own play and localized strings through ctx. The host owns the catalog, callouts, arrows, spotlight, keyboard and pointer controls, guarded SPA navigation and accessibility. Closing a tutorial, navigating away, losing access or disabling the module releases the session. Failed provider mounting rolls back its registrations.

Provider tests check the public contract, all four translations, availability rules, rollback and rejection of unsupported host versions.

## Page-bound First Visits

The host owns callouts, arrows, spotlight, accessibility and the shared floating action menu. First-time runs offer Next throughout, without Cancel or Skip. Replays offer Cancel with `btn-cancel`. Completion is stored per account in the browser. Navigation, access loss and provider removal release the session; failed mounts roll back registrations.

## Page Guides

Coverage includes meeting preparation, live call/chat/sharing controls, and administrator-only inspection and termination/deletion review.

## Descriptive Tutorial Keys

Tutorial step translation keys and target identifiers describe their subject instead of their position in the guide. The same keys are supplied in all four supported languages.

## Actionable Tutorial Copy

Tutorial steps focus on the controls and tasks available on the page, without unrelated reassurances about permissions or actions the guide does not perform.

## Author Next cues per step

Each tutorial step now explicitly declares `highlightNext`: explanations that require Next or Finish enable it, while interaction- and wait-driven exercises disable it. The cue retains a static outline for reduced motion.

Tutorial coverage is required for every UI-facing component. Contributor guidance requires user-first, task-focused walkthroughs and a review of existing tutorials whenever features or UI behavior change.

## Specific targets and branch replay

Meeting lifecycle explanations highlight the displayed Terminate or Delete control. The first usable target is selected inside the tutorial section and the step is skipped when no matching control is available.

## Visible tutorial regions

Tutorial regions and Next cues are authored explicitly.

## Shared floating-menu queue

Menus follow the shared queued host contract and component lifetime.

## Documented recovery controls

Missing-target views provide Next and Restart Tutorial; replay also provides Cancel.

## Remove Browser Demo Fixture

The standalone tutorial browser fixture is removed; automated provider and module tests remain in place.

## Intentional tutorial guidance

Tutorials explain distinct visible controls in UI order. Shared guidance covers active-view discovery, stable examples, empty states, conditional branches and lifecycle cleanup. Replay controls and reduced-motion documentation match the shared host.

## Focused Walkthrough

The meeting guide highlights the full Participants panel first and the Available Participants section at its participant-selection stage.

## Optional Meeting Chat

The meeting-chat stage is omitted from the path and count while chat is unavailable.

## Consistent Translation Catalogs

Translation keys use lowercase period-delimited words throughout the module metadata and tutorials. Catalog entries retain their original translated values and match the surrounding XML indentation. Strict namespace checks reject hyphens and underscores in translation keys. Module IDs, UUIDs, capabilities and tutorial completion identities remain unchanged.

## Lobby And Live-call Availability

The preparation guide is available only while the lobby is rendered and no meeting embed is active. Direct meeting links do not offer lobby-only targets. Leaving the call restores the lobby guide. The live guide uses the module route root as its shared boundary, with a separate visible-meeting condition, so the frame wrapper, sharing actions and optional chat remain reachable. Disabled or hidden chat is excluded from the path and count.

## Commits

- [2ca1e32](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2ca1e3292d5c02ae229f8a5652b40929b0272219)
- [d051ae2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d051ae21ab8a123834e74ef86d24e14809d77e4b)
- [15730bd](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/15730bdfee1eb85b53cc208310add93bf7a14704)
- [f9a767f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f9a767f19179e0e1b5bfbf981bd634d2e2d684f9)
- [6678445](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/66784457b47bd835d947f862890365272f5d6e16)
- [2fada40](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2fada407ffe66e9590f037ce6f500e5a5e2cd158)
- [1235d37](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1235d37629580ae9bdde13c07520a783a1c81949)
- [dcf444a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/dcf444aafe4e88fc1d5b21064c6356013c8e3900)
- [e422908](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e4229088d211facd06d3464ee1e578f4eda7a8b7)
- [986caf0e7](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/986caf0e74d203cb5b86092892fbdb75871853bd)
- [b7c4f6886](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b7c4f68864ea21dee0150186c1509e428df28a7b)
- [2e99cf649](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2e99cf649345992d41f19a9179c83153b6dfabd6)
- [d6f10af07](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d6f10af071009f75e9f52526a01d59cb6987714c)
- [8fb4477](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8fb44771d4d49011b5bb8640b655ddbe8f8af659)
- [3af9784](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3af97840da865d05998e80898c788d202ce12383)
