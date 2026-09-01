import { notFound } from "next/navigation";

import { isGwr14AuthoringEnabled } from "../../../../spikes/gwr-14-keystatic/keystatic.config";
import KeystaticApp from "./keystatic";

export default function Gwr14KeystaticLayout() {
  if (!isGwr14AuthoringEnabled) notFound();

  return <KeystaticApp />;
}
