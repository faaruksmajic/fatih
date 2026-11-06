import type { CategoryNames } from "@/db/schema";
import { LOCALES, type Locale } from "@/i18n/config";
import { categoryLabel, type Dictionary } from "@/i18n/dictionaries";

export type Category = { id: string; names: CategoryNames };

/** The name in the page's language, or the Bosnian one when that translation is empty. */
export function categoryName(names: CategoryNames, lang: Locale): string {
  return names[lang]?.trim() || names.bs;
}

/** A project's category label: the managed category when linked, else the legacy text. */
export function projectCategoryLabel(
  project: { category: string; categoryNames: CategoryNames | null },
  lang: Locale,
  dict: Dictionary,
): string {
  return project.categoryNames
    ? categoryName(project.categoryNames, lang)
    : categoryLabel(dict, project.category);
}

export type CategoryValidation =
  | { valid: true; names: CategoryNames }
  | { valid: false; error: string };

/** Trims every name, drops empty translations and requires the Bosnian name. */
export function validateCategoryNames(input: Partial<Record<Locale, unknown>>): CategoryValidation {
  const names: Partial<CategoryNames> = {};
  for (const lang of LOCALES) {
    const value = typeof input[lang] === "string" ? (input[lang] as string).trim() : "";
    if (value.length > 80) return { valid: false, error: "Names can be at most 80 characters." };
    if (value) names[lang] = value;
  }
  if (!names.bs) return { valid: false, error: "The Bosnian name is required." };
  return { valid: true, names: names as CategoryNames };
}
