import type { Metadata } from "next";

import reallyAboutMeStyles from "@/components/about/ReallyAboutMe.module.css";
import homePageStyles from "@/components/home/HomePage.module.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Giorgio Pedezzi",
  description: "Notes from the in-between.",
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
