# Story — Production Cutover and Framer Retirement

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


No redesign or new features.

Before any destructive/external change inspect and report:
- deployment target
- domain/DNS
- environment variables
- production build status/warnings
- canonical URL config
- redirects
- analytics presence

Do not make DNS/destructive changes without both Jira scope and explicit human approval.

Readiness checks as applicable:
- production build succeeds
- locale routes work
- deep pages work
- 404 works
- metadata/canonical/hreflang correct
- sitemap/robots correct
- assets/fonts load
- no localhost references
- no Framer runtime references
- no temporary Figma asset URLs
- no unintended placeholders
- animations respect reduced motion
- mobile smoke test passes

Do not assume Vercel if another target exists.

Do not delete the Framer project during normal cutover.
Keep it as historical/rollback reference until the new deployment is verified.
Define rollback before switching production.
