import Image from "next/image";
import { Arrow, Hero } from "@/components/Hero";
import { ProjectGrid } from "@/components/ProjectGrid";
import { ToolSheet } from "@/components/ToolSheet";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import { getCvUrlSafe, getProjectsSafe } from "@/db/queries";
import { fmt, hasLocale, LOCALES } from "@/i18n/config";
import { categoryLabel, getDictionary } from "@/i18n/dictionaries";
import { notFound } from "next/navigation";
import { withLocalSample } from "@/lib/sample-projects";
import { EMAIL } from "@/lib/site";

export const revalidate = 3600;

// Age is computed from the birth date so it stays correct after each birthday.
const BIRTH_DATE = new Date("2002-06-04T00:00:00");

function computedAge(): number {
  const today = new Date();
  let age = today.getFullYear() - BIRTH_DATE.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > BIRTH_DATE.getMonth() ||
    (today.getMonth() === BIRTH_DATE.getMonth() &&
      today.getDate() >= BIRTH_DATE.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}


/** Figures for the stats row; labels come from the dictionary in the same order. */
const STAT_VALUES = ["8", "10+", "7", "12"];

/** Icons for the services, in the dictionary's order. */
const SERVICE_ICONS = ["building", "interior", "render"] as const;

function ServiceIcon({ kind }: { kind: "building" | "interior" | "render" }) {
  const paths = {
    building:
      "M8 40 V14 L22 8 V40 M22 16 H38 V40 M4 40 H44 M13 18 V20 M13 25 V27 M13 32 V34 M28 22 V24 M33 22 V24 M28 29 V31 M33 29 V31",
    interior:
      "M6 30 V24 Q6 20 10 20 H38 Q42 20 42 24 V30 M10 20 V14 Q10 10 14 10 H34 Q38 10 38 14 V20 M4 30 H44 V36 H4 Z M8 36 V40 M40 36 V40",
    render:
      "M24 6 L41 15 V33 L24 42 L7 33 V15 Z M7 15 L24 24 L41 15 M24 24 V42",
  };
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="service-icon">
      <path
        d={paths[kind]}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const d = (i: number) => ({ ["--i" as string]: i });

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = await getDictionary(lang);
  const [dbProjects, cvUrl] = await Promise.all([
    getProjectsSafe(),
    getCvUrlSafe(),
  ]);
  const projects = withLocalSample(dbProjects);

  return (
    <main className="site">
      <Reveal />
      <SiteNav email={EMAIL} lang={lang} t={t.nav} />
      <Hero t={t.hero} />

      {/* ABOUT */}
      <section
        id="about"
        className="section about container"
        aria-labelledby="about-title"
      >
        <div className="about-panel" data-reveal>
          <p className="eyebrow">{t.about.eyebrow}</p>
          <h2 id="about-title">{t.about.title}</h2>
          <p>{fmt(t.about.p1, { age: computedAge() })}</p>
          <p>{t.about.p2}</p>
          {cvUrl ? (
            <a
              href={cvUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-solid"
            >
              {t.about.cv} <Arrow />
            </a>
          ) : (
            <a href="#contact" className="btn btn-solid">
              {t.about.getInTouch} <Arrow />
            </a>
          )}
        </div>
        <div className="about-img" data-reveal style={d(1)}>
          <Image
            src="/images/about-portrait1.jpg"
            alt={t.about.portraitAlt}
            fill
            priority
            sizes="200px"
            className="object-cover"
            style={{ objectPosition: "50% 50%" }}
          />
        </div>
      </section>

      {/* STATS */}
      <section className="stats container" aria-label={t.stats.label}>
        {t.stats.items.map((label, i) => (
          <div key={i} className="stat" data-reveal style={d(i)}>
            <p className="stat-value">{STAT_VALUES[i]}</p>
            <p className="stat-label">{label}</p>
          </div>
        ))}
      </section>

      {/* SERVICES */}
      <section
        id="services"
        className="services-band"
        aria-labelledby="services-title"
      >
        <div className="container">
          <div className="services-head">
            <div data-reveal>
              <p className="eyebrow">{t.services.eyebrow}</p>
              <h2 id="services-title">{t.services.title}</h2>
            </div>
            <p data-reveal style={d(1)}>
              {t.services.intro}
            </p>
          </div>
          <div className="services">
            {t.services.items.map((s, i) => (
              <article
                key={i}
                className="service"
                data-reveal
                style={d(i)}
              >
                <ServiceIcon kind={SERVICE_ICONS[i]} />
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section
        id="projects"
        className="section container"
        aria-labelledby="projects-title"
      >
        <div className="section-head" data-reveal>
          <p className="eyebrow">{t.projects.eyebrow}</p>
          <h2 id="projects-title">{t.projects.title}</h2>
        </div>
        {projects.length === 0 ? (
          <p className="text-center text-[var(--muted)]">
            {t.projects.empty}
          </p>
        ) : (
          <ProjectGrid
            projects={projects.map((p) => ({
              ...p,
              category: categoryLabel(t, p.category),
            }))}
            lang={lang}
            t={t.projects}
          />
        )}
      </section>

      {/* TOOLS */}
      <section
        id="tools"
        className="section tools container"
        aria-labelledby="tools-title"
      >
        <div className="tools-head" data-reveal>
          <p className="eyebrow">{t.tools.eyebrow}</p>
          <h2 id="tools-title">{t.tools.title}</h2>
          <p>{t.tools.intro}</p>
          <p className="tools-next">
            <strong>{t.tools.nextLabel}</strong> {t.tools.next}
          </p>
        </div>
        <ToolSheet uses={t.tools.uses} />
      </section>

      <SiteFooter lang={lang} t={t} />
    </main>
  );
}
