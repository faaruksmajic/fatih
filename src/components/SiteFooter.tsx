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
 * Closing block shared by every page: the contact pitch with the three-step
 * process, contact details and section links, then the copyright strip.
 */
export function SiteFooter({ lang, t }: { lang: Locale; t: Dictionary }) {
  const href = (path: string) => localePath(lang, path);
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="site-footer" aria-labelledby="contact-title">
      <div className="container">
        <div className="footer-main">
          <div className="footer-intro">
            <p className="eyebrow">{t.contact.eyebrow}</p>
            <h2 id="contact-title">{t.contact.title}</h2>
            <p className="contact-lead">{t.contact.lead}</p>
            <ol className="contact-steps">
              {t.contact.steps.map((step, i) => (
                <li key={step.title}>
                  <span className="contact-step-no" dir="ltr">
                    0{i + 1}
                  </span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="contact-actions">
              <a
                href={`mailto:${EMAIL}?subject=${encodeURIComponent(t.contact.mailSubject)}`}
                className="btn btn-solid"
              >
                {t.contact.getInTouch} <Arrow />
              </a>
              <a href={PHONE_HREF} className="btn btn-outline" dir="ltr">
                {PHONE}
              </a>
            </div>
          </div>

          <div className="footer-side">
            <div className="footer-cell">
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
              <p className="footer-label">{t.footer.navigate}</p>
              <ul className="footer-links">
                {SECTIONS.map(([key, anchor]) => (
                  <li key={key}>
                    <Link href={href(`/#${anchor}`)}>{t.nav[key]}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="footer-strip">
          <Link href={href("/#top")} className="footer-logo" aria-label={t.nav.homeLabel}>
            <span className="footer-logo-mark">
              <Image src="/images/logo.png" alt="" fill sizes="36px" />
            </span>
          </Link>
          <span className="footer-copy">
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
    </footer>
  );
}
