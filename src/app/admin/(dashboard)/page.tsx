import Image from "next/image";
import Link from "next/link";
import { getCategories, getCvUrl, getProjects } from "@/db/queries";
import { SITE_URL } from "@/lib/seo";
import { IconExternal, IconPhoto, IconPlus } from "../icons";
import { deleteProjectAction } from "./actions";
import { DeleteProjectButton } from "./DeleteProjectButton";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const [allProjects, categories, cvUrl] = await Promise.all([
    getProjects(),
    getCategories(),
    getCvUrl(),
  ]);

  return (
    <>
      <header className="a-head">
        <div>
          <h1 className="a-title">Projects</h1>
          <p className="a-sub">Shown on the home page in this order. Open one to edit it.</p>
        </div>
        <Link href="/projects/new" className="a-btn a-btn-primary">
          <IconPlus />
          New project
        </Link>
      </header>

      {/* Status at a glance: what is on the site right now. */}
      <div className="a-stats">
        <div className="a-stat">
          <span className="a-stat-value">{allProjects.length}</span>
          <span className="a-stat-label">{allProjects.length === 1 ? "Project" : "Projects"}</span>
        </div>
        <Link href="/categories" className="a-stat">
          <span className="a-stat-value">{categories.length}</span>
          <span className="a-stat-label">{categories.length === 1 ? "Category" : "Categories"}</span>
        </Link>
        <Link href="/cv" className="a-stat">
          <span className={`a-stat-value ${cvUrl ? "a-stat-ok" : "a-stat-missing"}`}>
            {cvUrl ? "Live" : "Missing"}
          </span>
          <span className="a-stat-label">CV</span>
        </Link>
      </div>

      {allProjects.length === 0 ? (
        <div className="a-empty">
          <IconPhoto />
          <p>No projects yet. Add the first one and it appears on the home page.</p>
          <Link href="/projects/new" className="a-btn a-btn-primary">
            <IconPlus />
            New project
          </Link>
        </div>
      ) : (
        <ul className="a-grid">
          {allProjects.map((project) => {
            const edit = `/projects/${project.id}/edit`;
            const photos = project.images.length + 1;
            return (
              <li key={project.id} className="a-card">
                <Link href={edit} className="a-card-img" aria-label={`Edit ${project.title}`}>
                  <Image
                    src={project.coverImage}
                    alt=""
                    fill
                    sizes="(min-width: 900px) 320px, 100vw"
                    className="object-cover"
                  />
                  <span className="a-card-badge">
                    {photos} {photos === 1 ? "photo" : "photos"}
                  </span>
                </Link>
                <div className="a-card-body">
                  <div className="a-card-text">
                    <Link href={edit} className="a-card-title">
                      {project.title}
                    </Link>
                    {project.categoryNames?.bs ? (
                      <p className="a-card-meta">{project.categoryNames.bs}</p>
                    ) : (
                      <p className="a-card-meta is-warning">No category linked</p>
                    )}
                  </div>
                  <div className="a-card-actions">
                    <a
                      href={`${SITE_URL}/bs/projects/${project.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="a-icon-btn"
                      aria-label={`View ${project.title} on the site`}
                    >
                      <IconExternal />
                    </a>
                    <DeleteProjectButton
                      action={deleteProjectAction.bind(null, project.id)}
                      projectTitle={project.title}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
