"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Projects" },
  { href: "/categories", label: "Categories" },
  { href: "/cv", label: "CV" },
];

/** "/" is active on the project pages too; the rest match their own sub-pages. */
function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/projects");
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Phones: a sticky top bar with the brand, log out and a row of tabs.
 * From md up: the dark sidebar on the left.
 */
export function Sidebar({ logout }: { logout: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-10 bg-charcoal text-paper md:static md:w-56 md:shrink-0 md:min-h-screen md:flex md:flex-col md:justify-between md:px-6 md:py-8">
      <div className="md:flex md:flex-col md:gap-10">
        <div className="flex items-center justify-between px-4 pt-3 md:p-0">
          <Link href="/" className="font-display text-lg">
            FATIH ADMIN
          </Link>
          <div className="md:hidden">{logout}</div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 py-2 md:flex-col md:p-0">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 text-sm px-3 py-2 min-h-10 flex items-center transition-colors ${
                  active ? "bg-paper text-ink font-semibold" : "text-paper/70 hover:text-paper"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="hidden md:block">{logout}</div>
    </aside>
  );
}
