# AI Instructions for Jitsi Meet

These instructions are the module-relevant subset of the Cognis repository guidance. They apply to this entire repository.

## Session startup

Before exploring, implementing, linting, or testing, run:

```sh
pip install ripgrep
npm install
```

Use `rg` rather than recursive `grep` for searches.

## External module contract

This repository delivers exactly one external Cognis module. Keep these files at the repository root:

- `manifest.json`
- `package.json`
- `routes.json`
- `bootstrap.js`
- declared API, UI, and CLI entrypoints

Preserve the module UUID permanently. The readable ID may change, but the UUID must never be replaced, transferred, or reused. Every `requires` value must be a component UUID.

The module version must be bumped for every change. The versions in `manifest.json`, `package.json`, and `package-lock.json` must remain synchronized. Keep `package.json` configured with `"type": "module"`, keep `routes.json` as an array, and ensure every declared entrypoint and asset is a regular repository-relative file with exact filename casing.

Keep repository, homepage, and support metadata pointed at this project. After the final file change, regenerate every SHA-256 digest in `manifest.files`. Do not include `manifest.json` in its own digest list. Verify all declared digests before committing.

Do not add generated secrets. Keep store artwork and screenshots free of credentials and personal data. Document requested capabilities and review new dependencies carefully.

## Component isolation and ctx

`bootstrap.js` is the sole system integration entrypoint. It may import repository-local files, but runtime code and tests must not import Cognis source-tree internals, sibling components, or private package implementations.

Treat `ctx` as the complete cross-component bus:

- Obtain external behavior through `ctx` capabilities.
- Register exported behavior through capabilities and named flow stages.
- Detect optional components by checking their capabilities.
- Extend existing flows instead of importing or editing another component.
- Keep flow hooks removable so disabling the module cleanly removes its behavior.
- Pass authentication, authorization, request, and persistence helpers into route handlers through a ctx-derived route context.
- Return a disposer from `bootstrapModule` or export `teardownModule(ctx)` when the module owns timers, listeners, sockets, or other work that scoped registration cannot remove automatically.
- Ensure enable-disable-enable and uninstall cycles leave no routes, static directories, UI contributions, capabilities, flows, flow hooks, timers, listeners, or sockets behind.

Route handlers orchestrate and validate; capabilities execute provider-specific work. Never access a database driver, auth implementation, gateway store, adapter, or external service directly from a route handler.

## Structure and reuse

Keep the external-module root layout intact. Server handlers belong under `api/`, browser resources under `ui/`, CLI controls under `cli/`, localized documentation under `docs/`, and store artwork under `assets/`.

Use `reuse/` for genuinely cross-cutting utilities within a layer. Do not create directories named `shared`, `utils`, `helpers`, or `common`. Keep feature-specific implementation beside the feature rather than promoting it prematurely.

Keep modules cohesive and files at or below 1000 lines. Prefer existing capabilities, flows, and reusable abstractions over parallel infrastructure. Use descriptive function and variable names; avoid abbreviations and one- or two-letter bindings except conventional coordinates, loop counters, row/column counters, `_`, and `id`.

## UI requirements

Build dashboard content through the Cognis page composer and client-side router contracts supplied by the host. Do not implement full-page navigation with `window.location.href`, `window.location.replace`, or `window.location.reload`.

Resolve all user-facing text through module-owned XML language resources. Namespace module keys as `module.jitsi_meet.*`, keep keys lowercase ASCII with dots, hyphens, and underscores, and preserve German, English, Indonesian, and Japanese parity. Translate values in each locale rather than copying English. Route user-facing timestamps through the host timestamp capability and respect the user's font and theme preferences.

Use the host toast capability for transient feedback. Do not use `alert`, `confirm`, or `prompt`, and do not write result messages directly into arbitrary DOM nodes. Use decision popups only when deliberate user input is required.

User avatars must retain the standard Cognis behavior: profile preview on hover and profile navigation on click.

Do not add comments to CSS. Prefer themeable SVG assets over emoji or platform-dependent icon glyphs.

## API, security, and logging

Validate and sanitize all input at the API boundary. Authenticate and authorize before business logic, use least privilege and secure defaults, and never expose internal error details to clients.

Log caught failures at `error` level with structured, safe metadata including component, operation, and relevant identifiers. Mark uncaught runtime failures as fatal. Log state-changing user activity at `info` level. Do not leave silent `catch` blocks; log an intentional fallback before continuing.

Do not use `Math.random()` for identifiers, tokens, keys, or user-visible generated values. Use Web Crypto or Node Crypto.

Do not introduce compatibility shims for obsolete schemas or API shapes. Do not write tests asserting that removed legacy artifacts are absent.

## Tests and quality

Tests live beside this module under `api/tests/` and `ui/tests/`. They must run from this standalone repository and use local fakes for every external capability. Test public route, capability, and flow contracts rather than importing sibling Cognis implementations.

Before committing, run at minimum:

```sh
npm install
npm test
git diff --check
```

Use the repository Prettier configuration: four-space indentation, double quotes in JavaScript, and trailing commas for multiline arrays and objects. Avoid tabs and trailing whitespace. Never wrap imports in `try`/`catch`.

Every behavior change requires appropriate tests, logging, and documentation. Keep documentation variants synchronized. Do not add AI reasoning, session notes, or process commentary to product-facing files.

## Review discipline

Treat human and automated review comments as actionable engineering feedback. Implement technically sound corrections unless they conflict with a higher-priority instruction or architectural requirement. Record any intentionally deferred review item in root `TODO.md` with a concrete technical reason.

Keep changes focused, but improve directly adjacent violations when touching a file. Leave the repository cleaner, more secure, and more internally consistent than you found it.
