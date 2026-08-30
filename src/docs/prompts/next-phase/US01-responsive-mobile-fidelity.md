# Story — Responsive / Mobile Fidelity

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


Intent: make the existing homepage intentionally responsive without redesigning it.

Scope guidance:
- audit overflow, nowrap, fixed sizes, typography and spacing
- preserve editorial rhythm rather than simply shrinking desktop
- no horizontal scrolling or clipped copy
- readable line lengths
- responsive whitespace
- preserve section color transitions and separators
- preserve the fragment feeling of Really About Me
- handle right-aligned personal fragments intentionally on mobile
- keep static Running visualization usable
- test representative widths around 1440, 1280, 1024, 768, 430, 390, 360
- use fluid typography where appropriate
- do not convert the design into cards

Out of scope:
- animations
- site architecture redesign
- editorial deep pages
- locale content
- deployment

Do not touch the two legacy animation scripts.
