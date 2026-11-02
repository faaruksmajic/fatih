import Image from "next/image";

export function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <Image
        src="/images/hero-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: "50% 45%" }}
      />
      <div className="hero-shade" />

      <div className="hero-content">
        <p className="eyebrow eyebrow-light">
          Architecture · Interiors · Visualization
        </p>
        <h1 id="hero-title" className="hero-title">
          Fatih Škrijelj
          <span>Architecture &amp; Design</span>
        </h1>
        <a href="#about" className="btn btn-outline">
          Explore <Arrow />
        </a>
      </div>
    </section>
  );
}

export function Arrow() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="arrow">
      <path
        d="M2 8 H13 M9 4 L13 8 L9 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}
