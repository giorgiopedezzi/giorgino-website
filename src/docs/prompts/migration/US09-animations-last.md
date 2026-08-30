# US09 — Legacy Animation Redesign and Reimplementation

THIS IS THE LAST FEATURE US.

Legacy references:
- `src/legacy/framer/scripts/typewriter.tsx`
- `src/legacy/framer/scripts/darkmatter.tsx`

Do not import/wrap them directly.
Inspect them, extract useful ideas, then implement clean React/Next behavior.
The final behavior is NOT assumed identical to the legacy scripts.

## Inspect first
Identify:
- common typewriter/timing logic
- Framer-specific dependencies
- timer/render risks
- duplication between scripts
- what can be shared safely

Briefly report diagnosis before editing.

## Animation A — previous section
Use `typewriter.tsx` as reference only.
Implement the newly approved behavior using deterministic timing, clean lifecycle, reduced-motion support and minimal DOM/state churn.

Do not assume the old sequence is final if current requirements differ.

## Animation B — Dark Matter
Current conceptual direction unless explicitly superseded:

1. label, title and narrative appear immediately
2. narrative initially has no punctuation, capitalization or explicit line breaks
3. a left-to-right letter-by-letter transition moves through the already-visible narrative
4. while it progresses, words are restored one by one
5. punctuation/capitalization/line breaks remain absent during restoration
6. after all words are restored, pause
7. closing thought appears in one shot
8. at that exact moment narrative becomes the perfect canonical version:
   - capitalization
   - punctuation
   - line breaks
   - exact wording
9. final correction is instantaneous, not typewritten

Editorial/slightly uncanny, not hacker/glitch-like.

## Shared infrastructure
If both need shared scheduling/typewriter logic, create a small reusable hook/utility.
Do not over-generalize.

Avoid:
- one timer per character
- Math.random() during render
- hydration mismatches
- unstable dependencies
- timer leaks
- state loops
- duplicated typewriter engines

## Trigger/reduced motion
Animations must not restart because a parent re-renders.
If scroll-triggered, use robust single-entry observer behavior.
With reduced motion, show final accessible content immediately.

## Final response
Report:
1. what was learned from legacy scripts
2. final behaviors implemented
3. shared infrastructure
4. files changed
5. timing values left easy to tune

Do not deploy.
