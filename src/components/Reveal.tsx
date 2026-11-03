"use client";

import { useEffect } from "react";
import { LOADER_MS } from "./PageLoader";

/** Adds a staggered entrance to every [data-reveal] element. Content stays visible without JS. */
export function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    const items = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    root.classList.add("reveal-ready");
    // Hold the entrances until the page loader has lifted, so they play in view.
    const loaderUp =
      !root.classList.contains("intro-seen") &&
      document.querySelector(".page-loader") &&
      performance.now() < LOADER_MS;
    const start = window.setTimeout(
      () => items.forEach((el) => observer.observe(el)),
      loaderUp ? LOADER_MS - performance.now() : 0,
    );
    return () => {
      window.clearTimeout(start);
      observer.disconnect();
    };
  }, []);
  return null;
}
