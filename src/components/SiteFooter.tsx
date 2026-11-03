import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/Hero";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { EMAIL, PHONE, PHONE_HREF } from "@/lib/site";

const SECTIONS = [
  ["home", "top"],
  ["about", "about"],
  ["services", "services"],
  ["projects", "projects"],
  ["tools", "tools"],
] as const;

/**
 * Site footer, drawn as the title block of an architectural sheet: hairline
 * frame on graph paper, numbered fields, and a strip along the bottom.
 */
export function SiteFooter({ lang, t }: { lang: Locale; t: Dictionary }) {
  const href = (path: string) => localePath(lang, path);
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-sheet">
          <div className="footer-cell footer-brand">
            <span className="footer-no">F-01</span>
            <Link href={href("/#top")} className="footer-logo" aria-label={t.nav.homeLabel}>
              <span className="footer-logo-mark">
                <Image src="/images/logo.png" alt="" fill sizes="56px" />
              </span>
              <span className="footer-logo-name" dir="ltr">
                Fatih Škrijelj
              </span>
            </Link>
            <p className="footer-tagline">{t.hero.eyebrow}</p>
            <a
              href={`mailto:${EMAIL}?subject=${encodeURIComponent(t.contact.mailSubject)}`}
              className="text-link footer-cta"
            >
              {t.contact.getInTouch} <Arrow />
            </a>
          </div>

          <div className="footer-cell">
            <span className="footer-no">F-02</span>
            <p className="footer-label">{t.nav.contact}</p>
            <dl className="footer-facts">
              <div>
                <dt>{t.contact.email}</dt>
                <dd>
                  <a href={`mailto:${EMAIL}`} dir="ltr">
                    {EMAIL}
                  </a>
                </dd>
              </div>
              <div>
                <dt>{t.contact.phone}</dt>
                <dd>
                  <a href={PHONE_HREF} dir="ltr">
                    {PHONE}
                  </a>
                </dd>
              </div>
              <div>
                <dt>{t.contact.location}</dt>
                <dd>{t.contact.locationValue}</dd>
              </div>
            </dl>
          </div>

          <nav className="footer-cell" aria-label={t.footer.navigate}>
            <span className="footer-no">F-03</span>
            <p className="footer-label">{t.footer.navigate}</p>
            <ul className="footer-links">
              {SECTIONS.map(([key, anchor]) => (
                <li key={key}>
                  <Link href={href(`/#${anchor}`)}>{t.nav[key]}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-strip">
            <span>
              © {year} <bdi>Fatih Škrijelj</bdi>. {t.contact.rights}
            </span>
            <span className="footer-coords" dir="ltr">
              43.8563° N · 18.4131° E
            </span>
            <a href="#top" className="footer-top">
              {t.footer.backToTop} <span aria-hidden>↑</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

