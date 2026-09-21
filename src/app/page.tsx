import Image from "next/image";
import { TechPrograms } from "@/components/TechPrograms";
import { getCvUrlSafe, getProjectsSafe } from "@/db/queries";

export const revalidate = 3600;

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
];

const SKILLS = [
  {
    title: "Visualization & Creative Thinking",
    body: "Translating concepts into striking, atmospheric renders that communicate a project's mood before it's ever built.",
  },
  {
    title: "Technical Precision & Organization",
    body: "Well-organized, buildable documentation grounded in eight years of hands-on design and construction experience.",
  },
  {
    title: "Software Proficiency",
    body: "Expert use of architectural and visualization software across the full workflow, from concept to final render.",
  },
];

export default async function Home() {
  const [projects, cvUrl] = await Promise.all([getProjectsSafe(), getCvUrlSafe()]);
  return (
    <main className="flex flex-col">
      {/* NAV */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-paper/90 backdrop-blur-sm border-b border-ink/10">
        <a href="#top" className="font-display text-lg tracking-tight">
          FATIH ŠKRIJELJ
        </a>
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:opacity-60 transition-opacity">
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href="mailto:skrijeljfatih3@gmail.com"
          className="text-sm font-semibold border border-ink px-4 py-2 hover:bg-ink hover:text-paper transition-colors"
        >
          Get in touch
        </a>
      </header>

      {/* HERO */}
      <section
        id="top"
        className="relative overflow-hidden text-paper pt-32 md:pt-40 pb-16 md:pb-24 px-6 md:px-12"
      >
        <Image
          src="/images/hero-portrait.jpg"
          alt="Portrait of Škrijelj Fatih"
          fill
          priority
          className="object-cover grayscale"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-charcoal/80" />
        <div className="relative max-w-7xl mx-auto">
          <h1 className="font-display text-[15vw] md:text-[6.5vw] leading-[0.85] mb-8">
            MY
            <br />
            PORT
            <br />
            FOLIO
          </h1>
          <p className="uppercase text-sm tracking-wide mb-4 text-paper/70">By Škrijelj Fatih</p>
          <p className="max-w-2xl text-paper/80 leading-relaxed">
            As a fourth-year architecture student with a four-year background as an
            architectural technician, I have spent the past eight years immersed in design
            and construction. With over ten built projects and strong skills in
            visualization and digital tools, I approach every project with precision,
            curiosity, and a commitment to creating meaningful spaces.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <a
              href="#contact"
              className="inline-block bg-paper text-ink font-semibold px-6 py-3 hover:bg-paper/80 transition-colors"
            >
              Let&apos;s connect
            </a>
            {cvUrl && (
              <a
                href={cvUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block border border-paper text-paper font-semibold px-6 py-3 hover:bg-paper hover:text-ink transition-colors"
              >
                Download CV
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-paper text-ink py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div className="order-2 md:order-1">
            <p className="leading-relaxed text-ink/80 mb-10 max-w-md">
              I&apos;m a 23-year-old architecture student from Sarajevo, currently in my fourth
              year of studies. With eight years in the field — from technical high school to
              university — I&apos;ve worked on residential, commercial, and urban design
              projects, gaining seven months of studio experience and strong skills in
              visualization and architectural software. Passionate about minimalism and both
              interior and exterior design, I approach every project with precision,
              dedication, and a clear creative vision.
            </p>
            <h2 className="font-display text-[13vw] md:text-[5vw] leading-[0.85]">
              WHO
              <br />I AM
            </h2>
          </div>
          <div className="relative aspect-[2/3] w-full max-w-md order-1 md:order-2">
            <Image
              src="/images/about-portrait.jpg"
              alt="Škrijelj Fatih on a balcony"
              fill
              className="object-cover grayscale"
              sizes="(min-width: 768px) 400px, 80vw"
            />
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section className="bg-charcoal text-paper py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="uppercase text-sm tracking-wide text-paper/60 mb-2">
            What I Bring to the Table
          </p>
          <h2 className="font-display text-[13vw] md:text-[5vw] leading-[0.85] mb-14">
            PERSONAL
            <br />
            SKILLS
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {SKILLS.map((skill) => (
              <div key={skill.title} className="border-t border-paper/20 pt-6">
                <h3 className="font-semibold text-lg mb-3">{skill.title}</h3>
                <p className="text-paper/70 leading-relaxed">{skill.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="work" className="bg-paper text-ink py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-[13vw] md:text-[5vw] leading-[0.85] mb-14">
            PROJECTS
          </h2>
          {projects.length === 0 ? (
            <p className="text-ink/60">Projects coming soon.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-16">
              {projects.map((project) => (
                <article key={project.id} className="flex flex-col gap-4">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      className="object-cover grayscale"
                      sizes="(min-width: 768px) 50vw, 100vw"
                    />
                  </div>
                  <p className="uppercase text-sm tracking-wide text-ink/60">{project.category}</p>
                  <h3 className="font-display text-2xl md:text-3xl leading-[0.9]">{project.title}</h3>
                  <p className="leading-relaxed text-ink/75 max-w-md">{project.description}</p>
                  {project.images.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {project.images.map((image) => (
                        <div key={image.id} className="relative w-16 h-16 shrink-0">
                          <Image
                            src={image.imageUrl}
                            alt=""
                            fill
                            className="object-cover grayscale"
                            sizes="64px"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHAT'S NEXT */}
      <section className="bg-charcoal text-paper py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="uppercase text-sm tracking-wide text-paper/60 mb-2">
            Upcoming Projects
          </p>
          <p className="max-w-md text-paper/80 leading-relaxed mb-10">
            Looking ahead, my short-term goal is to complete my architectural studies and
            gain professional experience in a reputable firm, learning as much as possible
            from each project. Long-term, I aspire to establish my own architectural
            practice, leading a team to create large-scale, innovative projects that
            reflect my vision and design values.
          </p>
          <h2 className="font-display text-[13vw] md:text-[5vw] leading-[0.85]">
            WHAT&apos;S
            <br />
            NEXT?
          </h2>
        </div>
      </section>

      {/* TECH PROGRAMS */}
      <section id="tools" className="bg-paper text-ink py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="uppercase text-sm tracking-wide text-ink/60 mb-2">What I Work With</p>
          <h2 className="font-display text-[13vw] md:text-[5vw] leading-[0.85] mb-14">
            SOFTWARE
            <br />& TOOLS
          </h2>
          <TechPrograms />
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-paper text-ink py-20 md:py-28 px-6 md:px-12 border-t border-ink/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-[13vw] md:text-[5vw] leading-[0.85] mb-14">
            LET&apos;S
            <br />
            CONNECT
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl">
            <a
              href="tel:+38762504287"
              className="flex flex-col gap-2 border-t border-ink/20 pt-4 hover:opacity-60 transition-opacity"
            >
              <span className="text-xs uppercase tracking-wide text-ink/50">Phone</span>
              <span className="font-medium">+387 62 504 287</span>
            </a>
            <a
              href="mailto:skrijeljfatih3@gmail.com"
              className="flex flex-col gap-2 border-t border-ink/20 pt-4 hover:opacity-60 transition-opacity"
            >
              <span className="text-xs uppercase tracking-wide text-ink/50">Email</span>
              <span className="font-medium break-all">skrijeljfatih3@gmail.com</span>
            </a>
            <div className="flex flex-col gap-2 border-t border-ink/20 pt-4">
              <span className="text-xs uppercase tracking-wide text-ink/50">Location</span>
              <span className="font-medium">Sarajevo, Bosnia and Herzegovina</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-paper text-ink/60 py-8 px-6 md:px-12 text-sm flex flex-col sm:flex-row gap-2 justify-between items-center border-t border-ink/10">
        <p>© {new Date().getFullYear()} Škrijelj Fatih. All rights reserved.</p>
        <p>Built with precision and a clear creative vision.</p>
      </footer>
    </main>
  );
}
