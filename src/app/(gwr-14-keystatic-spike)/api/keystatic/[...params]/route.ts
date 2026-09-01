import { makeRouteHandler } from "@keystatic/next/route-handler";

import keystaticConfig, { isGwr14AuthoringEnabled } from "../../../../../../spikes/gwr-14-keystatic/keystatic.config";

const handlers = makeRouteHandler({ config: keystaticConfig });
const disabled = () => new Response("Not found", { status: 404 });

export const GET = isGwr14AuthoringEnabled ? handlers.GET : disabled;
export const POST = isGwr14AuthoringEnabled ? handlers.POST : disabled;
