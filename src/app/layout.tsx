import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
