import type { Metadata } from "next";

import reallyAboutMeStyles from "@/components/about/ReallyAboutMe.module.css";
import homePageStyles from "@/components/home/HomePage.module.css";
import "./globals.css";

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${homePageStyles.preload} ${reallyAboutMeStyles.preload}`}>{children}</body>
    </html>
  );
}
