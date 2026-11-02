"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { href: "#top", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#projects", label: "Projects" },
  { href: "#tools", label: "Tools" },
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
        <a href="#top" className="logo" aria-label="Fatih Škrijelj, home">
          <svg viewBox="0 0 32 32" aria-hidden className="logo-mark">
            <path
              d="M4 15 L16 5 L28 15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M8 13 V27 H24 V13"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M14 27 V19 H18 V27"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
          <span className="logo-text">
            <span className="logo-name">Fatih Škrijelj</span>
            <span className="logo-sub">Architecture</span>
          </span>
        </a>

        <nav aria-label="Main" className={`nav-links ${open ? "is-open" : ""}`}>
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="nav-contact-mobile"
            onClick={() => setOpen(false)}
          >
            Contact
          </a>
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
