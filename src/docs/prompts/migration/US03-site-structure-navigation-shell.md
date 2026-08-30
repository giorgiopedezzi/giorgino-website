# US03 — Complete Site Structure and Navigation Shell

US01/US02 are accepted.

## Philosophy
Home is a guided reading experience, not a menu.
First visit: sequence first, navigation second.
Return visit: deeper destinations must be easy to find.
Do not encourage shortcuts, but do not make life harder.

Rhythm and pauses are part of the site. Avoid web patterns that constantly hurry the visitor toward more actions.

## Intended architecture
Prepare routes for:
- Home
- Thinking
- Thinking article
- Dialogues with AI
- Running/Building
- Really About Me
- Contact

Do not add generic Services, Skills, Experience, Portfolio or About pages.

## Objective
Implement the route shell and the smallest useful navigation system without fully designing deeper pages.

Homepage content/order must remain unchanged except for minimal navigation affordances.

Navigation should:
- stay visually quiet on first pass
- become useful near/end of page
- be practical for returning visitors
- work with keyboard and mobile
- avoid conversion-style CTA buttons

Create placeholder routes:
- `/[locale]/thinking`
- `/[locale]/thinking/[slug]`
- `/[locale]/thinking/dialogues`
- `/[locale]/running` or `/[locale]/building`
- `/[locale]/really-about-me`
- `/[locale]/contact` if a separate contact page is kept

If route naming is unresolved, document the choice rather than silently inventing a branding decision.

## Final response
Report:
1. route structure
2. navigation model
3. files changed
4. naming decisions
5. unresolved architecture questions

Do not start another US.
