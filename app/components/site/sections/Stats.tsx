import { useRef } from "react";
import type { Section } from "~/lib/types";
import { resolveContent } from "~/lib/sections";
import { Container } from "../Container";
import { SectionHeader } from "../SectionHeader";
import { gsap, prefersReducedMotion, registerGsap, useGSAP } from "~/lib/motion";

interface StatsContent {
  items: { value: string; suffix?: string; label: string }[];
}

export function Stats({ section, index }: { section: Section; index: number }) {
  const c = resolveContent<StatsContent>("stats", section.content);
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const nums = root.current?.querySelectorAll<HTMLElement>("[data-count]");
      if (!nums?.length || prefersReducedMotion()) return;
      nums.forEach((el) => {
        const target = Number(el.dataset.count);
        if (!Number.isFinite(target)) return;
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(Math.round(obj.v));
          },
        });
      });
    },
    { scope: root },
  );

  if (!c.items.length) return null;
  return (
    <section ref={root} id={section.id} className="section-tight" data-section="stats">
      <Container>
        <SectionHeader index={index} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
        <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {c.items.map((it, i) => {
            const numeric = Number(String(it.value).replace(/[^\d.]/g, ""));
            return (
              <div key={i} className="bg-ink px-6 py-8 md:px-8 md:py-10" data-reveal>
                <dd className="font-display text-5xl font-extrabold tracking-tighter md:text-6xl">
                  <span data-count={Number.isFinite(numeric) && it.value.trim() !== "" ? numeric : undefined}>{it.value}</span>
                  <span className="text-accent">{it.suffix}</span>
                </dd>
                <dt className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{it.label}</dt>
              </div>
            );
          })}
        </dl>
      </Container>
    </section>
  );
}
