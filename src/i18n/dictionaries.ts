import type { Locale } from "./config";
import type en from "./messages/en.json";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./messages/en.json").then((m) => m.default),
  bs: () => import("./messages/bs.json").then((m) => m.default),
  de: () => import("./messages/de.json").then((m) => m.default),
  tr: () => import("./messages/tr.json").then((m) => m.default),
  ar: () => import("./messages/ar.json").then((m) => m.default),
};

export const getDictionary = (locale: Locale) => dictionaries[locale]();

/** Project categories come from the CMS in English; show known ones translated. */
export function categoryLabel(dict: Dictionary, category: string): string {
  const map = dict.categories as Record<string, string>;
  return map[category.trim().toLowerCase()] ?? category;
}
