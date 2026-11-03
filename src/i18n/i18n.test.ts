import { describe, expect, it } from "vitest";
import { LOCALES, fmt, localePath, stripLocale } from "./config";
import en from "./messages/en.json";
import bs from "./messages/bs.json";
import de from "./messages/de.json";
import tr from "./messages/tr.json";
import ar from "./messages/ar.json";

const MESSAGES = { en, bs, de, tr, ar };

/** Every leaf key path, with array lengths, so a missing or extra entry shows up. */
function shape(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return [`${prefix}[${value.length}]`, ...value.flatMap((v, i) => shape(v, `${prefix}[${i}]`))];
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => shape(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}

/** Every string in a dictionary, by its key path. */
function strings(value: unknown, prefix = "", out = new Map<string, string>()) {
  if (typeof value === "string") out.set(prefix, value);
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) strings(v, `${prefix}.${k}`, out);
  }
  return out;
}

const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();

describe("translations", () => {
  it("has a dictionary for every locale", () => {
    expect(Object.keys(MESSAGES).sort()).toEqual([...LOCALES].sort());
  });

  for (const [locale, dict] of Object.entries(MESSAGES)) {
    it(`${locale} has the same keys as English`, () => {
      expect(shape(dict).sort()).toEqual(shape(en).sort());
    });

    it(`${locale} keeps every {placeholder}`, () => {
      const enStrings = strings(en);
      const localeStrings = strings(dict);
      for (const [path, source] of enStrings) {
        expect(placeholders(localeStrings.get(path) ?? ""), `${locale}: ${path}`).toEqual(
          placeholders(source),
        );
      }
    });
  }
});

describe("locale paths", () => {
  it("keeps English unprefixed and prefixes other languages", () => {
    expect(localePath("en", "/")).toBe("/");
    expect(localePath("en", "/#about")).toBe("/#about");
    expect(localePath("de", "/")).toBe("/de");
    expect(localePath("de", "/#about")).toBe("/de#about");
    expect(localePath("ar", "/projects/7")).toBe("/ar/projects/7");
  });

  it("strips a language prefix", () => {
    expect(stripLocale("/tr/projects/7")).toBe("/projects/7");
    expect(stripLocale("/bs")).toBe("/");
    expect(stripLocale("/projects/7")).toBe("/projects/7");
    expect(stripLocale("/")).toBe("/");
  });

  it("fills placeholders", () => {
    expect(fmt("All projects ({count})", { count: 4 })).toBe("All projects (4)");
    expect(fmt("{a} {missing}", { a: 1 })).toBe("1 {missing}");
  });
});
