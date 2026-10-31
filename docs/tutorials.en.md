# Guided tutorial

The account menu lists this module’s introductory play when its UI provider is enabled and the current account has access. The host must provide the version-one `ui:tutorials` contract.

## Usage Examples

The play introduces meetings and staged participants without joining or creating a meeting. It requires an authenticated online session.

## Technical Specification

The module registers its own play and localized strings through ctx. The host owns the catalog, callouts, arrows, spotlight, keyboard and pointer controls, guarded SPA navigation and accessibility. Closing a tutorial, navigating away, losing access or disabling the module releases the session. Failed provider mounting rolls back its registrations.

The play is informational. It does not create accounts, change configuration, send messages, accept agreements or start calls. Targets resolve only unambiguous elements; missing content offers retry and cancellation.

Provider tests check the public contract, all four translations, availability rules, rollback and rejection of unsupported host versions.
