import { logoutAction } from "./actions";
import { Sidebar } from "./Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="a-shell admin-shell">
      <div className="a-frame">
        <Sidebar logoutAction={logoutAction} />
        <main className="a-main">{children}</main>
      </div>
    </div>
  );
}
