"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ProjectWithImages } from "@/db/queries";
import { Arrow } from "@/components/Hero";
import { fmt, localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

/** How many projects the home page shows before "All projects". */
const INITIAL = 3;

export function ProjectGrid({
  projects,
  lang,
  t,
}: {
  projects: ProjectWithImages[];
  lang: Locale;
  t: Dictionary["projects"];
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? projects : projects.slice(0, INITIAL);

  return (
    <>
      <div className={`projects ${showAll ? "is-all" : ""}`}>
        {visible.map((project, i) => (
          <article
            key={project.id}
            className="project"
            // Only the first row animates in; projects shown later by the
            // toggle appear at once (the scroll observer never sees them).
            {...(i < INITIAL ? { "data-reveal": true } : {})}
            style={{ ["--i" as string]: i % INITIAL }}
          >
            <Link href={localePath(lang, `/projects/${project.id}`)} className="project-btn">
              <span className="project-img">
                <Image
                  src={project.coverImage}
                  alt={fmt(t.renderOf, { title: project.title })}
                  fill
                  sizes={
                    i === 0
                      ? "(min-width: 681px) 58vw, 100vw"
                      : "(min-width: 681px) 40vw, 50vw"
                  }
                  className="object-cover"
                />
              </span>
              <span className="project-shade" aria-hidden />
              <span className="project-frame" aria-hidden />
              <span className="project-top">
                <span className="project-no">
                  {String(i + 1).padStart(2, "0")}
                </span>
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

      {projects.length > INITIAL && (
        <div className="projects-more">
          <button
            type="button"
            className="btn btn-outline"
            aria-expanded={showAll}
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? t.fewer : fmt(t.all, { count: projects.length })}
          </button>
        </div>
      )}
    </>
  );
}
