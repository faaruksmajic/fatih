import { cookies } from "next/headers";
import { verifySessionToken } from "./session";

export async function requireAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;
  const session = token && secret ? await verifySessionToken(token, secret) : null;
  if (!session) {
    throw new Error("Not authenticated");
  }
}
