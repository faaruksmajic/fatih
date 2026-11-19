import { LOCALES, localePath, type Locale } from "@/i18n/config";
import { EMAIL, PHONE, SOCIAL } from "@/lib/site";

/** The one public origin: canonicals, hreflang, sitemap and JSON-LD all use it. */
export const SITE_URL = "https://fatiharch.online";
export const OG_IMAGE = `${SITE_URL}/images/og-square.png`;
export const PERSON_NAME = "Fatih Škrijelj";

export const absoluteUrl = (path: string) =>
  path === "/" ? SITE_URL : `${SITE_URL}${path}`;

/** hreflang map for a site path, including the page itself and x-default. */
export function sitemapLanguages(path: string) {
  return {
    ...Object.fromEntries(LOCALES.map((l) => [l, absoluteUrl(localePath(l, path))])),
    "x-default": absoluteUrl(localePath("en", path)),
  };
}

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** Who the site is about: lets Google connect the name, socials and work. */
export function personJsonLd(lang: Locale, jobTitle: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: PERSON_NAME,
        alternateName: "Fatih Skrijelj",
        url: SITE_URL,
        image: `${SITE_URL}/images/hero-portrait.jpg`,
        jobTitle,
        description,
        email: `mailto:${EMAIL}`,
        telephone: PHONE.replace(/\s/g, ""),
        address: {
          "@type": "PostalAddress",
          addressLocality: "Sarajevo",
          addressCountry: "BA",
        },
        knowsAbout: [
          "Architecture",
          "Interior design",
          "3D visualization",
          "Architectural rendering",
        ],
        sameAs: SOCIAL.filter((s) => s.id !== "whatsapp" && s.href).map((s) => s.href),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: PERSON_NAME,
        inLanguage: [...LOCALES],
        publisher: { "@id": PERSON_ID },
      },
      {
        "@type": "ProfilePage",
        url: absoluteUrl(localePath(lang, "/")),
        inLanguage: lang,
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": PERSON_ID },
      },
    ],
  };
}

/** A project page as a creative work by the person, with a breadcrumb back home. */
export function projectJsonLd(
  lang: Locale,
  project: { id: string; title: string; description: string; images: string[]; createdAt?: Date; updatedAt?: Date },
  homeName: string,
  genre?: string,
) {
  const url = absoluteUrl(localePath(lang, `/projects/${project.id}`));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${url}#work`,
        url,
        name: project.title,
        description: project.description,
        image: project.images,
        genre,
        inLanguage: lang,
        creator: { "@id": PERSON_ID, "@type": "Person", name: PERSON_NAME },
        dateCreated: project.createdAt?.toISOString(),
        dateModified: project.updatedAt?.toISOString(),
        isPartOf: { "@id": WEBSITE_ID },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: homeName, item: absoluteUrl(localePath(lang, "/")) },
          { "@type": "ListItem", position: 2, name: project.title, item: url },
        ],
      },
    ],
  };
}

/** Serialises JSON-LD safely for a <script> tag. */
export const jsonLdHtml = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");
