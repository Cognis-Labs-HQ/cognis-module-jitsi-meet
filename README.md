# Jitsi Meet Module

This repository contains the external Jitsi Meet module for Cognis. It provides video meeting creation, joining, moderation, participant management, meeting chat integration, and scoped guest sharing.

## Installation

Add this repository through **Modules → Module Sources** in Cognis, install the module, review its requested capabilities and dependencies, and then enable it separately. Configure the Jitsi instance URL from the module's Administration controls.

## Capabilities and dependencies

The module publishes `meeting:video`, `meeting:chat`, and `meeting:moderation`. Runtime integrations are resolved through Cognis `ctx` capabilities and flows. Its UUID-based requirements are listed in `manifest.json`; no Cognis internal package or source-tree import is required.

## Development

Run `npm install` followed by `npm test`. Tests and runtime code use only repository-relative module paths so the suite runs outside the Cognis monorepo.

## Security

Use a trusted HTTPS Jitsi deployment. Meeting API access is authenticated, meeting records are participant-gated, passwords are generated per meeting, and guest access is restricted by scoped share capabilities. Review the repository and its declared file digests before enabling it.
