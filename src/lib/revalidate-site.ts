import { revalidatePath } from "next/cache";

/**
 * Refreshes every public page in every language (home and project pages),
 * after the content behind them changed in the admin.
 */
export function revalidateSite() {
  revalidatePath("/[lang]", "layout");
}
