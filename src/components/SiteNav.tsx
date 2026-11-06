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

        <ThemeToggle label={t.theme} />
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
 * Light / dark toggle. Until it is used the site follows the device; a click
 * picks the opposite of what is showing and remembers it (see THEME_INIT in
 * the layout). Which icon shows is decided by CSS, so the server render matches.
 */
function ThemeToggle({ label }: { label: string }) {
  function toggle() {
    const root = document.documentElement;
    const current =
      root.dataset.theme ??
      (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    const next = current === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try {
      localStorage.setItem("fs-theme", next);
    } catch {}
  }

  return (
    <button type="button" className="theme-toggle" aria-label={label} title={label} onClick={toggle}>
      <svg viewBox="0 0 24 24" aria-hidden className="theme-sun" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
      </svg>
      <svg viewBox="0 0 24 24" aria-hidden className="theme-moon" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
      </svg>
    </button>
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
