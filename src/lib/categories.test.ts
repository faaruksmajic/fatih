import { describe, expect, it } from "vitest";
import { categoryName, validateCategoryNames } from "./categories";

describe("validateCategoryNames", () => {
  it("requires the Bosnian name", () => {
    expect(validateCategoryNames({ en: "Drawings" })).toEqual({
      valid: false,
      error: "The Bosnian name is required.",
    });
  });

  it("trims names and drops empty translations", () => {
    expect(validateCategoryNames({ bs: "  Tehnički crteži ", en: "Technical drawings", de: "  " })).toEqual({
      valid: true,
      names: { bs: "Tehnički crteži", en: "Technical drawings" },
    });
  });

  it("rejects overly long names", () => {
    expect(validateCategoryNames({ bs: "x".repeat(81) }).valid).toBe(false);
  });
});

describe("categoryName", () => {
  const names = { bs: "Animacije", en: "Animations" };

  it("uses the page language when translated", () => {
    expect(categoryName(names, "en")).toBe("Animations");
  });

  it("falls back to Bosnian when a translation is missing", () => {
    expect(categoryName(names, "de")).toBe("Animacije");
  });
});
