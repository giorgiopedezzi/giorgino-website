import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { defaultLocale, isLocale } from "@/content/locales";

export default async function IndexPage() {
  const preferredLocale = (await cookies()).get("site-locale")?.value;
  redirect(`/${preferredLocale && isLocale(preferredLocale) ? preferredLocale : defaultLocale}`);
}
