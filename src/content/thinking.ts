import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { locales, type Locale } from "./locales";
import type { DialogueArtifact, EditorialArticle, EditorialBlock, EditorialContent } from "./types";

type ThinkingIndexFile = Pick<EditorialContent, "label" | "heading" | "introduction" | "dialogueArtifacts">;

type ThinkingArticleFile = Omit<EditorialArticle, "publishedAt"> & {
  publishedAt: string | null;
  translationKey: string;
  order: number;
};

type ThinkingRepository = {
  indexes: Record<Locale, ThinkingIndexFile>;
  articles: ThinkingArticleFile[];
};

const contentRoot = join(process.cwd(), "src", "content", "thinking");
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function fail(path: string, message: string): never {
  throw new Error(`Thinking content validation failed at ${path}: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, path: string) {
  if (typeof value !== "string" || value.trim() === "") fail(path, "expected a non-empty string");
  return value;
}

function validateDialogueArtifacts(value: unknown, path: string): DialogueArtifact[] {
  if (!Array.isArray(value)) fail(path, "expected an array");

  return value.map((artifact, index) => {
    const artifactPath = `${path}[${index}]`;
    if (!isRecord(artifact)) fail(artifactPath, "expected an object");
    const result: DialogueArtifact = {
      screenshot: requireString(artifact.screenshot, `${artifactPath}.screenshot`),
      alt: requireString(artifact.alt, `${artifactPath}.alt`),
      line: requireString(artifact.line, `${artifactPath}.line`),
    };
    if (artifact.reflection !== undefined) result.reflection = requireString(artifact.reflection, `${artifactPath}.reflection`);
    if (artifact.href !== undefined) result.href = requireString(artifact.href, `${artifactPath}.href`);
    return result;
  });
}

function validateBlock(value: unknown, path: string): EditorialBlock {
  if (!isRecord(value)) fail(path, "expected an object");
  const type = requireString(value.type, `${path}.type`);

  switch (type) {
    case "paragraph":
    case "heading":
    case "note":
      return { type, text: requireString(value.text, `${path}.text`) };
    case "quote": {
      const block: Extract<EditorialBlock, { type: "quote" }> = { type, text: requireString(value.text, `${path}.text`) };
      if (value.attribution !== undefined) block.attribution = requireString(value.attribution, `${path}.attribution`);
      return block;
    }
    case "image": {
      const block: Extract<EditorialBlock, { type: "image" }> = {
        type: "image",
        src: requireString(value.src, `${path}.src`),
        alt: requireString(value.alt, `${path}.alt`),
      };
      if (value.caption !== undefined) block.caption = requireString(value.caption, `${path}.caption`);
      return block;
    }
    case "artifact": {
      const block: Extract<EditorialBlock, { type: "artifact" }> = {
        type: "artifact",
        src: requireString(value.src, `${path}.src`),
        alt: requireString(value.alt, `${path}.alt`),
      };
      if (value.caption !== undefined) block.caption = requireString(value.caption, `${path}.caption`);
      if (value.note !== undefined) block.note = requireString(value.note, `${path}.note`);
      return block;
    }
    case "divider":
      return { type };
    default:
      return fail(`${path}.type`, `unsupported block type \"${type}\"`);
  }
}

function validateIndex(value: unknown, path: string): ThinkingIndexFile {
  if (!isRecord(value)) fail(path, "expected an object");
  return {
    label: requireString(value.label, `${path}.label`),
    heading: requireString(value.heading, `${path}.heading`),
    introduction: requireString(value.introduction, `${path}.introduction`),
    dialogueArtifacts: validateDialogueArtifacts(value.dialogueArtifacts, `${path}.dialogueArtifacts`),
  };
}

function validateArticle(value: unknown, path: string): ThinkingArticleFile {
  if (!isRecord(value)) fail(path, "expected an object");

  const locale = requireString(value.locale, `${path}.locale`);
  if (!locales.includes(locale as Locale)) fail(`${path}.locale`, `unsupported locale \"${locale}\"`);

  const slug = requireString(value.slug, `${path}.slug`);
  if (!slugPattern.test(slug)) fail(`${path}.slug`, "must be a lowercase URL slug");

  const translationKey = requireString(value.translationKey, `${path}.translationKey`);
  if (!slugPattern.test(translationKey)) fail(`${path}.translationKey`, "must be a lowercase stable identity");

  const status = requireString(value.status, `${path}.status`);
  if (status !== "draft" && status !== "published") fail(`${path}.status`, `unsupported status \"${status}\"`);

  const publishedAt = value.publishedAt;
  if (publishedAt !== null && (typeof publishedAt !== "string" || !isoDatePattern.test(publishedAt))) {
    fail(`${path}.publishedAt`, "must be an ISO date (YYYY-MM-DD) or null");
  }
  if (status === "published" && publishedAt === null) fail(`${path}.publishedAt`, "is required when status is published");

  if (typeof value.order !== "number" || !Number.isInteger(value.order) || value.order < 1) {
    fail(`${path}.order`, "must be a positive integer");
  }
  if (!Array.isArray(value.body)) fail(`${path}.body`, "expected an array");

  return {
    locale: locale as Locale,
    slug,
    translationKey,
    title: requireString(value.title, `${path}.title`),
    excerpt: requireString(value.excerpt, `${path}.excerpt`),
    status,
    publishedAt,
    order: value.order,
    body: value.body.map((block, index) => validateBlock(block, `${path}.body[${index}]`)),
  };
}

export function validateThinkingRepository(indexes: Record<Locale, unknown>, articles: Array<{ path: string; value: unknown }>): ThinkingRepository {
  const validatedIndexes = Object.fromEntries(locales.map((locale) => [locale, validateIndex(indexes[locale], `${locale}/index.json`)])) as Record<Locale, ThinkingIndexFile>;
  const validatedArticles = articles.map(({ path, value }) => validateArticle(value, path));
  const seenLocaleSlugs = new Set<string>();
  const translationLocales = new Map<string, Set<Locale>>();
  const orders = new Set<string>();

  for (const article of validatedArticles) {
    const localeSlug = `${article.locale}:${article.slug}`;
    if (seenLocaleSlugs.has(localeSlug)) fail(article.slug, `duplicate slug for locale ${article.locale}`);
    seenLocaleSlugs.add(localeSlug);

    const localesForTranslation = translationLocales.get(article.translationKey) ?? new Set<Locale>();
    if (localesForTranslation.has(article.locale)) fail(article.translationKey, `duplicate translation identity for locale ${article.locale}`);
    localesForTranslation.add(article.locale);
    translationLocales.set(article.translationKey, localesForTranslation);

    const orderKey = `${article.locale}:${article.order}`;
    if (orders.has(orderKey)) fail(article.slug, `duplicate order ${article.order} for locale ${article.locale}`);
    orders.add(orderKey);
  }

  for (const [translationKey, translatedLocales] of translationLocales) {
    if (translatedLocales.size !== locales.length) fail(translationKey, "must have exactly one entry for every supported locale");
  }

  return { indexes: validatedIndexes, articles: validatedArticles };
}

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(path, `could not read JSON (${message})`);
  }
}

function loadRepository(): ThinkingRepository {
  const indexes = Object.fromEntries(locales.map((locale) => [locale, readJson(join(contentRoot, locale, "index.json"))])) as Record<Locale, unknown>;
  const articles = locales.flatMap((locale) => {
    const directory = join(contentRoot, locale, "articles");
    return readdirSync(directory)
      .filter((name) => name.endsWith(".json"))
      .sort()
      .map((name) => ({ path: `${locale}/articles/${name}`, value: readJson(join(directory, name)) }));
  });

  return validateThinkingRepository(indexes, articles);
}

const repository = loadRepository();

function toEditorialArticle(article: ThinkingArticleFile): EditorialArticle {
  return {
    title: article.title,
    slug: article.slug,
    locale: article.locale,
    excerpt: article.excerpt,
    ...(article.publishedAt ? { publishedAt: article.publishedAt } : {}),
    status: article.status,
    body: article.body,
  };
}

function articlesFor(locale: Locale, includeDrafts = false) {
  return repository.articles
    .filter((article) => article.locale === locale && (includeDrafts || article.status === "published"))
    .sort((left, right) => left.order - right.order);
}

export function getThinkingContent(locale: Locale): EditorialContent {
  return {
    ...repository.indexes[locale],
    articles: articlesFor(locale).map(toEditorialArticle),
  };
}

export function getEditorialArticle(locale: Locale, slug: string) {
  const article = articlesFor(locale).find((candidate) => candidate.slug === slug);
  return article ? toEditorialArticle(article) : undefined;
}

export function getTranslatedThinkingSlug(sourceLocale: Locale, sourceSlug: string, targetLocale: Locale) {
  const source = articlesFor(sourceLocale, true).find((article) => article.slug === sourceSlug);
  if (!source) return undefined;
  return articlesFor(targetLocale, true).find((article) => article.translationKey === source.translationKey)?.slug;
}
