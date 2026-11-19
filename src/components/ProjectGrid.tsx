"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ProjectWithImages } from "@/db/queries";
import { Arrow } from "@/components/Hero";
import { fmt, localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { VelocityTracker, project, rubberband, spring, type Spring } from "@/lib/motion";

/** Cards that play the scroll-in entrance on first render. */
const REVEALED = 3;

/**
 * Projects as a horizontal rail of large cards, filtered by a segmented
 * control. Touch scrolls natively (with the platform's own momentum); a mouse
 * can grab the rail and throw it, and it lands on the card nearest to where
 * the throw was going.
 */
export function ProjectGrid({
  projects: allProjects,
  tabs,
  lang,
  t,
}: {
  projects: ProjectWithImages[];
  /** Categories that have projects, in display order; "All" is added in front. */
  tabs: { id: string; label: string }[];
  lang: Locale;
  t: Dictionary["projects"];
}) {
  const [active, setActive] = useState<string | null>(null);
  // Cards swapped in by a tab must not wait for the scroll-reveal observer.
  const [filtered, setFiltered] = useState(false);
  const projects = active
    ? allProjects.filter((p) => p.categoryId === active)
    : allProjects;

  const railRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  function choose(id: string | null) {
    setActive(id);
    setFiltered(true);
  }

  // Segmented control: the thumb slides to the chosen segment.
  useLayoutEffect(() => {
    const group = tabsRef.current;
    if (!group) return;
    const place = () => {
      const on = group.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!on) return;
      group.style.setProperty("--thumb-x", `${on.offsetLeft}px`);
      group.style.setProperty("--thumb-w", `${on.offsetWidth}px`);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(group);
    return () => ro.disconnect();
  }, [active]);

  // ── Rail: edges, buttons and mouse drag ──
  const scrollSpring = useRef<Spring | null>(null);
  const overshootSpring = useRef<Spring | null>(null);
  const overshoot = useRef(0);

  const rtl = () => document.documentElement.dir === "rtl";
  /** Scroll position as a positive distance from the start, in both directions. */
  const getPos = () => {
    const rail = railRef.current!;
    return rtl() ? -rail.scrollLeft : rail.scrollLeft;
  };
  const setPos = (v: number) => {
    const rail = railRef.current!;
    rail.scrollLeft = rtl() ? -v : v;
  };
  const maxPos = () => {
    const rail = railRef.current!;
    return rail.scrollWidth - rail.clientWidth;
  };
  const applyOvershoot = () => {
    const track = trackRef.current;
    if (track) {
      const x = overshoot.current * (rtl() ? 1 : -1);
      track.style.transform = x ? `translate3d(${x}px,0,0)` : "";
    }
  };

  const updateEdges = () => {
    const rail = railRef.current;
    if (!rail) return;
    const pos = getPos();
    setEdges({ start: pos <= 2, end: pos >= maxPos() - 2 });
  };

  /** Card start positions, measured from the rail's scroll origin. */
  const snapPoints = () => {
    const rail = railRef.current!;
    const cards = Array.from(rail.querySelectorAll<HTMLElement>(".project"));
    const pad = parseFloat(getComputedStyle(rail).scrollPaddingInlineStart) || 0;
    const railBox = rail.getBoundingClientRect();
    const pos = getPos();
    return cards
      .map((c) => {
        const b = c.getBoundingClientRect();
        const offset = rtl() ? railBox.right - b.right : b.left - railBox.left;
        return Math.min(maxPos(), Math.max(0, pos + offset - pad));
      })
      .filter((v, i, a) => a.indexOf(v) === i);
  };

  const glideTo = (target: number, velocity = 0) => {
    const rail = railRef.current;
    if (!rail) return;
    scrollSpring.current?.stop();
    rail.classList.add("is-gliding");
    scrollSpring.current = spring(
      getPos(),
      target,
      { damping: 1, response: 0.45, velocity, precision: 0.5 },
      setPos,
      () => rail.classList.remove("is-gliding"),
    );
  };

  const page = (dirn: 1 | -1) => {
    const points = snapPoints();
    const pos = getPos();
    const next =
      dirn > 0
        ? points.find((p) => p > pos + 4) ?? maxPos()
        : [...points].reverse().find((p) => p < pos - 4) ?? 0;
    glideTo(next);
  };

  // Back to the first card when the filter changes.
  useEffect(() => {
    if (!filtered) return;
    glideTo(0);
    // glideTo reads refs only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    updateEdges();
    const onResize = () => updateEdges();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length]);

  const drag = useRef<{ id: number; x: number; pos: number; moved: boolean } | null>(null);
  const tracker = useRef(new VelocityTracker());

  const onPointerDown = (e: React.PointerEvent) => {
    // Touch and pen keep the browser's own scrolling and momentum.
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    scrollSpring.current?.stop();
    overshootSpring.current?.stop();
    railRef.current?.classList.add("is-gliding");
    tracker.current.reset();
    tracker.current.add(e.clientX, 0);
    drag.current = { id: e.pointerId, x: e.clientX, pos: getPos() + overshoot.current, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = (e.clientX - d.x) * (rtl() ? -1 : 1);
    if (!d.moved) {
      if (Math.abs(dx) < 6) return;
      d.moved = true;
      try {
        railRef.current?.setPointerCapture(e.pointerId);
      } catch {}
      railRef.current?.classList.add("is-dragging");
    }
    tracker.current.add(e.clientX, 0);
    const want = d.pos - dx;
    const max = maxPos();
    const clamped = Math.min(max, Math.max(0, want));
    setPos(clamped);
    // Past either end the rail follows less and less.
    const over = want - clamped;
    overshoot.current = over ? rubberband(over, railRef.current!.clientWidth) : 0;
    applyOvershoot();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const rail = railRef.current!;
    rail.classList.remove("is-dragging");
    if (!d.moved) {
      rail.classList.remove("is-gliding");
      return;
    }
    // Swallow the click that would otherwise open the card under the cursor.
    const block = (ev: Event) => {
      ev.preventDefault();
      ev.stopPropagation();
    };
    rail.addEventListener("click", block, { capture: true, once: true });
    setTimeout(() => rail.removeEventListener("click", block, { capture: true }), 0);

    const v = -tracker.current.velocity().x * (rtl() ? -1 : 1);
    if (overshoot.current) {
      overshootSpring.current = spring(
        overshoot.current,
        0,
        { damping: 1, response: 0.4, velocity: v },
        (x) => {
          overshoot.current = x;
          applyOvershoot();
        },
      );
      rail.classList.remove("is-gliding");
      return;
    }
    // Land on the card nearest to where the throw is heading.
    const projected = getPos() + project(v);
    const points = snapPoints();
    const target = points.reduce(
      (best, p) => (Math.abs(p - projected) < Math.abs(best - projected) ? p : best),
      points[0] ?? 0,
    );
    glideTo(target, v);
  };

  return (
    <>
      <div className="projects-bar">
        {tabs.length > 1 && (
          <div
            ref={tabsRef}
            className="project-tabs"
            role="group"
            aria-label={t.tabsLabel}
            data-reveal
          >
            <span className="project-tabs-thumb" aria-hidden />
            {[{ id: null, label: t.allTab }, ...tabs].map((tab) => {
              const count = tab.id
                ? allProjects.filter((p) => p.categoryId === tab.id).length
                : allProjects.length;
              return (
                <button
                  key={tab.id ?? "all"}
                  type="button"
                  className="project-tab"
                  aria-pressed={active === tab.id}
                  onClick={() => choose(tab.id)}
                >
                  {tab.label}
                  <span className="project-tab-count">{count}</span>
                </button>
              );
            })}
          </div>
        )}
        <div className="rail-nav">
          <button
            type="button"
            className="rail-btn rail-prev"
            aria-label={t.prev}
            disabled={edges.start}
            onClick={() => page(-1)}
          >
            <Arrow />
          </button>
          <button
            type="button"
            className="rail-btn"
            aria-label={t.next}
            disabled={edges.end}
            onClick={() => page(1)}
          >
            <Arrow />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className="projects-rail"
        onScroll={updateEdges}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDragStart={(e) => e.preventDefault()}
      >
        <div ref={trackRef} className="projects">
          {projects.map((project, i) => (
            <article
              key={`${active ?? "all"}-${project.id}`}
              className={`project ${filtered ? "is-swapped" : ""}`}
              {...(i < REVEALED && !filtered ? { "data-reveal": true } : {})}
              style={{ ["--i" as string]: Math.min(i, REVEALED) }}
            >
              <Link
                href={localePath(lang, `/projects/${project.id}`)}
                className="project-btn"
                draggable={false}
              >
                <span className="project-img">
                  <Image
                    src={project.coverImage}
                    alt={fmt(t.renderOf, { title: project.title })}
                    fill
                    sizes="(min-width: 681px) 46vw, 86vw"
                    className="object-cover"
                    draggable={false}
                  />
                </span>
                <span className="project-shade" aria-hidden />
                <span className="project-top">
                  <span className="project-cat">{project.category}</span>
                </span>
                <span className="project-bottom">
                  <span className="project-title" dir="auto">
                    {project.title}
                  </span>
                  <span className="project-link">
                    {t.view} <Arrow />
                  </span>
                </span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
