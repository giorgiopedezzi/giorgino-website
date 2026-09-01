# Giorgino Website

The source code for the Giorgino website, built with [Next.js](https://nextjs.org/) and TypeScript.

## Prerequisites

- Node.js 20 or later
- npm (or the package manager indicated by the lockfile)

## Getting started

Install dependencies and start the local development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app reloads automatically as you make changes.

## Useful commands

```bash
# Create an optimized production build
npm run build

# Run the production server after building
npm run start

# Run linting, when configured
npm run lint
```

## Environment variables

Store local configuration in `.env.local`. Do not commit environment files or credentials; `.env*` files are ignored by Git.

When adding a required variable, document its name and purpose here, and provide safe placeholder values in an example file if appropriate.

## Project conventions

- Keep feature work focused and covered by appropriate checks.
- Run the relevant validation commands before opening a review.
- Do not commit generated build output, dependencies, IDE settings, or secrets.

## Deployment

Create a production build with `npm run build`, then serve it with `npm run start`, or deploy through the hosting platform configured for the project.

## Thinking editorial workflow

1. Start the local server with `npm run dev`, then open `/keystatic` to edit Thinking and the localized site-authoring foundation. The editor is intentionally available only during local development.
2. The non-Thinking foundation lives in `src/content/site/{en,it}/authoring-foundation.json`. It demonstrates the approved semantic fields: required text, an optional safe link, section visibility, ordered repeatable links, and repository-owned JPEG, PNG, WebP, or GIF media with required alternative text and optional captions. It is a foundation fixture, not a migration of any public page.
3. To preview the foundation through the real component route, open `/api/site-preview/enable?locale=en` (or `locale=it`). The route renders `/en/authoring-foundation` in local development only. The included animated GIF proof and any newly added GIFs are rendered unoptimized so their frames are preserved.
4. To preview a Thinking draft through the site’s real Thinking route, open `/api/thinking-preview/enable?locale=en&slug=your-article-slug` (use `locale=it` for the Italian counterpart). The preview banner confirms that Draft Mode is active, refreshes saved content every few seconds, and provides an exit link. `/en/thinking` and `/it/thinking` also show their draft lists while preview is active.
5. Review every generated content/media diff, commit it to Git, and deploy normally. Git remains the only authoritative source for public content. Do not put credentials, tokens, or other secrets in content files: their values can be rendered to visitors.
6. Keep English and Italian entries paired with the same `translationKey`, locale-specific slugs, and matching editorial intent. Add media through the editor; it is stored under `public/thinking-media/` and must have useful alternative text.
7. Before review, run `npm run verify:thinking`, `npm run verify:site-authoring`, `npm run verify:site-renderer`, `npm run lint`, `npm run typecheck`, and `npm run build`. Correct editor validation errors rather than bypassing them: invalid paths, malformed JSON, missing translations, duplicate orders, unsafe links, and incomplete required fields are rejected.
8. Review content and media changes in Git. A draft is not public until its status is changed to `published`, its publication date is set, and the reviewed commit is merged and deployed through the normal Vercel workflow. Do not push, merge, or publish automatically.

Drafts stay out of normal public Thinking routes, metadata, and the sitemap. The editor and preview-enablement routes return 404 outside local development.
