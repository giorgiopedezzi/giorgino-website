import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { validateContentMetadata } from "./content-metadata";
import { resolveEditorialHub, validateEditorialHubSource, type EditorialHubEntrySource, type EditorialHubSource } from "./editorial-hub";
import { locales, type Locale } from "./locales";
import { richTextToPlainText, validateRichText } from "./rich-text";
import type { DialogueArtifact, EditorialArticle, EditorialBlock, EditorialContent, EditorialLink, EditorialMetadata, MediaPresentation } from "./types";

type ThinkingIndexFile = { hub: EditorialHubSource; articleLabels: { references: string; relatedLinks: string } };
type DialoguesFile = {
  metadata: EditorialContent["metadata"];
  label: string;
  heading: EditorialContent["heading"];
  introduction: NonNullable<EditorialContent["introduction"]>;
  emptyLabel: string;
  artifacts: DialogueArtifact[];
};
type ThinkingArticleFile = Omit<EditorialArticle, "publishedAt"> & { publishedAt: string | null; translationKey: string; order: number };
type ThinkingRepository = { indexes: Record<Locale, ThinkingIndexFile>; dialogues: Record<Locale, DialoguesFile>; articles: ThinkingArticleFile[] };

const contentRoot = join(process.cwd(), "src", "content", "thinking");
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function fail(path: string, message: string): never { throw new Error(`Thinking content validation failed at ${path}: ${message}`); }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function requireString(value: unknown, path: string) { if (typeof value !== "string" || value.trim() === "") fail(path, "expected a non-empty string"); return value; }
function requireSafeLink(value: unknown, path: string) {
  const href = requireString(value, path);
  if (!href.startsWith("/") && !/^https?:\/\//i.test(href)) fail(path, "must be an internal path or an http(s) URL");
  return href;
}
function requireThinkingMedia(value: unknown, path: string) {
  const src = requireString(value, path);
  if (!src.startsWith("/thinking-media/")) fail(path, "must reference a repository-owned /thinking-media/ asset");
  return src;
}
function imageAccessibility(value: Record<string, unknown>, path: string) {
  const decorative = value.decorative === true;
  const alt = value.alt;
  if (decorative && alt !== undefined && alt !== null && alt !== "") fail(`${path}.alt`, "must be empty when decorative is selected");
  if (!decorative && (typeof alt !== "string" || alt.trim() === "")) fail(`${path}.alt`, "is required for informative images");
  return { alt: decorative ? "" : alt as string, ...(decorative ? { decorative: true } : {}) };
}
function imagePresentation(value: unknown, path: string): MediaPresentation | undefined {
  if (value === undefined || value === null || value === "default") return undefined;
  if (value === "wide" || value === "full") return value;
  fail(path, "must be a supported semantic presentation value");
}
function isKeystaticBlock(value: unknown): value is { discriminant: string; value: unknown } { return isRecord(value) && typeof value.discriminant === "string" && "value" in value; }

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
  const textValue = isKeystaticBlock(value) ? blockValue : isRecord(blockValue) ? blockValue.text : blockValue;
  switch (type) {
    case "paragraph": return { type, text: validateRichText(textValue, `${path}.text`) };
    case "heading":
    case "note": return { type, text: validateRichText(textValue, `${path}.text`) };
    case "quote": {
      const quote = isRecord(blockValue) ? blockValue : value;
      const block: Extract<EditorialBlock, { type: "quote" }> = { type, text: validateRichText(quote.text, `${path}.text`) };
      if (quote.attribution !== undefined && quote.attribution !== null) block.attribution = requireString(quote.attribution, `${path}.attribution`);
      return block;
    }
    case "image": {
      const image = isRecord(blockValue) ? blockValue : value;
      const block: Extract<EditorialBlock, { type: "image" }> = { type, src: requireThinkingMedia(image.src, `${path}.src`), ...imageAccessibility(image, path) };
      if (image.caption !== undefined && image.caption !== null) block.caption = requireString(image.caption, `${path}.caption`);
      const presentation = imagePresentation(image.presentation, `${path}.presentation`);
      if (presentation) block.presentation = presentation;
      if (image.stretch === true) block.stretch = true;
      return block;
    }
    case "artifact": {
      const artifact = isRecord(blockValue) ? blockValue : value;
      const block: Extract<EditorialBlock, { type: "artifact" }> = { type, src: requireThinkingMedia(artifact.src, `${path}.src`), ...imageAccessibility(artifact, path) };
      if (artifact.caption !== undefined && artifact.caption !== null) block.caption = requireString(artifact.caption, `${path}.caption`);
      if (artifact.note !== undefined && artifact.note !== null) block.note = requireString(artifact.note, `${path}.note`);
      const presentation = imagePresentation(artifact.presentation, `${path}.presentation`);
      if (presentation) block.presentation = presentation;
      if (artifact.stretch === true) block.stretch = true;
      return block;
    }
    case "divider": return { type };
    default: return fail(`${path}.type`, `unsupported block type "${type}"`);
  }
}

function validateIndex(value: unknown, path: string): ThinkingIndexFile {
  if (!isRecord(value)) fail(path, "expected an object");
  return {
    hub: validateEditorialHubSource(value, path),
    articleLabels: {
      references: requireString(isRecord(value.articleLabels) ? value.articleLabels.references : undefined, `${path}.articleLabels.references`),
      relatedLinks: requireString(isRecord(value.articleLabels) ? value.articleLabels.relatedLinks : undefined, `${path}.articleLabels.relatedLinks`),
    },
  };
}

function validateDialogues(value: unknown, path: string): DialoguesFile {
  if (!isRecord(value)) fail(path, "expected an object");
  return {
    metadata: validateContentMetadata(value.metadata, `${path}.metadata`),
    label: requireString(value.label, `${path}.label`),
    heading: validateRichText(value.heading, `${path}.heading`),
    introduction: validateRichText(value.introduction, `${path}.introduction`),
    emptyLabel: requireString(value.emptyLabel, `${path}.emptyLabel`),
    artifacts: validateDialogueArtifacts(value.artifacts, `${path}.artifacts`),
  };
}

function validateArticle(value: unknown, path: string): ThinkingArticleFile {
  if (!isRecord(value)) fail(path, "expected an object");
  const locale = requireString(value.locale, `${path}.locale`);
  if (!locales.includes(locale as Locale)) fail(`${path}.locale`, `unsupported locale "${locale}"`);
  const slug = requireString(value.slug, `${path}.slug`);
  if (!slugPattern.test(slug)) fail(`${path}.slug`, "must be a lowercase URL slug");
  const translationKey = requireString(value.translationKey, `${path}.translationKey`);
  if (!slugPattern.test(translationKey)) fail(`${path}.translationKey`, "must be a lowercase stable identity");
  const status = requireString(value.status, `${path}.status`);
  if (status !== "draft" && status !== "published") fail(`${path}.status`, `unsupported status "${status}"`);
  const publishedAt = value.publishedAt ?? null;
  if (publishedAt !== null && (typeof publishedAt !== "string" || !isoDatePattern.test(publishedAt))) fail(`${path}.publishedAt`, "must be an ISO date (YYYY-MM-DD) or null");
  if (status === "published" && publishedAt === null) fail(`${path}.publishedAt`, "is required when status is published");
  if (value.order !== undefined && (typeof value.order !== "number" || !Number.isInteger(value.order) || value.order < 1)) fail(`${path}.order`, "must be a positive integer when present");
  if (!Array.isArray(value.body)) fail(`${path}.body`, "expected an array");
  const metadata = validateMetadata(value.metadata, `${path}.metadata`);
  return {
    locale: locale as Locale, slug, translationKey,
    title: requireString(value.title, `${path}.title`),
    excerpt: requireString(value.excerpt, `${path}.excerpt`),
    ...(metadata ? { metadata } : {}), status, publishedAt, order: typeof value.order === "number" ? value.order : Number.MAX_SAFE_INTEGER,
    body: value.body.map((block, index) => validateBlock(block, `${path}.body[${index}]`)),
    references: validateLinks(value.references, `${path}.references`),
    relatedLinks: validateLinks(value.relatedLinks, `${path}.relatedLinks`),
  };
}

function targetSlug(target: string) { return target.split("/").filter(Boolean).at(-1) ?? target; }
function resolveThinkingEntry(entry: EditorialHubEntrySource, entryPath: string, locale: Locale, articles: ThinkingArticleFile[], dialogues: DialoguesFile, includeDrafts: boolean) {
  if (entry.kind === "dialogues") return {
    identity: "thinking:dialogues", href: `/${locale}/thinking/dialogues`,
    fallbackTitle: richTextToPlainText(dialogues.heading), fallbackSummary: richTextToPlainText(dialogues.introduction), available: true,
  };
  if (entry.kind !== "article") fail(`${entryPath}.kind`, `unsupported Thinking target kind "${entry.kind}"`);
  const target = entry.target;
  if (!target) fail(`${entryPath}.target`, "is required for a Thinking article");
  const article = articles.find((candidate) => candidate.locale === locale && candidate.slug === targetSlug(target));
  if (!article) fail(`${entryPath}.target`, `does not identify an article in locale ${locale}`);
  return {
    identity: `thinking-article:${article.translationKey}`, href: `/${locale}/thinking/${article.slug}`,
    fallbackTitle: article.title, fallbackSummary: article.excerpt, available: includeDrafts || article.status === "published",
  };
}

export function validateThinkingRepository(indexes: Record<Locale, unknown>, dialogues: Record<Locale, unknown>, articles: Array<{ path: string; value: unknown }>): ThinkingRepository {
  const validatedArticles = articles.map(({ path, value }) => validateArticle(value, path));
  const validatedDialogues = Object.fromEntries(locales.map((locale) => [locale, validateDialogues(dialogues[locale], `${locale}/dialogues.json`)])) as Record<Locale, DialoguesFile>;
  const validatedIndexes = Object.fromEntries(locales.map((locale) => [locale, validateIndex(indexes[locale], `${locale}/index.json`)])) as Record<Locale, ThinkingIndexFile>;
  const seenLocaleSlugs = new Set<string>();
  const translationLocales = new Map<string, Set<Locale>>();
  for (const article of validatedArticles) {
    const localeSlug = `${article.locale}:${article.slug}`;
    if (seenLocaleSlugs.has(localeSlug)) fail(article.slug, `duplicate slug for locale ${article.locale}`);
    seenLocaleSlugs.add(localeSlug);
    const translatedLocales = translationLocales.get(article.translationKey) ?? new Set<Locale>();
    if (translatedLocales.has(article.locale)) fail(article.translationKey, `duplicate translation identity for locale ${article.locale}`);
    translatedLocales.add(article.locale);
    translationLocales.set(article.translationKey, translatedLocales);
  }
  for (const [translationKey, translatedLocales] of translationLocales) {
    if (translatedLocales.size !== locales.length && validatedArticles.some((article) => article.translationKey === translationKey && article.status === "published")) fail(translationKey, "must have exactly one entry for every supported locale before publication");
  }
  for (const locale of locales) resolveEditorialHub(validatedIndexes[locale].hub, `${locale}/index.json`, (entry, path) => resolveThinkingEntry(entry, path, locale, validatedArticles, validatedDialogues[locale], true));
  return { indexes: validatedIndexes, dialogues: validatedDialogues, articles: validatedArticles };
}

function readJson(path: string): unknown {
  try { return JSON.parse(readFileSync(path, "utf8")); }
  catch (error) { fail(path, `could not read JSON (${error instanceof Error ? error.message : String(error)})`); }
}
function loadRepository(): ThinkingRepository {
  const indexes = Object.fromEntries(locales.map((locale) => [locale, readJson(join(contentRoot, locale, "index.json"))])) as Record<Locale, unknown>;
  const dialogues = Object.fromEntries(locales.map((locale) => [locale, readJson(join(contentRoot, locale, "dialogues.json"))])) as Record<Locale, unknown>;
  const articles = locales.flatMap((locale) => readdirSync(join(contentRoot, locale, "articles")).filter((name) => name.endsWith(".json")).sort().map((name) => ({ path: `${locale}/articles/${name}`, value: readJson(join(contentRoot, locale, "articles", name)) })));
  return validateThinkingRepository(indexes, dialogues, articles);
}
function toEditorialArticle(article: ThinkingArticleFile): EditorialArticle {
  return { title: article.title, slug: article.slug, locale: article.locale, excerpt: article.excerpt, ...(article.metadata ? { metadata: article.metadata } : {}), ...(article.publishedAt ? { publishedAt: article.publishedAt } : {}), status: article.status, body: article.body, references: article.references, relatedLinks: article.relatedLinks };
}
function articlesFor(repository: ThinkingRepository, locale: Locale, includeDrafts = false) { return repository.articles.filter((article) => article.locale === locale && (includeDrafts || article.status === "published")).sort((left, right) => left.order - right.order); }

export function getThinkingContent(locale: Locale, includeDrafts = false): EditorialContent {
  const repository = loadRepository();
  const dialogues = repository.dialogues[locale];
  const hub = resolveEditorialHub(repository.indexes[locale].hub, `${locale}/index.json`, (entry, path) => resolveThinkingEntry(entry, path, locale, repository.articles, dialogues, includeDrafts));
  return {
    ...hub,
    articles: articlesFor(repository, locale, includeDrafts).map(toEditorialArticle),
    dialogueArtifacts: dialogues.artifacts,
    dialogues: { metadata: dialogues.metadata, label: dialogues.label, heading: dialogues.heading, introduction: dialogues.introduction, emptyLabel: dialogues.emptyLabel },
    articleLabels: repository.indexes[locale].articleLabels,
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
  return articlesFor(repository, targetLocale).find((article) => article.translationKey === source.translationKey)?.slug;
}
