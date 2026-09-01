import Image from "next/image";
import { notFound } from "next/navigation";

import { isLocale } from "@/content/locales";
import { getAuthoringFoundation } from "@/content/site-content";
import { isThinkingAuthoringEnabled } from "@/content/thinking-keystatic.config";

export const dynamic = "force-dynamic";

export default async function AuthoringFoundationPreview({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isThinkingAuthoringEnabled || !isLocale(locale)) notFound();
  const content = getAuthoringFoundation(locale);

  return (
    <main>
      <p>Local authoring preview</p>
      {content.isVisible && <section>
        <h1>{content.title}</h1>
        <p>{content.summary}</p>
        {content.media.map((item) => <figure key={item.src}>
          <Image src={item.src} alt={item.alt} width={640} height={360} unoptimized />
          {item.caption && <figcaption>{item.caption}</figcaption>}
        </figure>)}
        <ol>{content.items.map((item) => <li key={item.order}><a href={item.href}>{item.label}</a></li>)}</ol>
      </section>}
    </main>
  );
}
