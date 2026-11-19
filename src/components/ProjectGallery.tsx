"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { fmt } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  VelocityTracker,
  project,
  rubberband,
  spring,
  type Spring,
} from "@/lib/motion";

/** Space between neighbouring images while swiping, in px. */
const GAP = 24;
/** Movement before a drag commits to an axis (hysteresis). */
const SLOP = 10;

type Motion = {
  /** horizontal swipe offset of the track, px */
  x: number;
  /** vertical drag offset (pull down to dismiss), px */
  y: number;
  /** 0 = sitting on its thumbnail, 1 = full screen */
  p: number;
};

/**
 * Every image of a project in an editorial grid. Opening one grows it out of
 * its thumbnail; in the viewer images follow the finger 1:1, flick to the next
 * one with momentum, and a pull down sends the image back to where it came
 * from. Every motion is a spring and can be grabbed mid-flight.
 */
export function ProjectGallery({
  images,
  title,
  t,
}: {
  images: string[];
  title: string;
  t: Dictionary["gallery"];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const count = images.length;

  const m = useRef<Motion>({ x: 0, y: 0, p: 0 });
  const springs = useRef<{ x?: Spring; y?: Spring; p?: Spring }>({});
  /** thumbnail the stage grows from / shrinks to, relative to the stage */
  const origin = useRef({ dx: 0, dy: 0, s: 0.3 });
  const closing = useRef(false);
  /** a swipe that is animating toward the next/prev image but not yet swapped */
  const pending = useRef(0);

  const dir = () => (document.documentElement.dir === "rtl" ? -1 : 1);
  const pageWidth = () => (stageRef.current?.clientWidth ?? 0) + GAP;

  /** Write the motion state to the DOM. Only transform and opacity change. */
  const render = useCallback(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    const dialog = dialogRef.current;
    if (!stage || !track || !dialog) return;
    const { x, y, p } = m.current;
    const { dx, dy, s } = origin.current;
    const h = stage.clientHeight || 1;
    // Pulling down shrinks the image a little and lets the page show through.
    const pull = Math.min(Math.max(y, 0) / h, 1);
    const scale = s + (1 - s) * p;
    stage.style.transform = `translate3d(${dx * (1 - p)}px, ${dy * (1 - p)}px, 0) scale(${scale})`;
    track.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${1 - pull * 0.3})`;
    dialog.style.setProperty("--dim", String(Math.max(0, p * (1 - pull * 1.6))));
    dialog.style.setProperty("--chrome", String(Math.max(0, p * p * (1 - pull * 4))));
  }, []);

  const run = useCallback(
    (
      key: keyof Motion,
      to: number,
      opts: Parameters<typeof spring>[2],
      done?: () => void,
    ) => {
      springs.current[key]?.stop();
      springs.current[key] = spring(
        m.current[key],
        to,
        opts,
        (v) => {
          m.current[key] = v;
          render();
        },
        done,
      );
    },
    [render],
  );

  const stopAll = () => {
    for (const s of Object.values(springs.current)) s?.stop();
  };

  /** Swap the image the moment a swipe lands, keeping the picture still on screen. */
  const settlePending = useCallback(() => {
    const delta = pending.current;
    if (!delta) return;
    pending.current = 0;
    const next = (indexRef.current + delta + count) % count;
    indexRef.current = next;
    flushSync(() => setIndex(next));
    m.current.x += delta * dir() * pageWidth();
    render();
  }, [count, render]);

  /** Go to the neighbouring image, inheriting `velocity` from a flick. */
  const step = useCallback(
    (delta: number, velocity = 0) => {
      if (count < 2) return;
      settlePending();
      pending.current = delta;
      run(
        "x",
        -delta * dir() * pageWidth(),
        { damping: 1, response: 0.35, velocity, precision: 0.5 },
        settlePending,
      );
    },
    [count, run, settlePending],
  );

  /** Measure the thumbnail of image `i` against the full-screen stage. */
  const measureOrigin = (i: number) => {
    const stage = stageRef.current;
    const thumb = listRef.current?.children[i]?.querySelector("button");
    if (!stage || !thumb) return;
    // Bring the thumbnail into view behind the dialog, so "back" lands somewhere you can see.
    const r = thumb.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) {
      thumb.scrollIntoView({ block: "center", behavior: "instant" });
    }
    const a = thumb.getBoundingClientRect();
    // The stage carries a transform; measure its untransformed box.
    const prev = stage.style.transform;
    stage.style.transform = "none";
    const b = stage.getBoundingClientRect();
    stage.style.transform = prev;
    origin.current = {
      dx: a.left + a.width / 2 - (b.left + b.width / 2),
      dy: a.top + a.height / 2 - (b.top + b.height / 2),
      s: Math.max(0.05, Math.min(a.width / b.width, a.height / b.height)),
    };
  };

  const openAt = (i: number) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    stopAll();
    pending.current = 0;
    closing.current = false;
    indexRef.current = i;
    flushSync(() => setIndex(i));
    m.current = { x: 0, y: 0, p: 0 };
    if (!dialog.open) dialog.showModal();
    measureOrigin(i);
    render();
    run("p", 1, { damping: 1, response: 0.4, precision: 0.002 });
  };

  /** Shrink back into the current image's thumbnail, carrying any pull velocity. */
  const close = useCallback(
    (velocityY = 0) => {
      const dialog = dialogRef.current;
      if (!dialog?.open) return;
      closing.current = true;
      settlePending();
      springs.current.x?.stop();
      // Re-anchor to the thumbnail of the image being shown now.
      const { p } = m.current;
      measureOrigin(indexRef.current);
      m.current.p = p;
      run("x", 0, { damping: 1, response: 0.35 });
      run("y", 0, { damping: 0.85, response: 0.35, velocity: velocityY });
      run("p", 0, { damping: 1, response: 0.35, precision: 0.002 }, () => {
        if (!closing.current) return;
        closing.current = false;
        dialog.close();
      });
    },
    [run, settlePending],
  );

  // Keyboard: arrows move through the set, Escape goes back to the thumbnail.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (!dialog.open) return;
      // In right-to-left pages the next image is to the left.
      const forward = dir();
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-forward);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        step(forward);
      }
    };
    const onCancel = (e: Event) => {
      e.preventDefault();
      close();
    };
    window.addEventListener("keydown", onKey);
    dialog.addEventListener("cancel", onCancel);
    return () => {
      window.removeEventListener("keydown", onKey);
      dialog.removeEventListener("cancel", onCancel);
    };
  }, [step, close]);

  // ── Direct manipulation ──
  const drag = useRef<{
    id: number;
    px: number;
    py: number;
    x0: number;
    y0: number;
    axis: "x" | "y" | null;
  } | null>(null);
  const tracker = useRef(new VelocityTracker());

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    // Grab whatever is moving, right where it is on screen.
    springs.current.x?.stop();
    springs.current.y?.stop();
    if (closing.current) {
      // Caught on its way back: reverse it.
      closing.current = false;
      run("p", 1, { damping: 1, response: 0.4, precision: 0.002 });
    }
    tracker.current.reset();
    tracker.current.add(e.clientX, e.clientY);
    drag.current = {
      id: e.pointerId,
      px: e.clientX,
      py: e.clientY,
      x0: m.current.x,
      y0: m.current.y,
      axis: null,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    tracker.current.add(e.clientX, e.clientY);
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    if (!d.axis) {
      if (Math.hypot(dx, dy) < SLOP) return;
      d.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (d.axis === "x") {
      let x = d.x0 + dx;
      if (count < 2) x = rubberband(x, stageRef.current?.clientWidth ?? 1);
      m.current.x = x;
    } else {
      let y = d.y0 + dy;
      // Up has nowhere to go: resist.
      if (y < 0) y = rubberband(y, stageRef.current?.clientHeight ?? 1);
      m.current.y = y;
    }
    render();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const v = tracker.current.velocity();

    if (d.axis === "x") {
      const w = pageWidth();
      // Decide from where the flick is going, not where the finger let go.
      const projected = m.current.x + project(v.x);
      let delta = 0;
      if (count > 1 && Math.abs(projected) > w / 2) {
        delta = -Math.sign(projected) * dir();
      }
      // The index only changes once a swipe lands, so a swipe that was caught
      // mid-flight is decided again here, relative to the same page.
      pending.current = delta;
      if (delta) {
        run(
          "x",
          -delta * dir() * w,
          { damping: 1, response: 0.35, velocity: v.x, precision: 0.5 },
          settlePending,
        );
      } else {
        run("x", 0, { damping: 0.85, response: 0.35, velocity: v.x });
      }
      return;
    }

    if (d.axis === "y") {
      const h = stageRef.current?.clientHeight ?? 1;
      const projected = m.current.y + project(v.y);
      if (projected > h * 0.25) {
        close(v.y);
      } else {
        run("y", 0, { damping: 0.85, response: 0.35, velocity: v.y });
      }
      return;
    }

    // A tap: let whatever was caught carry on to where it was going.
    if (pending.current) {
      run("x", -pending.current * dir() * pageWidth(), { damping: 1, response: 0.35 }, settlePending);
    } else if (m.current.x !== 0) {
      run("x", 0, { damping: 1, response: 0.35 });
    }
    if (m.current.y !== 0) run("y", 0, { damping: 1, response: 0.35 });
  };

  const slots =
    count > 1
      ? [-1, 0, 1].map((k) => {
          const i = (index + k + count) % count;
          // With two images, prev and next are the same picture: keep keys unique.
          return { k, i, key: count === 2 && k === -1 ? `${i}-prev` : String(i) };
        })
      : [{ k: 0, i: 0, key: "0" }];

  return (
    <>
      <ul className="gallery" ref={listRef}>
        {images.map((src, i) => (
          <li key={src} className="gallery-item" data-reveal>
            <button
              type="button"
              className="gallery-btn"
              onClick={() => openAt(i)}
              aria-label={fmt(t.open, { n: i + 1, count })}
            >
              <Image
                src={src}
                alt={fmt(t.imageAlt, { title, n: i + 1 })}
                fill
                sizes="(min-width: 681px) 50vw, 100vw"
                className="object-cover"
              />
              <span className="gallery-no" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className="lightbox"
        aria-label={fmt(t.label, { title })}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        onClose={() => {
          stopAll();
          closing.current = false;
        }}
      >
        <div
          ref={stageRef}
          className="lightbox-stage"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDragStart={(e) => e.preventDefault()}
        >
          <div ref={trackRef} className="lightbox-track">
            {slots.map(({ k, i, key }) => (
              <div
                key={key}
                className="lightbox-slot"
                aria-hidden={k !== 0}
                style={{ transform: `translateX(calc(${k} * var(--page-dir, 1) * (100% + ${GAP}px)))` }}
              >
                <Image
                  src={images[i]}
                  alt={k === 0 ? fmt(t.imageAlt, { title, n: i + 1 }) : ""}
                  fill
                  sizes="100vw"
                  loading="eager"
                  draggable={false}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="lightbox-bar">
          <span className="lightbox-count">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(count).padStart(2, "0")}
          </span>
          {count > 1 && (
            <span className="lightbox-nav">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={t.prev}
                className="lightbox-prev"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={t.next}
                className="lightbox-next"
              >
                →
              </button>
            </span>
          )}
          <button
            type="button"
            className="lightbox-close"
            onClick={() => close()}
          >
            {t.close}
          </button>
        </div>
      </dialog>
    </>
  );
}
