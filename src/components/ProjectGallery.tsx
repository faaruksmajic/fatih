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

/** Cards of the pile that are drawn; the last one waits hidden to slide in. */
const PILE = 4;
/** Resting tilt of each card in the pile, from the top card down. */
const TILT = [0, -3.5, 2.5, 0];

/**
 * A project's images as one pile of photos, so the gallery reads as a single
 * object rather than a wall of pictures. Flick the top photo away and it goes
 * to the back of the pile; tap the pile and the photo grows out of it into a
 * full-screen viewer. In the viewer images follow the finger 1:1, flick to
 * the next one with momentum, and a pull down puts the photo back on the
 * pile. Every motion is a spring and can be grabbed mid-flight.
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
  const pileRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
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

  /** Measure the top photo of the pile against the full-screen stage. */
  const measureOrigin = () => {
    const stage = stageRef.current;
    const thumb = pileRef.current?.querySelector<HTMLElement>(".pile-card[data-top]");
    if (!stage || !thumb) return;
    // Bring the pile into view behind the dialog, so "back" lands somewhere you can see.
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
    setOpen(true);
    if (!dialog.open) dialog.showModal();
    measureOrigin();
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
      measureOrigin();
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

  // ── The pile: flick the top photo to the back, tap to open ──
  const fling = useRef<Spring | null>(null);
  const flingX = useRef(0);
  const pileDrag = useRef<{ id: number; px: number; py: number; x0: number; axis: "x" | "y" | null } | null>(null);
  /** Set when a press turned into a flick, so its click does not open the viewer. */
  const swallowClick = useRef(false);

  const topCard = () => pileRef.current?.querySelector<HTMLElement>(".pile-card[data-top]") ?? null;

  /** The top photo follows the finger and tilts toward where it is being thrown. */
  const renderFling = () => {
    const card = topCard();
    const w = pileRef.current?.clientWidth || 1;
    if (!card) return;
    const x = flingX.current;
    card.style.setProperty("--dx", `${x}px`);
    card.style.setProperty("--drot", `${(x / w) * 10}deg`);
  };

  /** Hand the photo back to the pile's CSS so it eases into its new place. */
  const releaseCard = (card = topCard()) => {
    if (!card) return;
    card.classList.remove("is-moving");
    card.style.removeProperty("--dx");
    card.style.removeProperty("--drot");
    flingX.current = 0;
  };

  /** Move through the pile by `delta` photos without opening the viewer. */
  const shift = (delta: number) => {
    if (count < 2) return;
    fling.current?.stop();
    const card = topCard();
    const next = (indexRef.current + delta + count) % count;
    indexRef.current = next;
    // Re-order and release in the same frame, so the photo eases from where
    // it was thrown into its new place instead of snapping back on top first.
    flushSync(() => setIndex(next));
    releaseCard(card);
  };

  const onPilePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    swallowClick.current = false;
    // Catch a photo that is still flying away, right where it is.
    fling.current?.stop();
    tracker.current.reset();
    tracker.current.add(e.clientX, e.clientY);
    pileDrag.current = { id: e.pointerId, px: e.clientX, py: e.clientY, x0: flingX.current, axis: null };
  };

  const onPilePointerMove = (e: React.PointerEvent) => {
    const d = pileDrag.current;
    if (!d || d.id !== e.pointerId) return;
    tracker.current.add(e.clientX, e.clientY);
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    if (!d.axis) {
      if (Math.hypot(dx, dy) < SLOP) return;
      d.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      // Vertical belongs to the page scroll.
      if (d.axis === "y") {
        pileDrag.current = null;
        return;
      }
      swallowClick.current = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
      topCard()?.classList.add("is-moving");
    }
    let x = d.x0 + dx;
    if (count < 2) x = rubberband(x, pileRef.current?.clientWidth ?? 1);
    flingX.current = x;
    renderFling();
  };

  const onPilePointerUp = (e: React.PointerEvent) => {
    const d = pileDrag.current;
    if (!d || d.id !== e.pointerId) return;
    pileDrag.current = null;
    if (d.axis !== "x") return;
    const vx = tracker.current.velocity().x;
    const w = pileRef.current?.clientWidth ?? 1;
    // Decide from where the throw is going, not where the finger let go.
    const projected = flingX.current + project(vx);
    const away = count > 1 && Math.abs(projected) > w * 0.35;
    const target = away ? Math.sign(projected) * w * 1.25 : 0;
    fling.current = spring(
      flingX.current,
      target,
      { damping: away ? 1 : 0.8, response: away ? 0.3 : 0.35, velocity: vx, precision: 0.5 },
      (v) => {
        flingX.current = v;
        renderFling();
      },
      // Off the pile: it slides in at the back and the next photo comes up.
      () => (away ? shift(1) : releaseCard()),
    );
  };

  const pile = Array.from({ length: Math.min(PILE, count) }, (_, k) => ({
    k,
    i: (index + k) % count,
  }));

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
      <div className="pile-wrap" data-reveal>
        <button
          ref={pileRef}
          type="button"
          className="pile"
          data-open={open || undefined}
          aria-label={fmt(t.open, { n: index + 1, count })}
          onClick={() => {
            if (swallowClick.current) {
              swallowClick.current = false;
              return;
            }
            openAt(indexRef.current);
          }}
          onPointerDown={onPilePointerDown}
          onPointerMove={onPilePointerMove}
          onPointerUp={onPilePointerUp}
          onPointerCancel={onPilePointerUp}
          onDragStart={(e) => e.preventDefault()}
        >
          {pile.map(({ k, i }) => (
            <span
              key={i}
              className="pile-card"
              data-top={k === 0 || undefined}
              data-waiting={k === PILE - 1 || undefined}
              style={{
                ["--k" as string]: k,
                ["--rot" as string]: `${TILT[k]}deg`,
                zIndex: PILE - k,
              }}
            >
              <Image
                src={images[i]}
                alt={k === 0 ? fmt(t.imageAlt, { title, n: i + 1 }) : ""}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
                draggable={false}
              />
            </span>
          ))}
        </button>

        <div className="pile-meta">
          <p className="pile-count" aria-live="polite">
            <span className="sr-only">{fmt(t.position, { n: index + 1, count })}</span>
            <span aria-hidden>
              {String(index + 1).padStart(2, "0")}
              <span className="pile-count-total"> / {String(count).padStart(2, "0")}</span>
            </span>
          </p>
          {count > 1 && <p className="pile-hint">{t.hint}</p>}
          <div className="pile-actions">
            <button type="button" className="btn btn-solid" onClick={() => openAt(indexRef.current)}>
              {t.openAll}
            </button>
            {count > 1 && (
              <span className="pile-nav">
                <button type="button" className="lightbox-prev" onClick={() => shift(-1)} aria-label={t.prev}>
                  ←
                </button>
                <button type="button" className="lightbox-next" onClick={() => shift(1)} aria-label={t.next}>
                  →
                </button>
              </span>
            )}
          </div>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="lightbox"
        aria-label={fmt(t.label, { title })}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        onClose={() => {
          stopAll();
          setOpen(false);
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
