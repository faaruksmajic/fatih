import type { Metadata } from "next";
import "./globals.css";
import { display, sans } from "@/app/fonts";

export const metadata: Metadata = {
  title: "404 — Fatih Škrijelj",
  robots: { index: false },
};

/** URLs that match no route at all (outside any language). English, linking home. */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <main className="site not-found">
          <div className="container not-found-inner">
            <p className="eyebrow">404</p>
            <h1>Page not found</h1>
            <p>The page you are looking for does not exist or has moved.</p>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full load into the site's own root layout */}
            <a href="/" className="btn btn-solid">
              Back to the home page
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
