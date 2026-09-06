import { useMemo, useRef } from "react";
import type { Section, Skill } from "~/lib/types";
import { SKILL_CATEGORIES } from "~/lib/types";
import { resolveContent } from "~/lib/sections";
import { Container } from "../Container";
import { SectionHeader } from "../SectionHeader";
import { gsap, prefersReducedMotion, registerGsap, useGSAP } from "~/lib/motion";

interface Node {
  skill: Skill;
  x: number;
  y: number;
  r: number;
  cat: string;
}

/** Deterministic pseudo-random from a string, so SSR and client agree. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

function layout(skills: Skill[], w: number, h: number): { nodes: Node[]; centers: { cat: string; label: string; x: number; y: number }[] } {
  const cats = SKILL_CATEGORIES.filter((c) => skills.some((s) => s.category === c.value));
  const centers = cats.map((c, i) => {
    const a = (i / cats.length) * Math.PI * 2 - Math.PI / 2;
    const rx = w * 0.34;
    const ry = h * 0.3;
    return { cat: c.value, label: c.label, x: w / 2 + Math.cos(a) * rx, y: h / 2 + Math.sin(a) * ry };
  });
  const nodes: Node[] = [];
  for (const c of centers) {
    const group = skills.filter((s) => s.category === c.cat);
    group.forEach((s, i) => {
      const golden = i * 2.399963;
      const dist = 26 + Math.sqrt(i) * 34 + hash(s.id) * 10;
      nodes.push({ skill: s, cat: c.cat, x: c.x + Math.cos(golden) * dist, y: c.y + Math.sin(golden) * dist * 0.7, r: 3 + s.level * 1.6 });
    });
  }
  return { nodes, centers };
}

export function Skills({ section, index, skills }: { section: Section; index: number; skills: Skill[] }) {
  const c = resolveContent<{ layout: "constellation" | "grid" }>("skills", section.content);
  const root = useRef<HTMLElement>(null);
  const W = 1000;
  const H = 620;
  const { nodes, centers } = useMemo(() => layout(skills, W, H), [skills]);

  useGSAP(
    () => {
      registerGsap();
      if (c.layout !== "constellation" || prefersReducedMotion()) return;
      const groups = root.current?.querySelectorAll<SVGGElement>(".skill-node");
      const links = root.current?.querySelectorAll<SVGLineElement>(".skill-link");
      if (!groups?.length) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 70%", once: true } });
      if (links?.length) tl.fromTo(links, { drawSVG: "0%", opacity: 0 }, { drawSVG: "100%", opacity: 1, duration: 1.4, stagger: 0.01, ease: "power2.out" }, 0);
      tl.fromTo(
        groups,
        { opacity: 0, scale: 0.6, transformOrigin: "center" },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          stagger: 0.03,
          ease: "expo.out",
          onComplete: () => {
            groups.forEach((g, i) => {
              gsap.to(g, { y: `+=${6 + (i % 5) * 2}`, duration: 3 + (i % 4), repeat: -1, yoyo: true, ease: "sine.inOut" });
            });
          },
        },
        0.2,
      );
    },
    { scope: root, dependencies: [c.layout, skills.length] },
  );

  if (c.layout === "grid" || skills.length === 0) {
    const cats = SKILL_CATEGORIES.filter((cat) => skills.some((s) => s.category === cat.value));
    return (
      <section ref={root} id={section.id} className="section" data-section="skills">
        <Container>
          <SectionHeader index={index} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {cats.map((cat) => (
              <div key={cat.value} data-reveal>
                <p className="eyebrow mb-4">{cat.label}</p>
                <ul className="flex flex-wrap gap-2">
                  {skills
                    .filter((s) => s.category === cat.value)
                    .map((s) => (
                      <li key={s.id} className="chip">
                        {s.name}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section ref={root} id={section.id} className="section" data-section="skills">
      <Container>
        <SectionHeader index={index} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
        <div className="constellation" data-reveal>
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Constelación de habilidades">
            <defs>
              <radialGradient id="skill-glow" r="0.5">
                <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.9" />
                <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
              </radialGradient>
            </defs>
            {nodes.map((n) => {
              const center = centers.find((k) => k.cat === n.cat)!;
              return <line key={`l-${n.skill.id}`} className="skill-link" x1={center.x} y1={center.y} x2={n.x} y2={n.y} stroke="currentColor" strokeOpacity="0.14" strokeWidth="1" />;
            })}
            {centers.map((k) => (
              <g key={k.cat} className="skill-center">
                <circle cx={k.x} cy={k.y} r="26" fill="url(#skill-glow)" opacity="0.55" />
                <circle cx={k.x} cy={k.y} r="3" fill="var(--color-accent)" />
                <text x={k.x} y={k.y - 34} textAnchor="middle" className="skill-cat">
                  {k.label.toUpperCase()}
                </text>
              </g>
            ))}
            {nodes.map((n) => (
              <g key={n.skill.id} className="skill-node" transform={`translate(${n.x} ${n.y})`}>
                <circle r={n.r + 8} fill="var(--color-accent)" opacity="0.06" />
                <circle r={n.r} fill="var(--color-paper)" opacity={0.55 + n.skill.level * 0.09} />
                <text x={n.r + 8} y={4} className="skill-label" style={{ fontSize: 11 + n.skill.level }}>
                  {n.skill.name}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <ul className="mt-8 flex flex-wrap gap-2 md:hidden">
          {skills.map((s) => (
            <li key={s.id} className="chip chip-sm">
              {s.name}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
