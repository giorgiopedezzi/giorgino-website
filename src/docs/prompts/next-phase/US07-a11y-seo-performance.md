# Story — Accessibility, SEO and Performance Hardening

Current baseline:
- the static homepage migration described in the supplied `phase3.md` is already implemented
- Next.js + TypeScript foundation exists
- locale-ready routing foundation exists
- design tokens / typography foundation exists
- real homepage content and static desktop fidelity exist
- Figma is visual/layout truth
- Framer is behavioral reference only
- animations are not yet integrated
- legacy references remain untouched:
  - `src/legacy/framer/scripts/typewriter.tsx`
  - `src/legacy/framer/scripts/darkmatter.tsx`

References:
- Figma: https://www.figma.com/design/x7ws9KFxBn36LV10tRRmta/Untitled?node-id=1-2
- Framer: https://global-expectations-562504.framer.app/

Use the attached `implement-story` skill for exactly one Jira Story key: `<STORY_KEY>`.

Mandatory workflow:
- read `AGENTS.md`
- follow `.agents/workflows/story-jira-gate.md`
- follow `.agents/workflows/jira-acceptance-criteria.md`
- follow `.agents/workflows/story-git-lifecycle.md`
- start only from `Ready to Develop`
- establish the Story branch before editing
- implement only Jira-approved scope
- verify each AC individually
- preserve ADF
- stage only explicit Story files
- inspect staged diff
- commit locally
- record commit hash
- write Actual effort
- transition to `In Review`
- comment branch + commit + verification
- STOP
- never push
- never move to Done unless separately requested
- never start another Story automatically

If this prompt conflicts with Jira, Jira wins. Stop and report the mismatch instead of expanding scope.


Hardening only. No redesign, new features or animation implementation.

Accessibility candidates:
- heading hierarchy
- landmarks
- keyboard navigation
- focus visibility
- contrast
- link purpose
- reduced-motion plumbing
- alt text
- decorative asset handling
- language attributes
- semantic article structure

SEO candidates:
- page titles/descriptions
- canonical URLs
- locale-aware hreflang
- OpenGraph/Twitter metadata
- article metadata
- sitemap
- robots
- structured data only where useful

Performance candidates:
- font loading
- image optimization
- layout shift
- unused JS
- unnecessary client components
- hydration cost
- large assets
- temporary Figma/external assets

Prefer server components where practical and keep client islands narrow.
