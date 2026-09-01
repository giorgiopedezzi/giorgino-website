import { notFound } from "next/navigation";

import { isThinkingAuthoringEnabled } from "@/content/thinking-keystatic.config";
import KeystaticApp from "./keystatic";

export default function Gwr14KeystaticLayout() {
  if (!isThinkingAuthoringEnabled) notFound();

  return <KeystaticApp />;
}
