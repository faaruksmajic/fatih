import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

const d = (i: number) => ({ ['--i' as string]: i });

export default async function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations('site');

  return (
    <section
      id="about"
      className="section about container"
      aria-labelledby="about-title"
    >
      <div className="about-panel" data-reveal>
        <p className="eyebrow">{t('about.eyebrow')}</p>
        <h2 id="about-title">{t('about.title')}</h2>
        <p>
          {t.rich('about.description1', {
            age: computedAge(),
          })}
        </p>
        <p>{t('about.description2')}</p>
      </div>
      <div className="about-img" data-reveal style={d(1)}>
        <Image
          src="/images/about-portrait1.jpg"
          alt="Fatih Škrijelj portrait"
          fill
          priority
          sizes="200px"
          className="object-cover"
          style={{ objectPosition: "50% 50%" }}
        />
      </div>
    </section>
  );
}