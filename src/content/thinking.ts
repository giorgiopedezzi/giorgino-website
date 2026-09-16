import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { locales, type Locale } from "./locales";
import { validateContentMetadata } from "./content-metadata";
import type { DialogueArtifact, EditorialArticle, EditorialBlock, EditorialContent, EditorialLink, EditorialMetadata } from "./types";
import { validateRichText } from "./rich-text";

type ThinkingIndexFile = Pick<EditorialContent, "metadata" | "label" | "heading" | "introduction" | "dialogueArtifacts" | "dialogues" | "articleLabels">;

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

function requireSafeLink(value: unknown, path: string) {
  const href = requireString(value, path);
  if (!href.startsWith("/") && !/^https?:\/\//i.test(href)) {
    fail(path, "must be an internal path or an http(s) URL");
  }
  return href;
}

function requireThinkingMedia(value: unknown, path: string) {
  const src = requireString(value, path);
  if (!src.startsWith("/thinking-media/")) fail(path, "must reference a repository-owned /thinking-media/ asset");
  return src;
}

function isKeystaticBlock(value: unknown): value is { discriminant: string; value: unknown } {
  return isRecord(value) && typeof value.discriminant === "string" && "value" in value;
}

function validateDialogueArtifacts(value: unknown, path: string): DialogueArtifact[] {
  if (!Array.isArray(value)) fail(path, "expected an array");

  return value.map((artifact, index) => {
    const artifactPath = `${path}[${index}]`;
    const artifactValue = isKeystaticBlock(artifact) && artifact.discriminant === "dialogueArtifact" ? artifact.value : artifact;
    if (!isRecord(artifactValue)) fail(artifactPath, "expected an object");
    const result: DialogueArtifact = {
      screenshot: requireThinkingMedia(artifactValue.screenshot, `${artifactPath}.screenshot`),
      alt: requireString(artifactValue.alt, `${artifactPath}.alt`),
      line: requireString(artifactValue.line, `${artifactPath}.line`),
    };
    if (artifactValue.reflection !== undefined && artifactValue.reflection !== null) result.reflection = requireString(artifactValue.reflection, `${artifactPath}.reflection`);
    if (artifactValue.href !== undefined && artifactValue.href !== null) result.href = requireSafeLink(artifactValue.href, `${artifactPath}.href`);
    if (artifactValue.stretch === true) result.stretch = true;
    return result;
  });
}

function validateLinks(value: unknown, path: string): EditorialLink[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) fail(path, "expected an array");
  const hrefs = new Set<string>();
  return value.map((link, index) => {
    const linkPath = `${path}[${index}]`;
    if (!isRecord(link)) fail(linkPath, "expected an object");
    const href = requireSafeLink(link.href, `${linkPath}.href`);
    if (hrefs.has(href)) fail(`${linkPath}.href`, "must not duplicate another link in this list");
    hrefs.add(href);
    const result: EditorialLink = { label: requireString(link.label, `${linkPath}.label`), href };
    if (link.note !== undefined && link.note !== null) result.note = requireString(link.note, `${linkPath}.note`);
    return result;
  });
}

function validateMetadata(value: unknown, path: string): EditorialMetadata | undefined {
  if (value === undefined || value === null) return undefined;
  if (!isRecord(value)) fail(path, "expected an object");
  return validateContentMetadata(value, path);
}

function validateBlock(value: unknown, path: string): EditorialBlock {
  if (!isRecord(value)) fail(path, "expected an object");
  const type = requireString(isKeystaticBlock(value) ? value.discriminant : value.type, `${path}.type`);
  const blockValue = isKeystaticBlock(value) ? value.value : value;

  switch (type) {
    case "paragraph":
      return { type, text: validateRichText(typeof blockValue === "string" ? blockValue : isRecord(blockValue) ? blockValue.text : undefined, `${path}.text`) };
    case "heading":
    case "note":
      return { type, text: validateRichText(typeof blockValue === "string" ? blockValue : isRecord(blockValue) ? blockValue.text : undefined, `${path}.text`) };
    case "quote": {
      const quote = isRecord(blockValue) ? blockValue : value;
      const block: Extract<EditorialBlock, { type: "quote" }> = { type, text: validateRichText(quote.text, `${path}.text`) };
      if (quote.attribution !== undefined && quote.attribution !== null) block.attribution = requireString(quote.attribution, `${path}.attribution`);
      return block;
    }
    case "image": {
      const image = isRecord(blockValue) ? blockValue : value;
      const block: Extract<EditorialBlock, { type: "image" }> = {
        type: "image",
        src: requireThinkingMedia(image.src, `${path}.src`),
        alt: requireString(image.alt, `${path}.alt`),
      };
      if (image.caption !== undefined && image.caption !== null) block.caption = requireString(image.caption, `${path}.caption`);
      if (image.stretch === true) block.stretch = true;
      return block;
    }
    case "artifact": {
      const artifact = isRecord(blockValue) ? blockValue : value;
      const block: Extract<EditorialBlock, { type: "artifact" }> = {
        type: "artifact",
        src: requireThinkingMedia(artifact.src, `${path}.src`),
        alt: requireString(artifact.alt, `${path}.alt`),
      };
      if (artifact.caption !== undefined && artifact.caption !== null) block.caption = requireString(artifact.caption, `${path}.caption`);
      if (artifact.note !== undefined && artifact.note !== null) block.note = requireString(artifact.note, `${path}.note`);
      if (artifact.stretch === true) block.stretch = true;
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
    metadata: validateContentMetadata(value.metadata, `${path}.metadata`),
    label: requireString(value.label, `${path}.label`),
    heading: validateRichText(value.heading, `${path}.heading`),
    introduction: validateRichText(value.introduction, `${path}.introduction`),
    dialogueArtifacts: validateDialogueArtifacts(value.dialogueArtifacts, `${path}.dialogueArtifacts`),
    dialogues: {
      metadata: validateContentMetadata(isRecord(value.dialogues) ? value.dialogues.metadata : undefined, `${path}.dialogues.metadata`),
      label: requireString(isRecord(value.dialogues) ? value.dialogues.label : undefined, `${path}.dialogues.label`),
      heading: validateRichText(isRecord(value.dialogues) ? value.dialogues.heading : undefined, `${path}.dialogues.heading`),
      introduction: validateRichText(isRecord(value.dialogues) ? value.dialogues.introduction : undefined, `${path}.dialogues.introduction`),
      emptyLabel: requireString(isRecord(value.dialogues) ? value.dialogues.emptyLabel : undefined, `${path}.dialogues.emptyLabel`),
    },
    articleLabels: {
      references: requireString(isRecord(value.articleLabels) ? value.articleLabels.references : undefined, `${path}.articleLabels.references`),
      relatedLinks: requireString(isRecord(value.articleLabels) ? value.articleLabels.relatedLinks : undefined, `${path}.articleLabels.relatedLinks`),
    },
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
  const metadata = validateMetadata(value.metadata, `${path}.metadata`);

  return {
    locale: locale as Locale,
    slug,
    translationKey,
    title: requireString(value.title, `${path}.title`),
    excerpt: requireString(value.excerpt, `${path}.excerpt`),
    ...(metadata ? { metadata } : {}),
    status,
    publishedAt,
    order: value.order,
    body: value.body.map((block, index) => validateBlock(block, `${path}.body[${index}]`)),
    references: validateLinks(value.references, `${path}.references`),
    relatedLinks: validateLinks(value.relatedLinks, `${path}.relatedLinks`),
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

function toEditorialArticle(article: ThinkingArticleFile): EditorialArticle {
  return {
    title: article.title,
    slug: article.slug,
    locale: article.locale,
    excerpt: article.excerpt,
    ...(article.metadata ? { metadata: article.metadata } : {}),
    ...(article.publishedAt ? { publishedAt: article.publishedAt } : {}),
    status: article.status,
    body: article.body,
    references: article.references,
    relatedLinks: article.relatedLinks,
  };
}

function articlesFor(repository: ThinkingRepository, locale: Locale, includeDrafts = false) {
  return repository.articles
    .filter((article) => article.locale === locale && (includeDrafts || article.status === "published"))
    .sort((left, right) => left.order - right.order);
}

export function getThinkingContent(locale: Locale, includeDrafts = false): EditorialContent {
  const repository = loadRepository();
  return {
    ...repository.indexes[locale],
    articles: articlesFor(repository, locale, includeDrafts).map(toEditorialArticle),
  };
}

export function getEditorialArticle(locale: Locale, slug: string, includeDrafts = false) {
  const repository = loadRepository();
  const article = articlesFor(repository, locale, includeDrafts).find((candidate) => candidate.slug === slug);
  return article ? toEditorialArticle(article) : undefined;
}

export function getTranslatedThinkingSlug(sourceLocale: Locale, sourceSlug: string, targetLocale: Locale) {
  const repository = loadRepository();
  const source = articlesFor(repository, sourceLocale, true).find((article) => article.slug === sourceSlug);
  if (!source) return undefined;
  return articlesFor(repository, targetLocale, true).find((article) => article.translationKey === source.translationKey)?.slug;
}
