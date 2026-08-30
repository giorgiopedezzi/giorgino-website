# US02 — Responsive / Mobile Fidelity

US01 is accepted. This US makes the homepage intentionally responsive without redesigning it.

## Sources
Figma:
https://www.figma.com/design/x7ws9KFxBn36LV10tRRmta/Untitled?node-id=1-2
Framer (secondary responsive reference):
https://global-expectations-562504.framer.app/

## Inspect first
Audit current breakpoints, overflow, nowrap, fixed sizes, typography and the sections whose rhythm breaks on narrow screens. Briefly report findings.

## Requirements
Support desktop, laptop, tablet and mobile.
Preserve editorial rhythm rather than simply shrinking desktop.
- no horizontal scroll
- no clipped copy
- readable line lengths
- scaled but still generous whitespace
- preserve section color changes
- preserve thin separators
- preserve fragment feeling in Really About Me
- preserve understated `Next?`
- no card-grid conversion

Use fluid typography (`clamp()` or existing scale) where appropriate.

Pay special attention to:
- Missing Man artifact area
- Mortadella composition
- WAIT WAIT WAIT
- Nonnino
- Book
- static Running visualization

Check representative widths: 1440, 1280, 1024, 768, 430, 390, 360.

## Legacy scripts
Leave untouched:
- `src/legacy/framer/scripts/typewriter.tsx`
- `src/legacy/framer/scripts/darkmatter.tsx`

## Final response
Report:
1. responsive issues found
2. files changed
3. responsive rules added
4. remaining compromises

Do not start another US.
