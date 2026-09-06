import type { Section } from "~/lib/types";
import { resolveContent } from "~/lib/sections";

export function Marquee({ section }: { section: Section }) {
  const c = resolveContent<{ items: string[]; speed: number }>("marquee", section.content);
  if (!c.items.length) return null;
  const row = [...c.items, ...c.items];
  return (
    <section id={section.id} className="marquee" data-section="marquee" aria-label={c.items.join(", ")}>
      <div className="marquee-track" style={{ animationDuration: `${Math.max(10, c.speed || 40)}s` }}>
        {[0, 1].map((k) => (
          <div key={k} className="marquee-group" aria-hidden={k === 1}>
            {row.map((item, i) => (
              <span key={i} className="marquee-item">
                {item}
                <span className="marquee-sep">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
