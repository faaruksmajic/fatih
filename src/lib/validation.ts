export type ProjectFormInput = {
  title: string;
  description: string;
  category: string;
  coverImage: string;
  images: string[];
};

export type ValidationResult = { valid: true } | { valid: false; errors: Record<string, string> };

export function validateProjectInput(input: Partial<ProjectFormInput>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.title || input.title.trim().length === 0) errors.title = "Title is required.";
  if (!input.description || input.description.trim().length === 0) errors.description = "Description is required.";
  if (!input.category || input.category.trim().length === 0) errors.category = "Category is required.";
  if (!input.coverImage || input.coverImage.trim().length === 0) errors.coverImage = "Cover image is required.";

  if (Object.keys(errors).length > 0) return { valid: false, errors };
  return { valid: true };
}
