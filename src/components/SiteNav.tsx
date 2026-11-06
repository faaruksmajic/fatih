"use client";

import Link from "next/link";
import { AfMark } from "@/components/AfMark";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LOCALES,
  LOCALE_NAMES,
  localePath,
  stripLocale,
  type Locale,
} from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

const SECTIONS = ["home", "about", "services", "projects", "tools"] as const;
const ANCHOR: Record<(typeof SECTIONS)[number], string> = {
  home: "top",
  about: "about",
  services: "services",
  projects: "projects",
  tools: "tools",
};

export function SiteNav({
  email,
  lang,
  t,
}: {
  email: string;
  lang: Locale;
  t: Dictionary["nav"];
}) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const href = (path: string) => localePath(lang, path);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${solid || open ? "is-solid" : ""}`}>
      <div className="nav-inner">
        <Link href={href("/#top")} className="logo" aria-label={t.homeLabel}>
          <AfMark className="logo-mark" line={14} />
          <span className="logo-text">
            <span className="logo-name" dir="ltr">
              Fatih Škrijelj
            </span>
            <span className="logo-sub">{t.logoSub}</span>
          </span>
        </Link>

        <nav aria-label={t.main} className={`nav-links ${open ? "is-open" : ""}`}>
          {SECTIONS.map((key) => (
            <Link
              key={key}
              href={href(`/#${ANCHOR[key]}`)}
              onClick={() => setOpen(false)}
            >
              {t[key]}
            </Link>
          ))}
          <Link
            href={href("/#contact")}
            className="nav-contact-mobile"
            onClick={() => setOpen(false)}
          >
            {t.contact}
          </Link>
        </nav>

        <a
          href={`mailto:${email}?subject=${encodeURIComponent(t.mailSubject)}`}
          className="btn btn-solid nav-cta"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
            <rect
              x="3"
              y="5"
              width="18"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M3 6 L12 13 L21 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </svg>
          {t.contact}
        </a>

        <LanguageSwitch lang={lang} label={t.language} />

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-label={open ? t.closeMenu : t.openMenu}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

/**
 * Language menu: plain links to the same page in each language, so it works
 * without JavaScript and search engines can follow every version. Switching
 * loads the page fresh, since the language also sets the text direction.
 */
function LanguageSwitch({ lang, label }: { lang: Locale; label: string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const path = stripLocale(usePathname() ?? "/");

  // Close when clicking anywhere else or pressing Escape.
  useEffect(() => {
    const close = (e: Event) => {
      const el = ref.current;
      if (!el?.open) return;
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !el.contains(e.target as Node)) {
        el.open = false;
      }
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", close);
    };
  }, []);

  return (
    <details ref={ref} className="lang-switch">
      <summary aria-label={`${label}: ${LOCALE_NAMES[lang].name}`}>
        <svg viewBox="0 0 24 24" aria-hidden className="lang-globe">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
        </svg>
        {LOCALE_NAMES[lang].short}
      </summary>
      <ul className="lang-menu" aria-label={label}>
        {LOCALES.map((l) => (
          <li key={l}>
            <a
              href={localePath(l, path)}
              hrefLang={l}
              lang={l}
              aria-current={l === lang ? "true" : undefined}
            >
              <span className="lang-code">{LOCALE_NAMES[l].short}</span>
              {LOCALE_NAMES[l].name}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
