"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { fmt } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Every image of a project in an editorial grid. Clicking one opens it full
 * screen, with arrow keys / buttons to move through the set.
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
  const [index, setIndex] = useState(0);
  const count = images.length;

  const openAt = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const step = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (!dialog.open) return;
      // In right-to-left pages the next image is to the left.
      const forward = document.documentElement.dir === "rtl" ? -1 : 1;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-forward);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        step(forward);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  return (
    <>
      <ul className="gallery">
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
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="lightbox-img">
          <Image
            src={images[index]}
            alt={fmt(t.imageAlt, { title, n: index + 1 })}
            fill
            sizes="100vw"
            className="object-contain"
          />
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
            onClick={() => dialogRef.current?.close()}
          >
            {t.close}
          </button>
        </div>
      </dialog>
    </>
  );
}
