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

1. Start the local server with `npm run dev`, then open `/keystatic` to edit the Thinking indexes and articles. The editor is intentionally available only during local development.
2. To preview a draft through the site’s real Thinking route, open `/api/thinking-preview/enable?locale=en&slug=your-article-slug` (use `locale=it` for the Italian counterpart). The preview banner confirms that Draft Mode is active, refreshes saved content every few seconds, and provides an exit link. `/en/thinking` and `/it/thinking` also show their draft lists while preview is active.
3. Keep English and Italian entries paired with the same `translationKey`, locale-specific slugs, and matching editorial intent. Add media through the editor; it is stored under `public/thinking-media/` and must have useful alternative text.
4. Before review, run `npm run verify:thinking`, `npm run lint`, `npm run typecheck`, and `npm run build`. Correct editor validation errors rather than bypassing them: invalid paths, malformed JSON, missing translations, duplicate orders, unsafe links, and incomplete required fields are rejected.
5. Review content and media changes in Git. A draft is not public until its status is changed to `published`, its publication date is set, and the reviewed commit is merged and deployed through the normal Vercel workflow. Do not push, merge, or publish automatically.

Drafts stay out of normal public Thinking routes, metadata, and the sitemap. The editor and preview-enablement routes return 404 outside local development.
