# US08 — Accessibility, SEO and Performance Hardening

Hardening pass only. No redesign, new features or animations.

## Accessibility
Audit/fix:
- heading hierarchy
- landmarks
- keyboard navigation
- focus visibility
- contrast
- link purpose
- reduced-motion plumbing
- alt text
- decorative assets
- language attributes
- semantic article structure

Avoid excessive ARIA.

## SEO
Implement:
- per-page title/description
- canonical URLs
- locale-aware hreflang
- OpenGraph/Twitter metadata
- article metadata where useful
- sitemap
- robots
- structured data only where genuinely useful

No keyword stuffing.

## Performance
Audit:
- fonts
- images
- layout shift
- unused JS
- unnecessary client components
- hydration cost
- large assets
- temporary external design assets

Prefer server components where practical and keep client islands narrow.

## Final response
Report:
1. accessibility fixes
2. SEO additions
3. performance improvements
4. files changed
5. remaining measurable issues

Do not start another US.
