import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

import { isThinkingAuthoringEnabled } from "@/content/thinking-keystatic.config";

const disabled = () => new Response("Not found", { status: 404 });

export async function GET(request: Request) {
  if (!isThinkingAuthoringEnabled) return disabled();

  const draft = await draftMode();
  draft.disable();
  return NextResponse.redirect(new URL("/en/thinking", request.url));
}
