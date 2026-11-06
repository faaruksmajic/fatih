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
  const [showAll, setShowAll] = useState(false);
  const projects = active
    ? allProjects.filter((p) => p.categoryId === active)
    : allProjects;
  const visible = showAll ? projects : projects.slice(0, INITIAL);

  function choose(id: string | null) {
    setActive(id);
    setShowAll(false);
  }

  return (
    <>
      {tabs.length > 1 && (
        <div className="project-tabs" role="group" aria-label={t.tabsLabel} data-reveal>
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
      <div className={`projects ${showAll ? "is-all" : ""}`}>
        {visible.map((project, i) => (
          <article
            key={`${active ?? "all"}-${project.id}`}
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
