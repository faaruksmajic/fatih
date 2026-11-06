import { logoutAction } from "./actions";
import { Sidebar } from "./Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell min-h-screen bg-paper text-ink flex flex-col md:flex-row">
      <Sidebar
        logout={
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-paper/70 hover:text-paper transition-colors min-h-10 px-1">
              Log out
            </button>
          </form>
        }
      />
      <div className="flex-1 w-full px-4 py-6 md:px-6 md:py-8 max-w-5xl mx-auto">{children}</div>
    </div>
  );
}
