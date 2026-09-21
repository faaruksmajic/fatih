import { logoutAction } from "./actions";
import { Sidebar } from "./Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink flex">
      <Sidebar
        logout={
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-paper/70 hover:text-paper transition-colors">
              Log out
            </button>
          </form>
        }
      />
      <div className="flex-1 px-6 py-8 max-w-5xl mx-auto">{children}</div>
    </div>
  );
}
