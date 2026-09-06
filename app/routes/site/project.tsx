import { Link, data } from "react-router";
import type { Route } from "./+types/project";
import { cloudflareContext } from "~/lib/context";
import { repo } from "~/lib/db.server";
import { buildMeta } from "~/lib/seo";
import { plainText, renderMarkdown } from "~/lib/markdown";
import { imageUrl, srcSet } from "~/lib/cloudinary";
import { Container } from "~/components/site/Container";
import { Reveal } from "~/components/site/Reveal";
import { Parallax } from "~/components/site/Parallax";
import { Magnetic } from "~/components/site/Magnetic";

const STATUS_LABEL: Record<string, string> = { live: "En línea", building: "En construcción", archived: "Archivado", concept: "Concepto" };

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [];
  const { project, settings, siteUrl, cloudName } = loaderData;
  return buildMeta({
    settings,
    siteUrl,
    cloudName,
    path: `/proyectos/${project.slug}`,
    title: project.title,
    description: project.tagline || plainText(project.description) || undefined,
    image: project.cover_image,
    type: "article",
  });
}

export async function loader({ params, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const r = repo(env);
  const project = await r.getProjectBySlug(params.slug);
  if (!project || !project.visible) throw data("Proyecto no encontrado", { status: 404 });
  const [settings, all] = await Promise.all([r.getSettings(), r.listProjects({ visibleOnly: true })]);
  const idx = all.findIndex((p) => p.id === project.id);
  const next = all.length > 1 ? all[(idx + 1) % all.length] : null;
  const prev = all.length > 1 ? all[(idx - 1 + all.length) % all.length] : null;
  return { project, next, prev, settings, siteUrl: env.SITE_URL, cloudName: env.CLOUDINARY_CLOUD_NAME, position: idx + 1, total: all.length };
}

export default function ProjectPage({ loaderData }: Route.ComponentProps) {
  const { project: p, next, prev, cloudName, position, total } = loaderData;
  const accent = p.accent || "var(--color-accent)";
  const html = renderMarkdown(p.description);
  return (
    <main className="project-page" style={{ ["--card-accent" as string]: accent }}>
      <section className="pt-32 md:pt-40">
        <Container>
          <p data-reveal className="eyebrow">
            <Link to="/#proyectos" className="hover:text-paper">
              ← Proyectos
            </Link>
            <span className="mx-3 text-paper/30">—</span>
            {String(position).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
          <Reveal as="h1" className="display-xl mt-6" type="words">
            {p.title}
          </Reveal>
          {p.tagline && (
            <p data-reveal className="mt-6 max-w-2xl text-xl text-muted md:text-2xl">
              {p.tagline}
            </p>
          )}
          <dl className="project-meta mt-12" data-reveal>
            {p.role && (
              <div>
                <dt>Rol</dt>
                <dd>{p.role}</dd>
              </div>
            )}
            {p.year && (
              <div>
                <dt>Año</dt>
                <dd>{p.year}</dd>
              </div>
            )}
            <div>
              <dt>Estado</dt>
              <dd style={{ color: accent }}>{STATUS_LABEL[p.status] ?? p.status}</dd>
            </div>
            {p.stack.length > 0 && (
              <div className="col-span-2 md:col-span-1">
                <dt>Stack</dt>
                <dd>{p.stack.join(" · ")}</dd>
              </div>
            )}
            {(p.url || p.repo_url) && (
              <div>
                <dt>Enlaces</dt>
                <dd className="flex flex-wrap gap-4">
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noreferrer" className="link-underline">
                      Visitar ↗
                    </a>
                  )}
                  {p.repo_url && (
                    <a href={p.repo_url} target="_blank" rel="noreferrer" className="link-underline">
                      Código ↗
                    </a>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </Container>
      </section>

      {p.cover_image && (
        <section className="mt-14 md:mt-20">
          <Container wide>
            <Parallax className="project-cover" amount={5}>
              <img
                src={imageUrl(p.cover_image, cloudName, { w: 1800, h: 1050, crop: "fill" })}
                srcSet={srcSet(p.cover_image, cloudName, [800, 1200, 1600, 2000], { h: 1050, crop: "fill" })}
                sizes="100vw"
                alt={p.title}
                decoding="async"
              />
            </Parallax>
          </Container>
        </section>
      )}

      {html && (
        <section className="section">
          <Container>
            <div className="grid gap-10 md:grid-cols-12">
              <aside className="md:col-span-3">
                <div className="md:sticky md:top-28" data-reveal>
                  <p className="eyebrow">Historia</p>
                  {p.tags.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {p.tags.map((t) => (
                        <li key={t} className="chip chip-sm">
                          {t}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </aside>
              <div className="prose-editorial prose-lg md:col-span-8 md:col-start-5" data-reveal dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </Container>
        </section>
      )}

      {p.gallery.length > 0 && (
        <section className="pb-24 md:pb-32">
          <Container wide>
            <div className="grid gap-6 md:grid-cols-2">
              {p.gallery.map((g, i) => (
                <figure key={i} className={i % 3 === 0 ? "md:col-span-2" : ""} data-reveal>
                  <img
                    src={imageUrl(g, cloudName, { w: 1600 })}
                    srcSet={srcSet(g, cloudName, [640, 1000, 1600])}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    alt={`${p.title} — imagen ${i + 1}`}
                    className="w-full rounded-2xl border border-line"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              ))}
            </div>
          </Container>
        </section>
      )}

      {p.url && (
        <section className="pb-24 md:pb-32">
          <Container>
            <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-line p-8 md:p-12" data-reveal>
              <div>
                <p className="eyebrow">Ver en vivo</p>
                <p className="mt-2 font-display text-2xl font-bold md:text-3xl">{p.url.replace(/^https?:\/\//, "")}</p>
              </div>
              <Magnetic>
                <a href={p.url} target="_blank" rel="noreferrer" className="btn-primary btn-lg">
                  Abrir {p.title} ↗
                </a>
              </Magnetic>
            </div>
          </Container>
        </section>
      )}

      {(next || prev) && (
        <nav className="border-t border-line" aria-label="Más proyectos">
          <Container>
            <div className="grid md:grid-cols-2">
              {prev && (
                <Link to={`/proyectos/${prev.slug}`} className="project-next group border-b border-line md:border-b-0 md:border-r" prefetch="intent">
                  <p className="eyebrow">← Anterior</p>
                  <p className="mt-3 font-display text-3xl font-bold tracking-tight transition-colors group-hover:text-accent md:text-5xl">{prev.title}</p>
                </Link>
              )}
              {next && (
                <Link to={`/proyectos/${next.slug}`} className="project-next group md:text-right" prefetch="intent">
                  <p className="eyebrow md:justify-end">Siguiente →</p>
                  <p className="mt-3 font-display text-3xl font-bold tracking-tight transition-colors group-hover:text-accent md:text-5xl">{next.title}</p>
                </Link>
              )}
            </div>
          </Container>
        </nav>
      )}
    </main>
  );
}
