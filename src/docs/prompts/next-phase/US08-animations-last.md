# Story — Animation Redesign and Reimplementation

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


CRITICAL: this is the LAST FEATURE STORY.

Legacy reference files:
- `src/legacy/framer/scripts/typewriter.tsx`
- `src/legacy/framer/scripts/darkmatter.tsx`

They are reference implementations only.
Do not import/wrap them directly.
Do not preserve Framer-specific APIs.
Do not assume their current sequence is final.

Inspect both first and identify:
- shared timing/typewriter logic
- Framer dependencies
- timer/render risks
- duplicated engines
- the minimum safe reusable abstraction

Previous-section animation:
reimplement only the newly approved final behavior with deterministic scheduling, clean React lifecycle, reduced-motion support and no incidental restart on parent re-render.

Dark Matter conceptual direction unless Jira supersedes it:
1. label, title and narrative appear immediately
2. narrative initially has no punctuation, capitalization or explicit line breaks
3. left-to-right letter-by-letter transition moves through already-visible narrative
4. words are restored one by one during the transition
5. punctuation/capitalization/line breaks stay absent during restoration
6. pause after all words are restored
7. closing thought appears in one shot
8. at exactly that moment narrative becomes the perfect canonical version
9. final correction is instantaneous, not typewritten

Editorial/slightly uncanny, never hacker/glitch-like.

Avoid:
- one timer per character
- Math.random() during render
- hydration mismatches
- unstable dependencies
- timer leaks
- state loops
- duplicated typewriter engines
- global animation state

With reduced motion, show final accessible content immediately.
