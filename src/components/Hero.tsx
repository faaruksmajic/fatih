"use client";
import Image from "next/image";
import { useTranslations } from '@/lib/useTranslations';
import { Arrow } from "./Hero";

export function Hero({ t, age }: { t: any, age: number }) {
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
          {t('hero.eyebrow')}
        </p>
        <h1 id="hero-title" className="hero-title">
          {t('hero.title')} <span>{t('hero.subtitle')}</span>
        </h1>
        <a href="#about" className="btn btn-outline">
          Explore <Arrow />
        </a>
      </div>
    </section>
  );
}