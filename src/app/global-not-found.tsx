import type { Metadata } from "next";
import "./globals.css";
import "./apple.css";
import { fontVariables } from "@/app/fonts";
import { NotFoundView } from "@/components/NotFoundView";
import { getDictionary } from "@/i18n/dictionaries";

export const metadata: Metadata = {
  title: "404 — Fatih Škrijelj",
  robots: { index: false },
};

/** URLs that match no route at all (outside any language). English, linking home. */
export default async function GlobalNotFound() {
  const t = await getDictionary("en");
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <main className="site not-found">
          <NotFoundView lang="en" t={t} plain />
        </main>
      </body>
    </html>
  );
}
