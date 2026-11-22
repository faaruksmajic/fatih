import type { Metadata } from "next";
import "../globals.css";
import "./admin.css";
import { fontVariables } from "@/app/fonts";

export const metadata: Metadata = {
  title: "Backoffice — Fatih Škrijelj",
  robots: { index: false, follow: false },
};

/** Root layout for the admin area, which is English only and outside the localized site. */
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
