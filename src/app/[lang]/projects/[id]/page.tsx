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
import {
  fmt,
  hasLocale,
  languageAlternates,
  localePath,
  type Locale,
} from "@/i18n/config";
import {
  categoryLabel,
  getDictionary,
} from "@/i18n/dictionaries";

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
}: PageProps<"/[lang]/projects/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  if (!hasLocale(lang)) return {};
  const t = await getDictionary(lang);
  const data = await load(id);
  if (!data) return { title: `${t.meta.projectNotFound} — Fatih Škrijelj` };
  const { project } = data;
  return {
    title: `${project.title} — Fatih Škrijelj`,
    description: project.description.slice(0, 160),
    alternates: languageAlternates(`/projects/${id}`, lang),
    openGraph: { images: [project.coverImage] },
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/[lang]/projects/[id]">) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();
  const t = await getDictionary(lang);
  const p = t.project;
  const href = (path: string) => localePath(lang, path);
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
      <SiteNav email={EMAIL} lang={lang} t={t.nav} />

      {/* COVER */}
      <section className="pd-hero" aria-labelledby="pd-title">
        <Image
          src={project.coverImage}
          alt={fmt(t.projects.renderOf, { title: project.title })}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="pd-hero-shade" />
        <div className="pd-hero-content container">
          <Link href={href("/#projects")} className="pd-back">
            <span aria-hidden className="pd-back-arrow">←</span> {p.back}
          </Link>
          <p className="pd-kicker">
            <span className="pd-no">
              {no(index)} / {String(total).padStart(2, "0")}
            </span>
            <span>{categoryLabel(t, project.category)}</span>
          </p>
          <h1 id="pd-title" className="pd-title" dir="auto">
            {project.title}
          </h1>
        </div>
      </section>

      {/* ABOUT THE PROJECT */}
      <section className="section container pd-about">
        <div className="pd-text" data-reveal>
          <p className="eyebrow">{p.about}</p>
          {paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? "pd-lead" : undefined} dir="auto">
              {p}
            </p>
          ))}
        </div>
        <aside className="pd-facts" data-reveal style={{ ["--i" as string]: 1 }}>
          <dl>
            <div>
              <dt>{p.category}</dt>
              <dd>{categoryLabel(t, project.category)}</dd>
            </div>
            <div>
              <dt>{p.images}</dt>
              <dd>{gallery.length}</dd>
            </div>
            <div>
              <dt>{p.designer}</dt>
              <dd dir="ltr">Fatih Škrijelj</dd>
            </div>
          </dl>
          <a
            href={`mailto:${EMAIL}?subject=${encodeURIComponent(
              fmt(p.similarSubject, { title: project.title }),
            )}`}
            className="btn btn-solid"
          >
            {p.similar} <Arrow />
          </a>
        </aside>
      </section>

      {/* GALLERY */}
      <section
        className="section container pd-gallery"
        aria-labelledby="pd-gallery-title"
      >
        <div className="pd-gallery-head" data-reveal>
          <p className="eyebrow">{p.galleryEyebrow}</p>
          <h2 id="pd-gallery-title">{p.images}</h2>
        </div>
        <ProjectGallery images={gallery} title={project.title} t={t.gallery} />
      </section>

      {/* PREV / NEXT */}
      {prev && next && (
        <nav className="pd-pager container" aria-label={p.more}>
          <PagerLink project={prev} label={p.prev} dir="prev" lang={lang} />
          <PagerLink project={next} label={p.next} dir="next" lang={lang} />
        </nav>
      )}

      <footer className="pd-footer container">
        <p>© {new Date().getFullYear()} Fatih Škrijelj</p>
        <Link href={href("/#contact")} className="text-link">
          {p.getInTouch} <Arrow />
        </Link>
      </footer>
    </main>
  );
}

function PagerLink({
  project,
  label,
  dir,
  lang,
}: {
  project: ProjectWithImages;
  label: string;
  dir: "prev" | "next";
  lang: Locale;
}) {
  return (
    <Link
      href={localePath(lang, `/projects/${project.id}`)}
      className={`pd-page pd-page-${dir}`}
    >
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
          {dir === "prev" && <span aria-hidden className="pd-arrow">← </span>}
          {label}
          {dir === "next" && <span aria-hidden className="pd-arrow"> →</span>}
        </span>
        <span className="pd-page-title" dir="auto">
          {project.title}
        </span>
      </span>
    </Link>
  );
}
