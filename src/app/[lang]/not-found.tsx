import Link from "next/link";
import { Arrow } from "@/components/Hero";
import { DEFAULT_LOCALE, hasLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { lang as rootLang } from "next/root-params";

/** 404 inside the site, e.g. a project id that does not exist, in the page's language. */
export default async function NotFound() {
  const segment = await rootLang();
  const lang = segment && hasLocale(segment) ? segment : DEFAULT_LOCALE;
  const t = (await getDictionary(lang)).notFound;
  return (
    <main className="site not-found">
      <div className="container not-found-inner">
        <p className="eyebrow">404</p>
        <h1>{t.title}</h1>
        <p>{t.body}</p>
        <Link href={localePath(lang, "/")} className="btn btn-solid">
          {t.home} <Arrow />
        </Link>
      </div>
    </main>
  );
}
