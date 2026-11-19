"use client";

import { useEffect, useRef } from "react";
import {
  prefersReducedMotion,
  rubberband,
  spring,
  VelocityTracker,
  type Spring,
} from "@/lib/motion";

type Channel = "tx" | "ty" | "rx" | "ry";

/** How far the drawing may be pulled before it pushes back hard. */
const PULL = 220;
const RUBBER = 0.55;

/** Inverse of rubberband(): the raw pull that produces an on-screen offset. */
const unband = (x: number) =>
  (x * PULL) / (RUBBER * Math.max(1, PULL - Math.abs(x)));

/**
 * The 404 as an architect's drawing: it draws itself in, leans toward the
 * pointer, and can be grabbed and pulled. Past its spot it resists more the
 * further it goes, and on release it springs home carrying the throw.
 */
export function PlanDrawing({ caption }: { caption: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = stage.current;
    const el = sheet.current;
    if (!host || !el) return;

    const v = { tx: 0, ty: 0, rx: 0, ry: 0 };
    const springs: Partial<Record<Channel, Spring>> = {};
    const write = () => {
      el.style.transform = `translate3d(${v.tx}px, ${v.ty}px, 0) rotateX(${v.rx}deg) rotateY(${v.ry}deg)`;
    };
    const animate = (
      k: Channel,
      target: number,
      opts: { damping: number; response: number; velocity?: number },
    ) => {
      // Take over from whatever is moving, at its current speed.
      const live = springs[k]?.running ? springs[k]!.stop().velocity : 0;
      springs[k] = spring(
        v[k],
        target,
        { precision: 0.05, ...opts, velocity: opts.velocity ?? live },
        (x) => {
          v[k] = x;
          write();
        },
      );
    };
    const halt = (k: Channel) => springs[k]?.stop();

    const canHover = window.matchMedia("(hover: hover)").matches;
    const tracker = new VelocityTracker();
    let drag: { id: number; x: number; y: number } | null = null;

    // Lean toward the pointer: critically damped, no bounce for a hover.
    const onMove = (e: PointerEvent) => {
      if (drag || !canHover || prefersReducedMotion()) return;
      const r = host.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1));
      const ny = Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1));
      animate("ry", nx * 7, { damping: 1, response: 0.6 });
      animate("rx", -ny * 7, { damping: 1, response: 0.6 });
    };
    const settleTilt = () => {
      animate("ry", 0, { damping: 1, response: 0.7 });
      animate("rx", 0, { damping: 1, response: 0.7 });
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      // Grab it mid-flight: keep where it is, under the same finger offset.
      halt("tx");
      halt("ty");
      drag = {
        id: e.pointerId,
        x: e.clientX - unband(v.tx),
        y: e.clientY - unband(v.ty),
      };
      tracker.reset();
      tracker.add(e.clientX, e.clientY);
      try {
        el.setPointerCapture(e.pointerId);
      } catch {}
      el.classList.add("is-grabbed");
    };
    const onDrag = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      tracker.add(e.clientX, e.clientY);
      v.tx = rubberband(e.clientX - drag.x, PULL, RUBBER);
      v.ty = rubberband(e.clientY - drag.y, PULL, RUBBER);
      write();
    };
    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      el.classList.remove("is-grabbed");
      const vel = tracker.velocity();
      // It was thrown, so a little bounce is earned.
      animate("tx", 0, { damping: 0.62, response: 0.5, velocity: vel.x * 0.5 });
      animate("ty", 0, { damping: 0.62, response: 0.5, velocity: vel.y * 0.5 });
      if (!canHover) settleTilt();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", settleTilt);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onDrag);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", settleTilt);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onDrag);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      Object.values(springs).forEach((s) => s?.stop());
    };
  }, []);

  return (
    <figure className="plan" ref={stage}>
      <div className="plan-sheet" ref={sheet}>
        <svg viewBox="0 0 640 300" aria-hidden className="plan-svg">
          <defs>
            <pattern id="plan-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0 H0 V20" fill="none" className="plan-grid-line" />
            </pattern>
          </defs>
          <rect width="640" height="300" fill="url(#plan-grid)" className="plan-grid" />
          {/* Axis marks, as on a drawing sheet */}
          <g className="plan-axis">
            <path d="M80 28 V44 M320 28 V44 M560 28 V44" />
            <circle cx="80" cy="18" r="9" />
            <circle cx="320" cy="18" r="9" />
            <circle cx="560" cy="18" r="9" />
            <text x="80" y="22">A</text>
            <text x="320" y="22">B</text>
            <text x="560" y="22">C</text>
          </g>
          <text x="320" y="222" className="plan-digits">
            404
          </text>
          {/* Dimension line under the walls */}
          <g className="plan-dim">
            <path d="M80 256 H560 M80 248 V264 M560 248 V264 M74 262 L86 250 M554 262 L566 250" />
          </g>
        </svg>
      </div>
      <figcaption className="plan-caption">{caption}</figcaption>
    </figure>
  );
}
