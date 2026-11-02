import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow } from "@/components/Hero";
import { ProjectGallery } from "@/components/ProjectGallery";
import { Reveal } from "@/components/Reveal";
import { SiteNav } from "@/components/SiteNav";
import { getProjectsSafe, type ProjectWithImages } from "@/db/queries";
import { withLocalSample } from "@/lib/sample-projects";
import { EMAIL } from "@/lib/site";

export const revalidate = 3600;

/** The project, its place in the list and its neighbours for prev / next. */
async function load(id: string) {
  const projects = withLocalSample(await getProjectsSafe());
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const at = (i: number) =>
    projects[(i + projects.length) % projects.length];
  return {
    project: projects[index],
    index,
    total: projects.length,
    prev: projects.length > 1 ? at(index - 1) : null,
    next: projects.length > 1 ? at(index + 1) : null,
  };
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[id]">): Promise<Metadata> {
  const { id } = await params;
  const data = await load(id);
  if (!data) return { title: "Project not found — Fatih Škrijelj" };
  const { project } = data;
  return {
    title: `${project.title} — Fatih Škrijelj`,
    description: project.description.slice(0, 160),
    openGraph: { images: [project.coverImage] },
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[id]">) {
  const { id } = await params;
  const data = await load(id);
  if (!data) notFound();
  const { project, index, total, prev, next } = data;

  const gallery = [
    project.coverImage,
    ...project.images.map((img) => img.imageUrl),
  ];
  const paragraphs = project.description
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const no = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <main className="site">
      <Reveal />
      <SiteNav email={EMAIL} />

      {/* COVER */}
      <section className="pd-hero" aria-labelledby="pd-title">
        <Image
          src={project.coverImage}
          alt={`Render of ${project.title}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="pd-hero-shade" />
        <div className="pd-hero-content container">
          <Link href="/#projects" className="pd-back">
            <span aria-hidden>←</span> All projects
          </Link>
          <p className="pd-kicker">
            <span className="pd-no">
              {no(index)} / {String(total).padStart(2, "0")}
            </span>
            <span>{project.category}</span>
          </p>
          <h1 id="pd-title" className="pd-title">
            {project.title}
          </h1>
        </div>
      </section>

      {/* ABOUT THE PROJECT */}
      <section className="section container pd-about">
        <div className="pd-text" data-reveal>
          <p className="eyebrow">About the project</p>
          {paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? "pd-lead" : undefined}>
              {p}
            </p>
          ))}
        </div>
        <aside className="pd-facts" data-reveal style={{ ["--i" as string]: 1 }}>
          <dl>
            <div>
              <dt>Category</dt>
              <dd>{project.category}</dd>
            </div>
            <div>
              <dt>Images</dt>
              <dd>{gallery.length}</dd>
            </div>
            <div>
              <dt>Designer</dt>
              <dd>Fatih Škrijelj</dd>
            </div>
          </dl>
          <a
            href={`mailto:${EMAIL}?subject=${encodeURIComponent(
              `A project like ${project.title}`,
            )}`}
            className="btn btn-solid"
          >
            Start a similar project <Arrow />
          </a>
        </aside>
      </section>

      {/* GALLERY */}
      <section
        className="section container pd-gallery"
        aria-labelledby="pd-gallery-title"
      >
        <div className="pd-gallery-head" data-reveal>
          <p className="eyebrow">Gallery</p>
          <h2 id="pd-gallery-title">Images</h2>
        </div>
        <ProjectGallery images={gallery} title={project.title} />
      </section>

      {/* PREV / NEXT */}
      {prev && next && (
        <nav className="pd-pager container" aria-label="More projects">
          <PagerLink project={prev} label="Previous project" dir="prev" />
          <PagerLink project={next} label="Next project" dir="next" />
        </nav>
      )}

      <footer className="pd-footer container">
        <p>© {new Date().getFullYear()} Fatih Škrijelj</p>
        <Link href="/#contact" className="text-link">
          Get in touch <Arrow />
        </Link>
      </footer>
    </main>
  );
}

function PagerLink({
  project,
  label,
  dir,
}: {
  project: ProjectWithImages;
  label: string;
  dir: "prev" | "next";
}) {
  return (
    <Link href={`/projects/${project.id}`} className={`pd-page pd-page-${dir}`}>
      <Image
        src={project.coverImage}
        alt=""
        fill
        sizes="(min-width: 681px) 50vw, 100vw"
        className="object-cover"
      />
      <span className="pd-page-shade" aria-hidden />
      <span className="pd-page-text">
        <span className="pd-page-label">
          {dir === "prev" && <span aria-hidden>← </span>}
          {label}
          {dir === "next" && <span aria-hidden> →</span>}
        </span>
        <span className="pd-page-title">{project.title}</span>
      </span>
    </Link>
  );
}
