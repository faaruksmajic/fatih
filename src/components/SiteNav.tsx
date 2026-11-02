"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/#top", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/#projects", label: "Projects" },
  { href: "/#tools", label: "Tools" },
];

export function SiteNav({ email }: { email: string }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${solid || open ? "is-solid" : ""}`}>
      <div className="nav-inner">
        <Link href="/#top" className="logo" aria-label="Fatih Škrijelj, home">
          <span className="logo-mark">
            <Image
              src="/images/logo.png"
              alt=""
              fill
              sizes="(min-width: 1024px) 46px, 36px"
              priority
            />
          </span>
          <span className="logo-text">
            <span className="logo-name">Fatih Škrijelj</span>
            <span className="logo-sub">Architecture</span>
          </span>
        </Link>

        <nav aria-label="Main" className={`nav-links ${open ? "is-open" : ""}`}>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            className="nav-contact-mobile"
            onClick={() => setOpen(false)}
          >
            Contact
          </Link>
        </nav>

        <a
          href={`mailto:${email}?subject=Hello%20Fatih`}
          className="btn btn-solid nav-cta"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
            <rect
              x="3"
              y="5"
              width="18"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M3 6 L12 13 L21 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </svg>
          Contact
        </a>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
