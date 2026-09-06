import { useRef } from "react";
import { Link } from "react-router";
import type { Project, Section } from "~/lib/types";
import { resolveContent } from "~/lib/sections";
import { imageUrl, srcSet } from "~/lib/cloudinary";
import { useSite } from "../context";
import { Container } from "../Container";
import { SectionHeader } from "../SectionHeader";
import { gsap, prefersReducedMotion, registerGsap, useGSAP } from "~/lib/motion";
import { cx } from "~/lib/utils";

interface ProjectsContent {
  layout: "rail" | "grid" | "list";
  limit: number;
  onlyFeatured: boolean;
}

const STATUS_LABEL: Record<string, string> = { live: "en línea", building: "en construcción", archived: "archivado", concept: "concepto" };

function ProjectCard({ p, i, cloudName, className }: { p: Project; i: number; cloudName: string; className?: string }) {
  const accent = p.accent || "var(--color-accent)";
  return (
    <Link
      to={`/proyectos/${p.slug}`}
      className={cx("project-card group", className)}
      style={{ ["--card-accent" as string]: accent }}
      data-cursor
      data-cursor-label="Ver"
      prefetch="intent"
    >
      <div className="project-card-media">
        {p.cover_image ? (
          <img
            src={imageUrl(p.cover_image, cloudName, { w: 1200, h: 750, crop: "fill" })}
            srcSet={srcSet(p.cover_image, cloudName, [640, 960, 1280, 1600], { h: 750, crop: "fill" })}
            sizes="(min-width: 1024px) 60vw, 100vw"
            alt={p.title}
            loading={i < 2 ? "eager" : "lazy"}
            decoding="async"
          />
        ) : (
          <div className="project-card-placeholder">
            <span className="font-display text-[clamp(3rem,10vw,8rem)] font-extrabold leading-none tracking-tighter text-paper/10">{p.title}</span>
          </div>
        )}
        <div className="project-card-glow" aria-hidden="true" />
      </div>
      <div className="mt-5 flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            <span>{String(i + 1).padStart(2, "0")}</span>
            {p.year && <span>{p.year}</span>}
            <span className="text-[color:var(--card-accent)]">{STATUS_LABEL[p.status] ?? p.status}</span>
          </div>
          <h3 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">{p.title}</h3>
          {p.tagline && <p className="mt-1 max-w-md text-muted">{p.tagline}</p>}
        </div>
        <span className="project-card-arrow" aria-hidden="true">
          ↗
        </span>
      </div>
      {p.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {p.tags.slice(0, 4).map((t) => (
            <li key={t} className="chip chip-sm">
              {t}
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}

export function Projects({ section, index, projects }: { section: Section; index: number; projects: Project[] }) {
  const { cloudName } = useSite();
  const c = resolveContent<ProjectsContent>("projects", section.content);
  const list = (c.onlyFeatured ? projects.filter((p) => p.featured) : projects).slice(0, c.limit || 12);
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      if (c.layout !== "rail") return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const t = track.current;
        const s = root.current;
        if (!t || !s) return;
        const distance = () => t.scrollWidth - window.innerWidth;
        gsap.to(t, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: s,
            start: "top top",
            end: () => "+=" + distance(),
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [c.layout, list.length] },
  );

  if (c.layout === "rail") {
    return (
      <section ref={root} id={section.id} className="section-rail" data-section="projects">
        <div ref={track} className="rail-track">
          <div className="rail-head">
            <SectionHeader index={index} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} className="mb-0" />
            <p className="mt-8 hidden font-mono text-[11px] uppercase tracking-[0.25em] text-muted lg:block">Desliza para explorar →</p>
          </div>
          {list.map((p, i) => (
            <ProjectCard key={p.id} p={p} i={i} cloudName={cloudName} className="rail-card" />
          ))}
          <div className="rail-end">
            <p className="font-display text-3xl font-bold tracking-tight md:text-5xl">¿Construimos algo?</p>
            <a href="#contacto" className="btn-primary btn-lg mt-6">
              Hablemos →
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={root} id={section.id} className="section" data-section="projects">
      <Container>
        <SectionHeader index={index} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
        <div className={cx(c.layout === "grid" ? "grid gap-10 md:grid-cols-2" : "flex flex-col gap-16")}>
          {list.map((p, i) => (
            <div key={p.id} data-reveal>
              <ProjectCard p={p} i={i} cloudName={cloudName} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
