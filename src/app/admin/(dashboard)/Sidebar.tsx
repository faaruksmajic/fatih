"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AfMark } from "@/components/AfMark";
import { SITE_URL } from "@/lib/seo";
import { IconDoc, IconExternal, IconLogout, IconProjects, IconTag } from "../icons";

const NAV_ITEMS = [
  { href: "/", label: "Projects", Icon: IconProjects },
  { href: "/categories", label: "Categories", Icon: IconTag },
  { href: "/cv", label: "CV", Icon: IconDoc },
];

/** "/" is active on the project pages too; the rest match their own sub-pages. */
function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/projects");
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * From 900px up: a translucent sidebar the page scrolls beside.
 * Phones: a sticky top bar with the brand, and the sections as a segmented control.
 */
export function Sidebar({ logoutAction }: { logoutAction: () => Promise<void> }) {
  const pathname = usePathname();

  return (
    <aside className="a-side">
      <div className="a-side-head">
        <Link href="/" className="a-brand">
          <AfMark line={18} />
          <span className="a-brand-name">
            Fatih Škrijelj
            <small>Backoffice</small>
          </span>
        </Link>
        <div className="a-top-actions">
          <a href={SITE_URL} target="_blank" rel="noreferrer" className="a-icon-btn" aria-label="View site">
            <IconExternal />
          </a>
          <form action={logoutAction}>
            <button type="submit" className="a-icon-btn" aria-label="Log out">
              <IconLogout />
            </button>
          </form>
        </div>
      </div>

      <nav className="a-nav" aria-label="Sections">
        {NAV_ITEMS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(pathname, href) ? "page" : undefined}
            className="a-nav-link"
          >
            <Icon />
            {label}
          </Link>
        ))}
      </nav>

      <div className="a-side-foot">
        <a href={SITE_URL} target="_blank" rel="noreferrer" className="a-nav-link">
          <IconExternal />
          View site
        </a>
        <form action={logoutAction}>
          <button type="submit" className="a-nav-link">
            <IconLogout />
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
