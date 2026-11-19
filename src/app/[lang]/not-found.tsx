import { NotFoundView } from "@/components/NotFoundView";
import { PointerGlow } from "@/components/PointerGlow";
import { SiteNav } from "@/components/SiteNav";
import { DEFAULT_LOCALE, hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { EMAIL } from "@/lib/site";
import { lang as rootLang } from "next/root-params";

/** 404 inside the site, e.g. a project id that does not exist, in the page's language. */
export default async function NotFound() {
  const segment = await rootLang();
  const lang = segment && hasLocale(segment) ? segment : DEFAULT_LOCALE;
  const t = await getDictionary(lang);
  return (
    <main className="site not-found">
      <PointerGlow />
      <SiteNav email={EMAIL} lang={lang} t={t.nav} />
      <NotFoundView lang={lang} t={t} />
    </main>
  );
}
