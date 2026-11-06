import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IBM_Plex_Sans_Arabic, Noto_Kufi_Arabic } from "next/font/google";
import "../globals.css";
import { archivo, fontVariables, mono } from "@/app/fonts";
import { PageLoader } from "@/components/PageLoader";
import {
  LOCALES,
  OG_LOCALES,
  dirOf,
  hasLocale,
  languageAlternates,
  localePath,
} from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

// Arabic has no glyphs in the Latin display and body fonts, so it gets its own pair.
const arabicDisplay = Noto_Kufi_Arabic({
  variable: "--font-arabic-display",
  subsets: ["arabic"],
  weight: ["500"],
});
const arabicSans = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic-sans",
  subsets: ["arabic"],
  weight: ["400", "500"],
});

const SITE_URL = "https://fatiharch.online";
const OG_IMAGE = `${SITE_URL}/images/og.png`;

/**
 * The drafting intro plays once per visit: later page loads in the same tab
 * session (such as switching language) skip it. Runs before first paint.
 */
const INTRO_ONCE = `try{var s=sessionStorage;if(s.getItem("fs-intro"))document.documentElement.classList.add("intro-seen");else s.setItem("fs-intro","1")}catch(e){}`;

/** Applies a theme the visitor picked with the nav toggle before first paint, so there is no flash. */
const THEME_INIT = `try{var t=localStorage.getItem("fs-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

const firstFamily = (stack: string) => stack.split(",")[0].trim();

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = await getDictionary(lang);

  return {
    metadataBase: new URL(SITE_URL),
    title: meta.title,
    description: meta.description,
    alternates: languageAlternates("/", lang),
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: localePath(lang, "/"),
      siteName: "Fatih Škrijelj",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Fatih Škrijelj — Arhitektura i dizajn enterijera" }],
      locale: OG_LOCALES[lang],
      alternateLocale: LOCALES.filter((l) => l !== lang).map((l) => OG_LOCALES[l]),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [OG_IMAGE],
    },
  };
}

export default async function SiteLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const fonts = [fontVariables];
  let fontVars: Record<string, string> | undefined;
  if (lang === "ar") {
    fonts.push(arabicDisplay.variable, arabicSans.variable);
    // Only the webfont itself: its metric-matched fallback is a system font
    // that has Arabic glyphs and would win over the Arabic webfonts.
    fontVars = {
      "--font-latin-sans": firstFamily(archivo.style.fontFamily),
      "--font-latin-mono": firstFamily(mono.style.fontFamily),
    };
  }

  return (
    <html
      lang={lang}
      dir={dirOf(lang)}
      className={`${fonts.join(" ")} h-full antialiased`}
      style={fontVars}
      // The intro script below may add a class before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT + INTRO_ONCE }} />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <PageLoader role={dict.loader.role} />
        {children}
      </body>
    </html>
  );
}
