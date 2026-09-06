import { useRef } from "react";
import type { Section } from "~/lib/types";
import { resolveContent } from "~/lib/sections";
import { Container } from "../Container";
import { SectionHeader } from "../SectionHeader";
import { gsap, prefersReducedMotion, registerGsap, useGSAP } from "~/lib/motion";
import { cx } from "~/lib/utils";

interface QuoteItem {
  text: string;
  origin?: string;
}

interface QuotesContent {
  items: QuoteItem[];
  source: { title?: string; subtitle?: string; year?: string; note?: string; url?: string };
  layout: "stack" | "grid";
}

export function Quotes({ section, index }: { section: Section; index: number }) {
  const c = resolveContent<QuotesContent>("quotes", section.content);
  const items = (c.items ?? []).filter((q) => q.text?.trim());
  const root = useRef<HTMLElement>(null);
  const source = c.source ?? {};
  const hasSource = Boolean(source.title || source.note);

  useGSAP(
    () => {
      registerGsap();
      if (prefersReducedMotion()) return;
      const marks = root.current?.querySelectorAll<HTMLElement>(".quote-mark");
      if (!marks?.length) return;
      marks.forEach((mark) => {
        gsap.fromTo(
          mark,
          { scaleY: 0 },
          {
            scaleY: 1,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: { trigger: mark.closest("figure"), start: "top 85%", once: true },
          },
        );
      });
    },
    { scope: root, dependencies: [items.length] },
  );

  if (!items.length) return null;

  return (
    <section ref={root} id={section.id} className="section" data-section="quotes">
      <Container>
        <SectionHeader index={index} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
        <div className={cx(c.layout === "grid" ? "grid gap-x-10 gap-y-12 md:grid-cols-2" : "flex flex-col gap-12 md:gap-16")}>
          {items.map((q, i) => (
            <figure key={i} className="quote" data-reveal>
              <span className="quote-mark" aria-hidden="true" />
              <blockquote className={cx("quote-text", c.layout === "stack" && "quote-text--lg")}>{q.text}</blockquote>
              {q.origin && <figcaption className="quote-origin">{q.origin}</figcaption>}
            </figure>
          ))}
        </div>

        {hasSource && (
          <aside className="quote-source" data-reveal>
            <div>
              <p className="eyebrow">De dónde salen</p>
              <p className="mt-3 font-display text-2xl font-bold tracking-tight md:text-3xl">
                {source.title}
                {source.year && <span className="ml-3 font-mono text-sm font-normal text-muted">{source.year}</span>}
              </p>
              {source.subtitle && <p className="mt-1 text-muted">{source.subtitle}</p>}
              {source.note && <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">{source.note}</p>}
            </div>
            {source.url && (
              <a href={source.url} target="_blank" rel="noreferrer" className="btn-outline shrink-0">
                Leer un fragmento ↗
              </a>
            )}
          </aside>
        )}
      </Container>
    </section>
  );
}
