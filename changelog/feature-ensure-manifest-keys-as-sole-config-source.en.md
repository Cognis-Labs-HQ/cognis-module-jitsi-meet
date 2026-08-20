# Contribution Standards

## Core guidance alignment

Repository contribution instructions now include the applicable architecture, security, UI, testing, localization, versioning, and quality requirements from the main Cognis repository.

## Standalone scope

Monorepo-only directory, Docker, gateway, adapter, Study, and central registry rules are explicitly excluded while their relevant architectural principles remain in force.

## Repository compliance

JavaScript formatting now follows Cognis' four-space Prettier configuration, authenticated routes authorize callers before initializing persistence, and list APIs no longer impose undeclared server-side result caps. The Cognis formatting, readability, and ambiguous-name checks now run locally. Intentional fallbacks are logged with structured context, and meeting session identifiers require Web Crypto.

## Release note isolation

Module changelogs now live outside `docs/` so Cognis documentation discovery does not present release notes as module documentation.
