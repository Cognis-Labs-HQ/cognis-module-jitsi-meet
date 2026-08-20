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

The versions in `manifest.json`, `package.json`, and `package-lock.json` must remain synchronized. Keep `package.json` configured with `"type": "module"`, keep `routes.json` as an array, and ensure every declared entrypoint and asset is a regular repository-relative file with exact filename casing.

Keep repository, homepage, and support metadata pointed at this project. After the final file change, regenerate every SHA-256 digest in `manifest.files`. Do not include `manifest.json` in its own digest list. Verify all declared digests before committing.

Do not add generated secrets. Keep store artwork and screenshots free of credentials and personal data. Document requested capabilities and review new dependencies carefully.

## Component isolation and ctx

The module manifest describes configuration option keys and types only. Cognis owns rendering the settings popup and polls `GET /api/v1/modules/jitsi-meet/config`, then pushes changes with `PUT` to that same endpoint. The Jitsi Meet module remains responsible for validating, applying, and persisting those values; do not add another settings UI or use the Cognis preference store as module configuration storage.

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

When browser code needs data owned by a gateway, consume the gateway's host-supplied UI client capability instead of issuing that gateway's API request directly. Gateway and adapter implementations remain behind their owning gateway; never pass concrete adapters across component boundaries or hardcode core-to-gateway coupling.

Do not impose arbitrary default or maximum result limits in routes or store defaults. Validate and apply a limit only when the caller explicitly supplies it. UI callers that need a smaller display set should fetch the complete result and truncate locally.

User-specific passwords, encryption keys, and other secrets belong in the host keyring capability. Never add plaintext `localStorage`, `sessionStorage`, preference, or module-owned secret caches. Contribute received secrets immediately with stable capability-owned identifiers and useful metadata, and retrieve them through the keyring resolver.

Treat meaningful backend and UI orchestration as named flows with explicit ordered stages. Decide which flow owns new behavior before adding it, extend that flow through removable hooks, and compose flows through `ctx` rather than introducing hardcoded provider branches.

Module-specific operational controls belong under `cli/` as pluggable `cognisctl` subcommands.

## Structure and reuse

Keep the external-module root layout intact. Server handlers belong under `api/`, browser resources under `ui/`, CLI controls under `cli/`, localized documentation under `docs/`, and store artwork under `assets/`.

Use `reuse/` for genuinely cross-cutting utilities within a layer. Do not create directories named `shared`, `utils`, `helpers`, or `common`. Keep feature-specific implementation beside the feature rather than promoting it prematurely.

Promote reusable code reactively when a parameterizable snippet of at least five lines already exists in one area and is needed in another. Files in `reuse/` must have generic abstraction names rather than feature-specific prefixes. Every browser module under `ui/reuse/` must begin with JSDoc describing its purpose, public exports, a concrete usage example, and `@param` and `@returns` annotations for non-trivial exports.

Keep modules cohesive and files at or below 1000 lines. Prefer existing capabilities, flows, and reusable abstractions over parallel infrastructure. Use descriptive function and variable names; avoid abbreviations and one- or two-letter bindings except conventional coordinates, loop counters, row/column counters, `_`, and `id`.

## UI requirements

Build dashboard content through the Cognis page composer and client-side router contracts supplied by the host. Do not implement full-page navigation with `window.location.href`, `window.location.replace`, or `window.location.reload`.

Every dashboard page must pass an i18n-resolved `pageContext` containing both `title` and `subtitle`. Page entrypoints must export `async function mount(root, { signal } = {})`, use the supplied abort signal for page-owned browser listeners and requests, support direct initial mounting, and be registered through the host router contract.

Use consequence-based button classes: `btn-cancel` for potentially destructive actions, `btn-confirm` for creative actions, and `btn-neutral` for all other actions. Prefer an `<a>` element whenever a control represents navigation; use `<button>` only for form submission or in-page actions.

Resolve all user-facing text through module-owned XML language resources. Namespace module keys as `module.jitsi_meet.*`, keep keys lowercase ASCII with dots, hyphens, and underscores, and preserve German, English, Indonesian, and Japanese parity. Translate values in each locale rather than copying English. Route user-facing timestamps through the host timestamp capability and respect the user's font and theme preferences.

Use flat host `ui.reuse.*` keys for generic cross-component labels instead of duplicating basic phrases in the module namespace. English label-style page titles and section headings use Title Case. Keep documentation H1 titles at or below 30 characters, prefer language-suffixed Markdown files, and resolve documentation by language before falling back.

Use the host toast capability for transient feedback. Do not use `alert`, `confirm`, or `prompt`, and do not write result messages directly into arbitrary DOM nodes. Use decision popups only when deliberate user input is required.

User avatars must retain the standard Cognis behavior: profile preview on hover and profile navigation on click.

Do not add comments to CSS. Prefer themeable SVG assets over emoji or platform-dependent icon glyphs.

When no suitable SVG exists and a textual Unicode symbol is intentional, consult the W3Schools UTF symbol reference before selecting it. Avoid emoji because platform rendering is inconsistent and cannot be themed reliably.

Do not place long contextual hint text beside form fields. Use the host information-tooltip contract inline with the label or heading; reserve inline hints for a single short phrase that must always remain visible.

## API, security, and logging

Validate and sanitize all input at the API boundary. Authenticate and authorize before business logic, use least privilege and secure defaults, and never expose internal error details to clients.

Log caught failures at `error` level with structured, safe metadata including component, operation, and relevant identifiers. Mark uncaught runtime failures as fatal. Log state-changing user activity at `info` level. Do not leave silent `catch` blocks; log an intentional fallback before continuing.

Use one local `log` invocation style within new code rather than mixing property calls and alternate logger names. Fatal events must include `fatal: true` in structured metadata.

Do not use `Math.random()` for identifiers, tokens, keys, or user-visible generated values. Use Web Crypto or Node Crypto.

Do not introduce compatibility shims for obsolete schemas or API shapes. Do not write tests asserting that removed legacy artifacts are absent.

API endpoints must not change public route signatures, exported types, or CLI command names without explicitly documenting the breaking change. Do not introduce third-party dependencies without review.

## Tests and quality

Tests live beside this module under `api/tests/` and `ui/tests/`. They must run from this standalone repository and use local fakes for every external capability. Test public route, capability, and flow contracts rather than importing sibling Cognis implementations.

Before committing, run at minimum:

```sh
npm install
npm test
git diff --check
```

Use two-space indentation, single quotes in JavaScript, and trailing commas for multiline arrays and objects. Avoid tabs and trailing whitespace. Never wrap imports in `try`/`catch`.

TypeScript exports require explicit return types. Avoid `any`; when it is genuinely unavoidable, document the technical reason.

Every behavior change requires appropriate tests, logging, and documentation. Keep documentation variants synchronized. Do not add AI reasoning, session notes, or process commentary to product-facing files.

All module changes require a synchronized version bump. Changelog entries belong under `docs/changelog/`, with matching German, English, Indonesian, and Japanese files named `<branch-name>.<lang>.md`. Each entry uses an H1 release title of at most 30 characters, one H2 per summarized change point, and translated detail text. Existing changelog entries are immutable except for factual corrections; never introduce a monolithic changelog.

After a version update, run `npm ci --ignore-scripts`. Any future `@cognis/*` package dependency must use a flexible tested-ceiling range in the form `<=<tested-version>` rather than an exact pin. Missing, disabled, or newer-than-tested declared dependencies must surface as component errors instead of being hidden by fallback behavior.

Before implementation, estimate the smallest viable change and prefer existing capabilities, flows, routes, and composer contributions. Treat safe line-count reduction as a first-class objective. Keep HTML and JavaScript in separate files rather than embedding feature-sized markup templates in JavaScript.

Use fully qualified, descriptive database table names and aliases. Apart from conventional `x`, `y`, `w`, `h`, `_`, numeric counters `i`, `j`, `k`, row and column counters `r`, `c`, and `id`, do not introduce one- or two-letter variable or loop-binding names.

Avoid speculative comments and section-divider comments. A comment describing an intentional alternate or fallback path must identify the relevant labeled block; do not rely on fragile line-number references. Implementation contracts and usage examples belong in module documentation rather than source overview comments.

## Review discipline

Treat human and automated review comments as actionable engineering feedback. Implement technically sound corrections unless they conflict with a higher-priority instruction or architectural requirement. Record any intentionally deferred review item in root `TODO.md` with a concrete technical reason.

Keep changes focused, but improve directly adjacent violations when touching a file. Leave the repository cleaner, more secure, and more internally consistent than you found it.

Do not delete or discard existing code without a clear, explicit technical reason, and flag intentional public API changes. When removal is required, remove the obsolete behavior completely rather than commenting it out or retaining compatibility code.

Prioritize readability over terseness. Do not compress naturally multiline logic, markup, or styles into dense one-liners. If a change would introduce non-conformant structure, stop and correct the design before proceeding.

## Applicability boundary

Main-repository rules whose paths or ownership are exclusive to the Cognis monorepo do not apply here: core `src/` directory layouts, gateway and adapter directory placement, core contract organization, Study language modules and routing, Docker environment files, global user command namespaces, central gateway prefix registration, bundled-component discovery, and the monorepo versions index. Their architectural principles still apply through this repository's external-module contracts above.
