/**
 * One-off: turns the projects' free-text categories into managed categories.
 * Creates one category per distinct text (translated from the site dictionaries
 * when the text is a known key such as "Residential"), then links each project.
 * Safe to re-run: existing categories with the same Bosnian name are reused and
 * already-linked projects are left alone.
 *
 *   npx tsx --env-file=.env.production.local scripts/migrate-categories.ts
 */
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "../src/db/client";
import { categories, projects, type CategoryNames } from "../src/db/schema";
import { LOCALES } from "../src/i18n/config";
import bs from "../src/i18n/messages/bs.json";
import en from "../src/i18n/messages/en.json";
import de from "../src/i18n/messages/de.json";
import tr from "../src/i18n/messages/tr.json";
import ar from "../src/i18n/messages/ar.json";

const DICTS = { bs, en, de, tr, ar } as const;

/** Names in every language for a legacy text, or the text itself as the Bosnian name. */
export function namesFor(text: string): CategoryNames {
  const key = text.trim().toLowerCase();
  if (key in bs.categories) {
    return Object.fromEntries(
      LOCALES.map((lang) => [lang, (DICTS[lang].categories as Record<string, string>)[key]]),
    ) as CategoryNames;
  }
  return { bs: text.trim() };
}

/** Finds a category by its Bosnian name or creates it at the end of the list. */
export async function ensureCategory(names: CategoryNames): Promise<string> {
  const existing = await db.select().from(categories);
  const match = existing.find((c) => c.names.bs.toLowerCase() === names.bs.toLowerCase());
  if (match) return match.id;
  const [created] = await db
    .insert(categories)
    .values({ names, position: existing.length })
    .returning({ id: categories.id });
  return created.id;
}

/** Links every project without a category to one made from its legacy text. */
export async function linkLegacyCategories() {
  const unlinked = await db
    .select({ id: projects.id, category: projects.category })
    .from(projects)
    .where(isNull(projects.categoryId))
    .orderBy(asc(projects.position), asc(projects.createdAt));

  for (const project of unlinked) {
    const names = namesFor(project.category);
    const categoryId = await ensureCategory(names);
    await db
      .update(projects)
      .set({ categoryId, category: names.bs })
      .where(and(eq(projects.id, project.id), isNull(projects.categoryId)));
    console.log(`"${project.category}" -> ${names.bs} (${categoryId})`);
  }
  console.log(`Linked ${unlinked.length} project(s).`);
}

if (process.argv[1]?.endsWith("migrate-categories.ts")) {
  linkLegacyCategories()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
