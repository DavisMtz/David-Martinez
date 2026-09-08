import type { Section, Skill } from "~/lib/types";
import { SKILL_CATEGORIES } from "~/lib/types";
import { resolveContent } from "~/lib/sections";
import { Container } from "../Container";
import { SectionHeader } from "../SectionHeader";

export function Skills({ section, index, skills }: { section: Section; index: number; skills: Skill[] }) {
  const c = resolveContent<{ layout: "constellation" | "grid" }>("skills", section.content);
  const groups = SKILL_CATEGORIES.map(category => ({ ...category, skills: skills.filter(skill => skill.category === category.value) })).filter(group => group.skills.length);
  return <section id={section.id} className="section" data-section="skills">
    <Container>
      <SectionHeader index={index} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
      <div className={c.layout === "constellation" ? "knowledge-map" : "grid gap-10 md:grid-cols-2 lg:grid-cols-3"}>
        {groups.map((group, i) => <div key={group.value} className={c.layout === "constellation" ? "knowledge-cluster" : ""} data-reveal>
          <div className="knowledge-heading"><h3>{group.label}</h3><span aria-hidden="true">{String(i+1).padStart(2,"0")}</span></div>
          <ul className={c.layout === "constellation" ? "knowledge-nodes" : "mt-5 flex flex-wrap gap-2"}>
            {group.skills.map(skill => <li key={skill.id} className={c.layout === "constellation" ? "knowledge-node" : "chip"}>
              {c.layout === "constellation" && <span className="knowledge-point" aria-hidden="true" style={{ width: 4 + Math.max(1,Math.min(5,skill.level))*2, height: 4 + Math.max(1,Math.min(5,skill.level))*2 }} />}
              <span>{skill.name}</span>
            </li>)}
          </ul>
        </div>)}
      </div>
    </Container>
  </section>;
}
