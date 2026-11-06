"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { revalidateSite } from "@/lib/revalidate-site";
import { deleteProject } from "@/db/queries";
import { requireAdminSession } from "@/lib/auth/require-session";

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/login");
}

export async function deleteProjectAction(id: string) {
  await requireAdminSession();
  await deleteProject(id);
  revalidateSite();
  revalidatePath("/admin");
}
