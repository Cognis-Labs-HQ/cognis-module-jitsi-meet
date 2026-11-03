# Guided tutorial

This module binds its introductory play to its own page through `ui:tutorials`. The first permitted visit starts it automatically; the question-mark SVG beside the page title replays it. The host must provide the version-one page-bound tutorial contract.

## Usage Examples

The play introduces meetings and staged participants without joining or creating a meeting. It requires an authenticated online session.

## Technical Specification

The host owns callouts, arrows, spotlight, accessibility and the shared floating action menu. First-time runs offer Next throughout, without Cancel or Skip. Replays offer Cancel with `btn-cancel`. Completion is stored per account in the browser. Navigation, access loss and provider removal release the session; failed mounts roll back registrations.

The play is informational and never performs a privileged action. Missing targets allow Next during the first run and Retry or Cancel on replay.

Provider tests check the public contract, all four translations, availability rules, rollback and rejection of unsupported host versions.
