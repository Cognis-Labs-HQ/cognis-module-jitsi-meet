# Guided tutorial

This module binds its introductory play to its own page through `ui:tutorials`. The first permitted visit starts it automatically; the question-mark SVG beside the page title replays it. The host must provide the version-one page-bound tutorial contract.

## Usage Examples

The play introduces meetings and staged participants without joining or creating a meeting. It requires an authenticated online session.

## Technical Specification

The host owns callouts, arrows, spotlight, accessibility and the shared floating action menu. First-time runs offer Next throughout, without Cancel or Skip. Replays offer Cancel with `btn-cancel`. Completion is stored per account in the browser. Navigation, access loss and provider removal release the session; failed mounts roll back registrations.

The play is informational and never performs a privileged action. Missing targets allow Next during the first run and Retry or Cancel on replay.

Provider tests check the public contract, all four translations, availability rules, rollback and rejection of unsupported host versions.

Coverage includes meeting preparation, live call/chat/sharing controls, and administrator-only inspection and termination/deletion review.

Each tutorial step now explicitly declares `highlightNext`: explanations that require Next or Finish enable it, while interaction- and wait-driven exercises disable it. The cue retains a static outline for reduced motion.

Meeting lifecycle explanations highlight the displayed Terminate or Delete control. The first usable target is selected inside the tutorial section and the step is skipped when no matching control is available.
