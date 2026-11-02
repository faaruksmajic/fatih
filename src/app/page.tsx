import Image from "next/image";
import { Arrow, Hero } from "@/components/Hero";
import { ProjectGrid } from "@/components/ProjectGrid";
import { Reveal } from "@/components/Reveal";
import { SiteNav } from "@/components/SiteNav";
import {
  getCvUrlSafe,
  getProjectsSafe,
  type ProjectWithImages,
} from "@/db/queries";

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

const EMAIL = "skrijeljfatih3@gmail.com";
const PHONE = "+387 62 504 287";
const PHONE_HREF = "tel:+38762504287";

const STATS = [
  { value: "8", label: "Years in design & construction" },
  { value: "10+", label: "Built projects" },
  { value: "7", label: "Months of studio practice" },
  { value: "9", label: "Design programs" },
];

const SERVICES = [
  {
    title: "Architectural Design",
    body: "Homes, offices and mixed-use buildings designed from the first sketch to a buildable plan.",
    icon: "building" as const,
  },
  {
    title: "Interior Design",
    body: "Kitchens, bedrooms and living spaces that are comfortable, functional and built around the client.",
    icon: "interior" as const,
  },
  {
    title: "3D Visualization",
    body: "Photoreal renders that show the light, materials and mood of a project before it is built.",
    icon: "render" as const,
  },
];

const TOOLS = [
  "AutoCAD",
  "Revit",
  "ArchiCAD",
  "SketchUp",
  "Rhino",
  "V-Ray",
  "Lumion",
  "Photoshop",
  "Illustrator",
];

// Shown only in local development when the database is not reachable.
const LOCAL_SAMPLE: ProjectWithImages[] = [
  [
    "project-atal-group.jpg",
    "ATAL Group Office Building",
    "Commercial",
    "A five-storey mixed-use building: four floors of flexible offices with abundant daylight, two penthouses with private terraces on top, and a black-and-white facade with black-framed windows.",
  ],
  [
    "project-brcko-house.jpg",
    "Private Residence, Brčko",
    "Residential",
    "A single-storey family house of over 300 m² under a four-sloped roof, with anthracite windows, a four-car garage, a pool and terrace, and a home gym in the attic.",
  ],
  [
    "project-kitchen.jpg",
    "Modern Kitchen Interior",
    "Interior",
    "A kitchen in wood and matte black, anchored by a central island, where every cabinet and material is chosen for a sleek and highly functional result.",
  ],
  [
    "notable-01.jpg",
    "Walk-in Closet and Bedroom",
    "Interior",
    "A walk-in closet and bedroom suite finished in dark wood veneer and soft, layered textiles.",
  ],
].map(([file, title, category, description], i) => ({
  id: `sample-${i}`,
  title,
  category,
  description,
  coverImage: `/images/${file}`,
  position: i,
  images: [],
}));

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

export default async function Home() {
  const [dbProjects, cvUrl] = await Promise.all([
    getProjectsSafe(),
    getCvUrlSafe(),
  ]);
  const projects =
    dbProjects.length === 0 && process.env.NODE_ENV === "development"
      ? LOCAL_SAMPLE
      : dbProjects;

  return (
    <main className="site">
      <Reveal />
      <SiteNav email={EMAIL} />
      <Hero />

      {/* ABOUT */}
      <section
        id="about"
        className="section about container"
        aria-labelledby="about-title"
      >
        <div className="about-panel" data-reveal>
          <p className="eyebrow">Get to know me</p>
          <h2 id="about-title">About Fatih</h2>
          <p>
            I&apos;m {computedAge()}, an architecture student from Sarajevo in
            my fourth year of studies. Before university I trained and worked as
            an architectural technician, so I learned how buildings are put
            together before I learned how to design them.
          </p>
          <p>
            I&apos;ve worked on residential, commercial and urban projects,
            spent seven months in a design studio and seen more than ten of my
            projects built. I approach every project with precision, curiosity
            and a commitment to meaningful spaces.
          </p>
          {cvUrl ? (
            <a
              href={cvUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-solid"
            >
              Download CV <Arrow />
            </a>
          ) : (
            <a href="#contact" className="btn btn-solid">
              Get in touch <Arrow />
            </a>
          )}
        </div>
        <div className="about-img" data-reveal style={d(1)}>
          <Image
            src="/images/about-portrait1.jpg"
            alt="Fatih Škrijelj portrait"
            fill
            priority
            sizes="200px"
            className="object-cover"
            style={{ opacity: 0.6, objectPosition: "50% 50%" }}
          />
        </div>
      </section>

      {/* STATS */}
      <section className="stats container" aria-label="In numbers">
        {STATS.map((s, i) => (
          <div key={s.label} className="stat" data-reveal style={d(i)}>
            <p className="stat-value">{s.value}</p>
            <p className="stat-label">{s.label}</p>
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
              <p className="eyebrow">What I do</p>
              <h2 id="services-title">My Services</h2>
            </div>
            <p data-reveal style={d(1)}>
              From the first sketch to the final render, I cover the whole
              design process for homes, offices and interiors.
            </p>
          </div>
          <div className="services">
            {SERVICES.map((s, i) => (
              <article
                key={s.title}
                className="service"
                data-reveal
                style={d(i)}
              >
                <ServiceIcon kind={s.icon} />
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
          <p className="eyebrow">What I have done</p>
          <h2 id="projects-title">My Projects</h2>
          <span className="head-rule" />
        </div>
        {projects.length === 0 ? (
          <p className="text-center text-[var(--muted)]">
            New projects are coming soon.
          </p>
        ) : (
          <ProjectGrid projects={projects} />
        )}
      </section>

      {/* TOOLS */}
      <section
        id="tools"
        className="section tools container"
        aria-labelledby="tools-title"
      >
        <div className="tools-img" data-reveal>
          <Image
            src="/images/notable-03.jpg"
            alt="Render of a living room around a floating media console"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="tools-panel" data-reveal style={d(1)}>
          <p className="eyebrow">Software</p>
          <h2 id="tools-title">Tools I Work With</h2>
          <p>
            From construction drawings to final renders, I work across the full
            digital workflow.
          </p>
          <ul className="tool-list">
            {TOOLS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="tools-next">
            <strong>What&apos;s next:</strong> finish my studies, gain
            experience in a respected firm, and one day lead a practice of my
            own.
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="contact" aria-labelledby="contact-title">
        <Image
          src="/images/project-brcko-house.jpg"
          alt="Exterior view of a private residential building in Brčko with contemporary architecture design"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="contact-shade" />
        <div className="contact-content container">
          <p className="eyebrow" data-reveal>
            Let&apos;s talk
          </p>
          <h2 id="contact-title" data-reveal style={d(1)}>
            About Your Project
          </h2>
          <a
            href={`mailto:${EMAIL}?subject=Project%20enquiry`}
            className="btn btn-solid"
            data-reveal
            style={d(2)}
          >
            Get in touch <Arrow />
          </a>

          <h3 className="contact-subtitle" data-reveal style={d(3)}>
            Contact Info
          </h3>
          <ul className="contact-list" data-reveal style={d(4)}>
            <li>Location: Sarajevo, Bosnia and Herzegovina</li>
            <li>
              Telephone: <a href={PHONE_HREF}>{PHONE}</a>
            </li>
            <li>
              Email: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </li>
          </ul>
          <p className="copyright">
            © {new Date().getFullYear()} Fatih Škrijelj. All rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
}
