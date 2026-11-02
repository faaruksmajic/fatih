"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { ProjectWithImages } from "@/db/queries";
import { Arrow } from "@/components/Hero";

export function ProjectGrid({ projects }: { projects: ProjectWithImages[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState<ProjectWithImages | null>(null);
  const [image, setImage] = useState<string | null>(null);

  const open = (project: ProjectWithImages) => {
    setCurrent(project);
    setImage(project.coverImage);
    dialogRef.current?.showModal();
  };

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
            </div>
            <div className="dialog-text">
              <p className="eyebrow">{current.category}</p>
              <h3 id="dialog-title">{current.title}</h3>
              <p>{current.description}</p>
              {current.images.length > 0 && (
                <div className="dialog-thumbs">
                  {[
                    current.coverImage,
                    ...current.images.map((img) => img.imageUrl),
                  ].map((src, j) => (
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
                onClick={() => dialogRef.current?.close()}
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
