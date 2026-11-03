"use server";

import { revalidatePath } from "next/cache";
import { revalidateSite } from "@/lib/revalidate-site";
import { requireAdminSession } from "@/lib/auth/require-session";
import { setCvUrl } from "@/db/queries";

export type SaveCvResult = { ok: true } | { ok: false; error: string };

export async function saveCvUrlAction(url: string): Promise<SaveCvResult> {
  await requireAdminSession();

  if (!url) {
    return { ok: false, error: "No file uploaded." };
  }

  try {
    await setCvUrl(url);
  } catch (error) {
    console.error("Failed to save CV URL:", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  revalidateSite();
  revalidatePath("/admin/cv");
  return { ok: true };
}
