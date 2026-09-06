import { useRef } from "react";
import type { Experience as Exp, Section } from "~/lib/types";
import { resolveContent } from "~/lib/sections";
import { renderMarkdown } from "~/lib/markdown";
import { Container } from "../Container";
import { SectionHeader } from "../SectionHeader";
import { gsap, prefersReducedMotion, registerGsap, useGSAP } from "~/lib/motion";
import { formatPeriod } from "~/lib/utils";

const KIND_LABEL: Record<string, string> = { work: "trabajo", education: "formación", award: "reconocimiento", community: "comunidad" };

export function Experience({ section, index, items }: { section: Section; index: number; items: Exp[] }) {
  const c = resolveContent<{ kinds: string[] }>("experience", section.content);
  const list = items.filter((e) => !c.kinds?.length || c.kinds.includes(e.kind));
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const line = root.current?.querySelector<HTMLElement>(".timeline-progress");
      if (!line || prefersReducedMotion()) return;
      gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 70%", end: "bottom 70%", scrub: true } });
    },
    { scope: root },
  );

  return (
    <section ref={root} id={section.id} className="section" data-section="experience">
      <Container>
        <SectionHeader index={index} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
        <div className="timeline">
          <div className="timeline-track" aria-hidden="true">
            <div className="timeline-progress" />
          </div>
          <ol className="flex flex-col">
            {list.map((e) => (
              <li key={e.id} className="timeline-item" data-reveal>
                <div className="timeline-meta">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{formatPeriod(e.start_date, e.end_date)}</p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                    {KIND_LABEL[e.kind] ?? e.kind}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                </div>
                <div className="timeline-body">
                  <h3 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{e.role}</h3>
                  <p className="mt-1 text-lg text-muted">
                    {e.url ? (
                      <a href={e.url} target="_blank" rel="noreferrer" className="link-underline">
                        {e.organization}
                      </a>
                    ) : (
                      e.organization
                    )}
                  </p>
                  {e.description && <div className="prose-editorial prose-sm mt-4" dangerouslySetInnerHTML={{ __html: renderMarkdown(e.description) }} />}
                  {e.highlights.length > 0 && (
                    <ul className="mt-4 flex flex-col gap-2">
                      {e.highlights.map((h, i) => (
                        <li key={i} className="flex gap-3 text-muted">
                          <span className="mt-2 h-px w-4 shrink-0 bg-accent/70" aria-hidden="true" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
