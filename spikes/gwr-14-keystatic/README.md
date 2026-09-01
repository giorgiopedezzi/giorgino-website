# GWR-14 — Keystatic local-mode compatibility proof

## Boundary

This directory and the route group `src/app/(gwr-14-keystatic-spike)` are disposable proof code. They validate a candidate architecture; they are not the production Thinking repository or an approved production editor integration. The admin, API, and preview routes return 404 outside development.

## Tested baseline

| Dependency | Locked version |
| --- | --- |
| Next.js | 16.3.3 |
| React / React DOM | 19.2.8 |
| `@keystatic/core` | 0.6.9 |
| `@keystatic/next` | 5.0.5 |
| `@markdoc/markdoc` | 0.5.9 |
| Node.js | 24.18.1 |

The Keystatic packages are exact dependencies so the result can be reproduced. The proof does not downgrade Next.js or React and uses Keystatic local storage only.

## Proof surface

- Authoring UI: `http://127.0.0.1:3000/keystatic`
- Production-renderer preview (EN): `http://127.0.0.1:3000/spikes/gwr-14/preview/next-16-file-backed-proof-en`
- Production-renderer preview (IT): `http://127.0.0.1:3000/spikes/gwr-14/preview/next-16-file-backed-proof-it`
- Structured files: `spikes/gwr-14-keystatic/content/articles/*.json`

The preview reads through Keystatic's server-only Reader API, maps the structured entry to `EditorialArticle`, and passes it to the real `EditorialArticleView`.

## Reproducible commands

```powershell
npm run dev
node --no-warnings --experimental-strip-types spikes/gwr-14-keystatic/verify-roundtrip.ts
node --no-warnings --experimental-strip-types spikes/gwr-14-keystatic/verify-roundtrip.ts --exercise-local-save
npm run typecheck
npm run lint
npm run build
```

For a focused saved-file diff, copy a fixture before editing, save in Keystatic, and compare it with:

```powershell
git diff --no-index -- .tmp/gwr-14-before.json spikes/gwr-14-keystatic/content/articles/next-16-file-backed-proof-en.json
```

## GO / NO-GO criteria

GO requires all of the following on the locked baseline:

1. Turbopack development starts and the local Keystatic admin renders.
2. Metadata can be edited and constrained body blocks can be reordered and saved without TypeScript changes.
3. The save produces a readable structured-file diff and the Reader API can read it back.
4. The saved entry renders through `EditorialArticleView` via the proof adapter.
5. Type-checking, linting, and the production build pass, with proof routes unavailable in production.

Any failed condition is a NO-GO. A NO-GO blocks GWR-15 and later dependent Stories and requires human re-refinement; it does not authorize a framework downgrade, GitHub/Cloud mode, or a substitute CMS.

## Evidence and decision

Automated and HTTP-level evidence on 2026-09-01:

- `next dev` started Next.js 16.3.3 with Turbopack and served `/keystatic` with HTTP 200.
- Both localized preview routes returned HTTP 200.
- The English fixture was edited and its paragraph/heading order was changed through `POST /api/keystatic/update`; the Reader API immediately read both fixtures back.
- `git diff --no-index` showed only the excerpt edit and the moved JSON block.
- The updated preview contained the edited excerpt and block order inside the production `EditorialSystem` article/body CSS classes.
- `npm run typecheck`, `npm run lint`, and `npm run build` passed. The production build used Next.js 16.3.3 with Turbopack.
- Under `next start`, `/keystatic`, `/api/keystatic/update`, and `/spikes/gwr-14/preview/*` all returned HTTP 404 as required by the disposable boundary.

Manual author verification on 2026-09-01 confirmed that the Keystatic admin rendered, metadata could be edited, constrained blocks could be added and reordered, the save completed, and the production-renderer preview was correct.

Decision: **GO**. Every criterion above passed on the locked baseline. The candidate Git-authoritative, local-only architecture is viable for refinement in dependent Stories. This decision does not promote the disposable proof to production architecture or authorize GitHub/Cloud mode.
