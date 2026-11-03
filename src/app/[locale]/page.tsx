import { useTranslations } from '@/lib/useTranslations';
import { SiteNav } from '@/components/SiteNav';
import { Hero } from '@/components/Hero';
import { Reveal } from '@/components/Reveal';
import { getCvUrlSafe, getProjectsSafe } from '@/db/queries';
import { withLocalSample } from '@/lib/sample-projects';
import { EMAIL, PHONE, PHONE_HREF } from '@/lib/site';

// Age is computed from the birth date so it stays correct after each birthday.
const BIRTH_DATE = new Date('2002-06-04T00:00:00');

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

export default function Home(
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = useTranslations('site', locale);
  const [dbProjects, cvUrl] = await Promise.all([
    getProjectsSafe(),
    getCvUrlSafe(),
  ]);
  const projects = withLocalSample(dbProjects);
  const age = computedAge();

  return (
    <main className="site">
      <Reveal />
      <SiteNav email={EMAIL} locale={locale} />
      <Hero t={t} age={age} />
      {/* Rest of the page components */}
    </main>
  );
}