import Image from "next/image";

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#notable", label: "Notable" },
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

const FEATURED_PROJECTS = [
  {
    tag: "First Project",
    title: "ATAL Group Office Building",
    image: "/images/project-atal-group.jpg",
    description:
      "A five-story mixed-use building combining functionality and modern minimalism in an urban setting. The first four floors are flexible office space with abundant natural light, while the top two floors hold two luxurious penthouses with private terraces. A sleek black-and-white facade with black-framed windows creates a contemporary, high-contrast identity, supported by a large front parking area for tenants and residents alike.",
    align: "right" as const,
  },
  {
    tag: "Second Project",
    title: "Private Residence, Brčko",
    image: "/images/project-brcko-house.jpg",
    description:
      "A single-story modern house in Brčko, BiH spanning over 300 m². Built with American walls beneath a four-sloped roof, finished with anthracite windows and a matching gate. The garage fits up to four cars, the backyard includes a pool and terrace, and the attic is designed as a home gym — a comfortable, stylish family home built on contemporary aesthetics.",
    align: "left" as const,
  },
  {
    tag: "Third Project",
    title: "Modern Kitchen Interior",
    image: "/images/project-kitchen.jpg",
    description:
      "An interior study of a modern kitchen finished in wood and matte black. A central island anchors the space, balancing aesthetics and functionality — every detail, from cabinetry to material choice, reflects a thoughtful design approach aimed at a sleek, highly functional result.",
    align: "right" as const,
  },
];

const NOTABLE_PROJECTS = [
  { image: "/images/notable-01.jpg", label: "Project 01" },
  { image: "/images/notable-02.jpg", label: "Project 02" },
  { image: "/images/notable-03.jpg", label: "Project 03" },
];

export default function Home() {
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
      <section id="top" className="bg-charcoal text-paper pt-32 md:pt-40 pb-16 md:pb-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-display text-[15vw] md:text-[6.5vw] leading-[0.85] mb-8">
              MY
              <br />
              PORT
              <br />
              FOLIO
            </h1>
            <p className="uppercase text-sm tracking-wide mb-4 text-paper/70">By Škrijelj Fatih</p>
            <p className="max-w-md text-paper/80 leading-relaxed">
              As a fourth-year architecture student with a four-year background as an
              architectural technician, I have spent the past eight years immersed in design
              and construction. With over ten built projects and strong skills in
              visualization and digital tools, I approach every project with precision,
              curiosity, and a commitment to creating meaningful spaces.
            </p>
            <a
              href="#contact"
              className="inline-block mt-8 bg-paper text-ink font-semibold px-6 py-3 hover:bg-paper/80 transition-colors"
            >
              Let&apos;s connect
            </a>
          </div>
          <div className="relative aspect-[2/3] w-full max-w-md mx-auto md:ml-auto">
            <Image
              src="/images/hero-portrait.jpg"
              alt="Portrait of Škrijelj Fatih"
              fill
              priority
              className="object-cover grayscale"
              sizes="(min-width: 768px) 400px, 80vw"
            />
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

      {/* FEATURED PROJECTS */}
      <section id="work" className="bg-paper text-ink">
        {FEATURED_PROJECTS.map((project, i) => (
          <div
            key={project.title}
            className={`py-20 md:py-28 px-6 md:px-12 ${i % 2 === 1 ? "bg-ink text-paper" : ""}`}
          >
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <div
                className={`relative aspect-[4/3] w-full ${
                  project.align === "left" ? "md:order-2" : ""
                }`}
              >
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover grayscale"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className={project.align === "left" ? "md:order-1" : ""}>
                <p
                  className={`uppercase text-sm tracking-wide mb-2 ${
                    i % 2 === 1 ? "text-paper/60" : "text-ink/60"
                  }`}
                >
                  {project.tag}
                </p>
                <h3 className="font-display text-[10vw] md:text-[3.5vw] leading-[0.9] mb-6">
                  {project.title}
                </h3>
                <p
                  className={`leading-relaxed max-w-md ${
                    i % 2 === 1 ? "text-paper/75" : "text-ink/75"
                  }`}
                >
                  {project.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* NOTABLE PROJECTS */}
      <section id="notable" className="bg-paper text-ink py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-[13vw] md:text-[5vw] leading-[0.85] mb-14">
            NOTABLE
            <br />
            PROJECTS
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {NOTABLE_PROJECTS.map((project) => (
              <div key={project.label}>
                <div className="relative aspect-[4/3] w-full mb-3">
                  <Image
                    src={project.image}
                    alt={project.label}
                    fill
                    className="object-cover grayscale"
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                </div>
                <p className="font-semibold">{project.label}</p>
              </div>
            ))}
          </div>
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

      {/* CONTACT */}
      <section id="contact" className="bg-paper text-ink py-20 md:py-28 px-6 md:px-12">
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
      <footer className="bg-charcoal text-paper/60 py-8 px-6 md:px-12 text-sm flex flex-col sm:flex-row gap-2 justify-between items-center">
        <p>© {new Date().getFullYear()} Škrijelj Fatih. All rights reserved.</p>
        <p>Built with precision and a clear creative vision.</p>
      </footer>
    </main>
  );
}
