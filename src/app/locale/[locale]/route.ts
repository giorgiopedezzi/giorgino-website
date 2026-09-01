import { NextResponse } from "next/server";

import { defaultLocale, isLocale } from "@/content/locales";
import { getLocalePath } from "@/content/locale-routing";

export async function GET(request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const requestUrl = new URL(request.url);
  const returnTo = requestUrl.searchParams.get("returnTo");
  const destination = isLocale(locale) && returnTo ? getLocalePath(returnTo, locale) : `/${isLocale(locale) ? locale : defaultLocale}`;
  const response = NextResponse.redirect(new URL(destination, requestUrl));

  if (isLocale(locale)) {
    response.cookies.set("site-locale", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}
