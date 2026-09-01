import { createReader } from "@keystatic/core/reader";
import { notFound } from "next/navigation";

import { EditorialArticleView } from "@/components/thinking/EditorialSystem";
import { toEditorialArticle } from "../../../../../../../spikes/gwr-14-keystatic/adapter";
import keystaticConfig, { isGwr14AuthoringEnabled } from "../../../../../../../spikes/gwr-14-keystatic/keystatic.config";

const reader = createReader(process.cwd(), keystaticConfig);

export default async function Gwr14PreviewPage({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  if (!isGwr14AuthoringEnabled) notFound();

  const { slug } = await params;
  const entry = await reader.collections.proofArticles.read(slug);
  if (!entry) notFound();

  return <main><EditorialArticleView article={toEditorialArticle(slug, entry)} /></main>;
}
