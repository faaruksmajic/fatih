import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/Hero";
import { PlanDrawing } from "@/components/PlanDrawing";
import { getProjectsSafe } from "@/db/queries";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { projectCategoryLabel } from "@/lib/categories";
import { withLocalSample } from "@/lib/sample-projects";

/**
 * The 404: a drawing of a room that isn't on the plan, the two ways back,
 * and a few projects so a dead link still leads somewhere.
 * `plain` renders ordinary anchors, for the global 404 that sits outside
 * the site's root layout.
 */
export async function NotFoundView({
  lang,
  t,
  plain = false,
}: {
  lang: Locale;
  t: Dictionary;
  plain?: boolean;
}) {
  const nf = t.notFound;
  const href = (path: string) => localePath(lang, path);
  const A = plain ? "a" : Link;
  const projects = withLocalSample(await getProjectsSafe()).slice(0, 3);

  return (
    <>
      <section className="nf container" aria-labelledby="nf-title">
        <PlanDrawing caption={nf.plan} />
        <div className="nf-copy">
          <p className="eyebrow">{nf.eyebrow}</p>
          <h1 id="nf-title">{nf.title}</h1>
          <p className="nf-body">{nf.body}</p>
          <div className="nf-actions">
            <A href={href("/")} className="btn btn-solid">
              {nf.home} <Arrow />
            </A>
            <A href={href("/#projects")} className="btn btn-outline">
              {nf.projects}
            </A>
          </div>
        </div>
      </section>

      {projects.length > 0 && (
        <section className="nf-suggest container" aria-labelledby="nf-suggest">
          <h2 id="nf-suggest">{nf.suggest}</h2>
          <ul className="nf-cards">
            {projects.map((p) => (
              <li key={p.id}>
                <A href={href(`/projects/${p.id}`)} className="nf-card" data-glow>
                  <span className="nf-card-media">
                    <Image
                      src={p.coverImage}
                      alt=""
                      fill
                      sizes="(max-width: 680px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </span>
                  <span className="nf-card-text">
                    <span className="nf-card-cat">{projectCategoryLabel(p, lang, t)}</span>
                    <span className="nf-card-title" dir="auto">{p.title}</span>
                  </span>
                </A>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
