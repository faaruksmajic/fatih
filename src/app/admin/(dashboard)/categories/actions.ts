"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCategory, deleteCategory, moveCategory, updateCategory } from "@/db/queries";
import { requireAdminSession } from "@/lib/auth/require-session";
import { validateCategoryNames } from "@/lib/categories";
import { LOCALES } from "@/i18n/config";
import { revalidateSite } from "@/lib/revalidate-site";

export type CategoryFormState = { error?: string };

function refresh() {
  revalidateSite();
  revalidatePath("/admin", "layout");
}

/** Creates a category, or renames it when the form carries an id. */
export async function saveCategoryAction(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdminSession();
  const result = validateCategoryNames(
    Object.fromEntries(LOCALES.map((lang) => [lang, formData.get(lang)])),
  );
  if (!result.valid) return { error: result.error };

  const id = String(formData.get("id") ?? "");
  try {
    if (id) await updateCategory(id, result.names);
    else await createCategory(result.names);
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }
  refresh();
  redirect("/categories");
}

export async function moveCategoryAction(id: string, direction: "up" | "down") {
  await requireAdminSession();
  await moveCategory(id, direction);
  refresh();
}

export async function deleteCategoryAction(id: string) {
  await requireAdminSession();
  const deleted = await deleteCategory(id);
  refresh();
  if (!deleted) redirect("/categories?error=in-use");
}
