# Strict UI Localization

**Feature Branch:** `feature-enforce-localized-ui-strings`

## Require language keys without literal fallbacks

AI instructions prohibit hardcoded English user-facing strings in every path. Missing preferred-language values may use the same keys from English XML resources; absent or empty English fallback values must fail explicitly instead of rendering literal English, raw keys, or blank text. Missing-translation errors must not be suppressed.

## Commits
