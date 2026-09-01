import { makeRouteHandler } from "@keystatic/next/route-handler";

import keystaticConfig, { isThinkingAuthoringEnabled } from "@/content/thinking-keystatic.config";
import { validateThinkingAuthoringUpdate } from "@/content/thinking-authoring-validation";

const handlers = makeRouteHandler({ config: keystaticConfig });
const disabled = () => new Response("Not found", { status: 404 });

export const GET = isThinkingAuthoringEnabled ? handlers.GET : disabled;

export async function POST(request: Request) {
  if (!isThinkingAuthoringEnabled) return disabled();
  if (new URL(request.url).pathname.endsWith("/update")) {
    try {
      validateThinkingAuthoringUpdate(await request.clone().json());
    } catch (error) {
      return new Response(error instanceof Error ? error.message : "Invalid Thinking authoring update", { status: 400 });
    }
  }
  return handlers.POST(request);
}
