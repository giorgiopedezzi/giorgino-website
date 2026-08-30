# US07 — Locale Implementation and Language UX

Locale-ready routing already exists. Turn it into a complete EN/IT implementation.

## Requirements
Implement:
- English and Italian locale-aware routes
- locale-aware content loading
- language metadata
- canonical/hreflang support where appropriate
- restrained language switcher
- sensible locale persistence/default behavior

Do not use automatic machine translation as final editorial content.

The switcher must:
- be easy to find
- not dominate the first-pass narrative
- preserve the current route when possible
- work on mobile and keyboard

Define an explicit missing-translation fallback policy.
Do not silently mix languages on the same page.

Ensure Thinking metadata/body resolve by locale cleanly.

## Final response
Report:
1. locale architecture
2. switcher behavior
3. files changed
4. fallback policy
5. untranslated content still required

Do not start another US.
