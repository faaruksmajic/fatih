import { describe, expect, it } from "vitest";
import { validateProjectInput } from "./validation";

describe("validateProjectInput", () => {
  const valid = {
    title: "ATAL Group",
    description: "A five-story building.",
    categoryId: "7b0c4a52-3f7e-4c55-9d7e-2a1f0f6f1a10",
    coverImage: "https://example.com/cover.jpg",
    images: [] as string[],
  };

  it("accepts a fully filled project", () => {
    expect(validateProjectInput(valid)).toEqual({ valid: true });
  });

  it("rejects a missing title", () => {
    const result = validateProjectInput({ ...valid, title: "  " });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.title).toBeDefined();
  });

  it("rejects a missing description", () => {
    const result = validateProjectInput({ ...valid, description: "" });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.description).toBeDefined();
  });

  it("rejects a missing category", () => {
    const result = validateProjectInput({ ...valid, categoryId: "" });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.categoryId).toBeDefined();
  });

  it("rejects a missing cover image", () => {
    const result = validateProjectInput({ ...valid, coverImage: "" });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.coverImage).toBeDefined();
  });
});
