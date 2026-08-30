# US10 — Production Cutover and Framer Retirement

All implementation USs are accepted.

No redesign or new features.

## Inspect first
Report:
- deployment target
- domain/DNS situation
- environment variables
- build status/warnings
- canonical URL config
- redirects needed
- analytics presence if any

Do not make DNS/destructive changes without explicit approval.

## Pre-cutover verification
Verify:
- production build succeeds
- locale routes work
- Thinking/deep pages work
- 404 works
- metadata/canonical/hreflang correct
- sitemap/robots correct
- assets/fonts load
- no localhost references
- no Framer runtime references
- no temporary Figma asset URLs
- no accidental placeholders
- animations respect reduced motion
- mobile smoke test passes

Prepare deployment for the selected host.
Do not assume Vercel if another target is already chosen.

## Framer retirement
Do not delete the Framer project.
Preserve it as historical reference until cutover is verified.

Define a rollback plan before switching production.

## Final response
Report:
1. readiness status
2. deployment target/config
3. cutover steps
4. rollback plan
5. blockers

Do not make destructive changes without explicit approval.
