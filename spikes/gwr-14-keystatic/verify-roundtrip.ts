import assert from "node:assert/strict";
import { copyFile, mkdir, readFile } from "node:fs/promises";

import { createReader } from "@keystatic/core/reader";

// @ts-expect-error Node's strip-only TypeScript loader requires the source extension at runtime.
import keystaticConfig from "./keystatic.config.ts";

const slugs = ["next-16-file-backed-proof-en", "next-16-file-backed-proof-it"] as const;

if (process.argv.includes("--exercise-local-save")) {
  await exerciseLocalSave();
}

const reader = createReader(process.cwd(), keystaticConfig);
const articles = await Promise.all(
  slugs.map(async (slug) => {
    const entry = await reader.collections.proofArticles.readOrThrow(slug);
    const sourcePath = `spikes/gwr-14-keystatic/content/articles/${slug}.json`;
    const source = await readFile(sourcePath, "utf8");

    assert.equal(source, `${JSON.stringify(JSON.parse(source), null, 2)}\n`, `${sourcePath} is not a stable, readable JSON artifact`);
    return { slug, entry };
  }),
);

assert.deepEqual(
  articles.map(({ entry }) => entry.locale),
  ["en", "it"],
  "the representative localized pair must contain one EN and one IT article",
);
assert.ok(articles.every(({ entry }) => entry.body.length >= 3), "each fixture must exercise multiple editorial blocks");
assert.ok(articles.some(({ entry }) => entry.body.some((block) => block.discriminant === "quote")), "the fixtures must exercise a constrained quote block");

console.log(`Verified ${articles.length} stable JSON entries through Keystatic's schema-aware Reader API.`);

async function exerciseLocalSave() {
  const sourcePath = "spikes/gwr-14-keystatic/content/articles/next-16-file-backed-proof-en.json";
  const beforePath = ".tmp/gwr-14-before.json";
  const source = await readFile(sourcePath, "utf8");
  const entry = JSON.parse(source);

  entry.excerpt = "A representative English draft, edited through Keystatic's local API on Next.js 16.3.3.";
  entry.body = [
    ...entry.body.filter((block: { discriminant: string }) => block.discriminant === "paragraph"),
    ...entry.body.filter((block: { discriminant: string }) => block.discriminant === "heading"),
    ...entry.body.filter((block: { discriminant: string }) => !["paragraph", "heading"].includes(block.discriminant)),
  ];

  await mkdir(".tmp", { recursive: true });
  await copyFile(sourcePath, beforePath);

  const contents = Buffer.from(`${JSON.stringify(entry, null, 2)}\n`).toString("base64url");
  const response = await fetch("http://127.0.0.1:3000/api/keystatic/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "no-cors": "1",
    },
    body: JSON.stringify({
      additions: [{ path: sourcePath, contents }],
      deletions: [],
    }),
  });

  assert.equal(response.status, 200, `Keystatic local update failed: ${await response.text()}`);
  console.log(`Saved a metadata edit and block reorder through Keystatic's local update API; baseline copied to ${beforePath}.`);
}
