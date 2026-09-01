import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

import { isLocale } from "@/content/locales";
import { getAuthoringFoundation } from "@/content/site-content";
import { isThinkingAuthoringEnabled } from "@/content/thinking-keystatic.config";

const disabled = () => new Response("Not found", { status: 404 });

export async function GET(request: Request) {
  if (!isThinkingAuthoringEnabled) return disabled();
  const locale = new URL(request.url).searchParams.get("locale");
  if (!locale || !isLocale(locale)) return disabled();

  getAuthoringFoundation(locale);
  const draft = await draftMode();
  draft.enable();
  return NextResponse.redirect(new URL(`/${locale}/authoring-foundation`, request.url));
}
