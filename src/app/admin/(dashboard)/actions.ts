"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { deleteProject } from "@/db/queries";

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}

export async function deleteProjectAction(id: string) {
  await deleteProject(id);
  revalidatePath("/");
  revalidatePath("/admin");
}
