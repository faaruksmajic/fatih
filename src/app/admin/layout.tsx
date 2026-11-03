import type { Metadata } from "next";
import "../globals.css";
import { display, sans } from "@/app/fonts";

export const metadata: Metadata = {
  title: "Admin — Fatih Škrijelj",
  robots: { index: false, follow: false },
};

/** Root layout for the admin area, which is English only and outside the localized site. */
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">{children}</body>
    </html>
  );
}
