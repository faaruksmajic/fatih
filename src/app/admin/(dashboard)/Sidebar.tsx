"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Projects" },
  { href: "/admin/cv", label: "CV" },
];

export function Sidebar({ logout }: { logout: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 min-h-screen bg-charcoal text-paper flex flex-col justify-between px-6 py-8">
      <div className="flex flex-col gap-10">
        <Link href="/admin" className="font-display text-lg">
          FATIH ADMIN
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm px-3 py-2 transition-colors ${
                  active ? "bg-paper text-ink font-semibold" : "text-paper/70 hover:text-paper"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {logout}
    </aside>
  );
}
