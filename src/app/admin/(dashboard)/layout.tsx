import Link from "next/link";
import { logoutAction } from "./actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
        <Link href="/admin" className="font-display text-lg">
          FATIH ADMIN
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/admin/cv" className="text-sm underline">
            CV
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="text-sm underline">
              Log out
            </button>
          </form>
        </div>
      </header>
      <div className="px-6 py-8 max-w-5xl mx-auto">{children}</div>
    </div>
  );
}
