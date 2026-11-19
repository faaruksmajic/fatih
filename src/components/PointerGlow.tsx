"use client";

import { useEffect } from "react";

/**
 * Lets [data-glow] surfaces catch a soft light where the pointer is, like a
 * material reacting to it. One delegated listener; it only writes two CSS
 * variables, so nothing re-renders.
 */
export function PointerGlow() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    let last: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-glow]");
      if (last && last !== el) last.style.removeProperty("--glow");
      last = el ?? null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
      el.style.setProperty("--glow", "1");
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);
  return null;
}
