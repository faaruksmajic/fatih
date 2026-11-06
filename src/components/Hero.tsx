import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";

export function Hero({ t }: { t: Dictionary["hero"] }) {
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

      <div className="hero-content container">
        <h1 id="hero-title" className="hero-title">
          <bdi>Fatih Škrijelj</bdi>
          <span>{t.subtitle}</span>
        </h1>
        <p className="hero-lead">{t.lead}</p>
        <div className="hero-actions">
          <a href="#projects" className="btn btn-solid">
            {t.explore} <Arrow />
          </a>
          <a href="#contact" className="text-link">
            {t.contact}
          </a>
        </div>
      </div>
    </section>
  );
}

/** Points forward in the reading direction (mirrored in right-to-left pages by CSS). */
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
