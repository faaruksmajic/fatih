"use server";

import { revalidatePath } from "next/cache";
import { createProject, updateProject } from "@/db/queries";
import { validateProjectInput, type ProjectFormInput } from "@/lib/validation";
import { requireAdminSession } from "@/lib/auth/require-session";

export type SaveProjectInput = ProjectFormInput & { id?: string };
export type SaveProjectResult = { valid: true } | { valid: false; errors: Record<string, string> };

export async function saveProjectAction(input: SaveProjectInput): Promise<SaveProjectResult> {
  await requireAdminSession();

  const result = validateProjectInput(input);
  if (!result.valid) return result;

  try {
    if (input.id) {
      await updateProject(input.id, input);
    } else {
      await createProject(input);
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { valid: true };
  } catch (error) {
    console.error(error);
    return { valid: false, errors: { form: "Something went wrong. Please try again." } };
  }
}
