"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ProjectWithImages } from "@/db/queries";
import { Arrow } from "@/components/Hero";

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? (
        <path d="M19 12H5 M12 19 L5 12 L12 5" />
      ) : (
        <path d="M5 12 H19 M12 5 L19 12 L12 19" />
      )}
    </svg>
  );
}

export function ProjectGrid({ projects }: { projects: ProjectWithImages[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState<ProjectWithImages | null>(null);
  const [image, setImage] = useState<string | null>(null);

  const open = (project: ProjectWithImages) => {
    setCurrent(project);
    setImage(project.coverImage);
    dialogRef.current?.showModal();
  };

  const close = () => dialogRef.current?.close();

  // Full ordered list of images for the open project: cover first, then gallery.
  const images = current
    ? [current.coverImage, ...current.images.map((img) => img.imageUrl)]
    : [];
  const index = image ? images.indexOf(image) : -1;
  const hasNav = images.length > 1;

  const prev = () => {
    if (index < 0) return;
    setImage(images[(index - 1 + images.length) % images.length]);
  };
  const next = () => {
    if (index < 0) return;
    setImage(images[(index + 1) % images.length]);
  };

  // Navigate the gallery with the arrow keys while the dialog is open.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (!dialog.hasAttribute("open")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        dialog.close();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [image, images]);

  return (
    <>
      <div className="projects">
        {projects.map((project, i) => (
          <article
            key={project.id}
            className="project"
            data-reveal
            style={{ ["--i" as string]: i % 2 }}
          >
            <button
              type="button"
              className="project-btn"
              onClick={() => open(project)}
            >
              <span className="project-img">
                <Image
                  src={project.coverImage}
                  alt={`Render of ${project.title}`}
                  fill
                  sizes="(min-width: 768px) 46vw, 100vw"
                  className="object-cover"
                />
              </span>
              <span className="project-card">
                <span className="project-title">{project.title}</span>
                <span className="project-link">
                  View project <Arrow />
                </span>
              </span>
            </button>
          </article>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        className="project-dialog"
        aria-labelledby="dialog-title"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        {current && (
          <div className="dialog-inner">
            <div className="dialog-img">
              <Image
                src={image ?? current.coverImage}
                alt={`Render of ${current.title}`}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />
              {hasNav && index >= 0 && (
                <>
                  <button
                    type="button"
                    className="dialog-nav dialog-nav-prev"
                    onClick={prev}
                    aria-label="Previous image"
                  >
                    <Chevron direction="left" />
                  </button>
                  <button
                    type="button"
                    className="dialog-nav dialog-nav-next"
                    onClick={next}
                    aria-label="Next image"
                  >
                    <Chevron direction="right" />
                  </button>
                  <span className="dialog-counter">
                    {index + 1} / {images.length}
                  </span>
                </>
              )}
            </div>
            <div className="dialog-text">
              <p className="eyebrow">{current.category}</p>
              <h3 id="dialog-title">{current.title}</h3>
              <p>{current.description}</p>
              {current.images.length > 0 && (
                <div className="dialog-thumbs">
                  {images.map((src, j) => (
                    <button
                      key={src}
                      type="button"
                      aria-label={`Show image ${j + 1}`}
                      aria-pressed={src === image}
                      onClick={() => setImage(src)}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                className="btn btn-solid"
                onClick={close}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
