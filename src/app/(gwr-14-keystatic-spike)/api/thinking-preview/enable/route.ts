import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

import { isLocale } from "@/content/locales";
import { getEditorialArticle } from "@/content/thinking";
import { isThinkingAuthoringEnabled } from "@/content/thinking-keystatic.config";

const disabled = () => new Response("Not found", { status: 404 });

export async function GET(request: Request) {
  if (!isThinkingAuthoringEnabled) return disabled();

  const url = new URL(request.url);
  const locale = url.searchParams.get("locale");
  const slug = url.searchParams.get("slug");
  if (!locale || !isLocale(locale) || !slug || !getEditorialArticle(locale, slug, true)) return disabled();

  const draft = await draftMode();
  draft.enable();
  return NextResponse.redirect(new URL(`/${locale}/thinking/${slug}`, request.url));
}
