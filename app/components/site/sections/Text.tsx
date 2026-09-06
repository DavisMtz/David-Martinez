import type { Section } from "~/lib/types";
import { resolveContent } from "~/lib/sections";
import { renderMarkdown } from "~/lib/markdown";
import { Container } from "../Container";
import { SectionHeader } from "../SectionHeader";
import { cx } from "~/lib/utils";

export function Text({ section, index }: { section: Section; index: number }) {
  const c = resolveContent<{ body: string; align: "left" | "center"; size: "md" | "lg" | "xl" }>("text", section.content);
  return (
    <section id={section.id} className="section" data-section="text">
      <Container>
        <SectionHeader index={index} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} align={c.align} />
        <div
          className={cx("prose-editorial", c.size === "lg" && "prose-lg", c.size === "xl" && "prose-xl", c.align === "center" && "mx-auto text-center")}
          data-reveal
          dangerouslySetInnerHTML={{ __html: renderMarkdown(c.body) }}
        />
      </Container>
    </section>
  );
}
