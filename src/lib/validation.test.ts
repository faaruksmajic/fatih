import { describe, expect, it } from "vitest";
import { validateProjectInput } from "./validation";

describe("validateProjectInput", () => {
  const valid = {
    title: "ATAL Group",
    description: "A five-story building.",
    category: "Commercial",
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
    const result = validateProjectInput({ ...valid, category: "" });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.category).toBeDefined();
  });

  it("rejects a missing cover image", () => {
    const result = validateProjectInput({ ...valid, coverImage: "" });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.coverImage).toBeDefined();
  });
});
