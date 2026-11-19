import type { MetadataRoute } from "next";
import { getProjectsSafe } from "@/db/queries";
import { LOCALES, localePath } from "@/i18n/config";
import { absoluteUrl, sitemapLanguages } from "@/lib/seo";

// New projects from the admin show up within the hour.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjectsSafe();
  const latest = projects.reduce<Date | undefined>(
    (max, p) => (!max || p.updatedAt > max ? p.updatedAt : max),
    undefined,
  );

  const home = LOCALES.map((lang) => ({
    url: absoluteUrl(localePath(lang, "/")),
    lastModified: latest,
    changeFrequency: "monthly" as const,
    priority: 1,
    alternates: { languages: sitemapLanguages("/") },
  }));

  const work = projects.flatMap((p) =>
    LOCALES.map((lang) => ({
      url: absoluteUrl(localePath(lang, `/projects/${p.id}`)),
      lastModified: p.updatedAt,
      changeFrequency: "yearly" as const,
      priority: 0.8,
      images: [p.coverImage, ...p.images.map((i) => i.imageUrl)],
      alternates: { languages: sitemapLanguages(`/projects/${p.id}`) },
    })),
  );

  return [...home, ...work];
}
