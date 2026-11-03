/**
 * Languages the public site is published in. English is the default and keeps
 * the unprefixed URLs (/, /projects/…); every other language lives under its
 * own prefix (/bs, /de, /tr, /ar).
 */
export const LOCALES = ["en", "bs", "de", "tr", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** Right-to-left scripts. */
const RTL: ReadonlySet<Locale> = new Set(["ar"]);

/** Names shown in the language switcher, each in its own language. */
export const LOCALE_NAMES: Record<Locale, { short: string; name: string }> = {
  en: { short: "EN", name: "English" },
  bs: { short: "BHS", name: "Bosanski / Hrvatski / Srpski" },
  de: { short: "DE", name: "Deutsch" },
  tr: { short: "TR", name: "Türkçe" },
  ar: { short: "AR", name: "العربية" },
};

/** Open Graph locale tags. */
export const OG_LOCALES: Record<Locale, string> = {
  en: "en_US",
  bs: "bs_BA",
  de: "de_DE",
  tr: "tr_TR",
  ar: "ar_AR",
};

export function hasLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function dirOf(locale: Locale): "rtl" | "ltr" {
  return RTL.has(locale) ? "rtl" : "ltr";
}

/**
 * The public URL of a site path in a language: "/#about" → "/de#about",
 * "/projects/7" → "/tr/projects/7". English paths stay as they are.
 */
export function localePath(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return path;
  if (path === "/") return `/${locale}`;
  if (path.startsWith("/#")) return `/${locale}${path.slice(1)}`;
  return `/${locale}${path}`;
}

/** Strips a language prefix: "/de/projects/7" → "/projects/7". */
export function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split("/");
  if (first && hasLocale(first)) return `/${rest.join("/")}`;
  return pathname || "/";
}

/** Fills {name} placeholders. */
export function fmt(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (m, key: string) =>
    key in values ? String(values[key]) : m,
  );
}

/** Canonical URL and hreflang links for a site path in every language. */
export function languageAlternates(path: string, locale: Locale) {
  return {
    canonical: localePath(locale, path),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, localePath(l, path)])),
      "x-default": localePath(DEFAULT_LOCALE, path),
    },
  };
}
