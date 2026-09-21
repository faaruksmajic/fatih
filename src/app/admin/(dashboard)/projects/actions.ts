"use server";

import { revalidatePath } from "next/cache";
import { createProject, updateProject } from "@/db/queries";
import { validateProjectInput, type ProjectFormInput } from "@/lib/validation";

export type SaveProjectInput = ProjectFormInput & { id?: string };
export type SaveProjectResult = { valid: true } | { valid: false; errors: Record<string, string> };

export async function saveProjectAction(input: SaveProjectInput): Promise<SaveProjectResult> {
  const result = validateProjectInput(input);
  if (!result.valid) return result;

  if (input.id) {
    await updateProject(input.id, input);
  } else {
    await createProject(input);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { valid: true };
}
