import type { Section } from "~/lib/types";
import { resolveContent } from "~/lib/sections";
import { renderMarkdown } from "~/lib/markdown";
import { imageUrl, srcSet } from "~/lib/cloudinary";
import { useSite } from "../context";
import { Container } from "../Container";
import { SectionHeader } from "../SectionHeader";
import { Parallax } from "../Parallax";

interface AboutContent {
  body: string;
  image: string;
  facts: { label: string; value: string }[];
  badges: string[];
}

export function About({ section, index }: { section: Section; index: number }) {
  const { settings, cloudName } = useSite();
  const c = resolveContent<AboutContent>("about", section.content);
  const image = c.image || settings.avatar;
  const html = renderMarkdown(c.body || settings.bio);
  return (
    <section id={section.id} className="section" data-section="about">
      <Container>
        <SectionHeader index={index} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <aside className="md:col-span-4">
            <div className="md:sticky md:top-28">
              {image && (
                <Parallax className="mb-8 overflow-hidden rounded-2xl border border-line" amount={6}>
                  <img
                    src={imageUrl(image, cloudName, { w: 900, h: 1100, crop: "fill", gravity: "face" })}
                    srcSet={srcSet(image, cloudName, [480, 720, 960], { h: 1100, crop: "fill", gravity: "face" })}
                    sizes="(min-width: 768px) 30vw, 100vw"
                    alt={settings.name}
                    className="aspect-[9/11] w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </Parallax>
              )}
              <dl className="dossier" data-reveal>
                {c.facts.map((f, i) => (
                  <div key={i} className="dossier-row">
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
              {c.badges.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2" data-reveal>
                  {c.badges.map((b) => (
                    <li key={b} className="chip">
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
          <div className="md:col-span-8 md:col-start-5">
            <div className="prose-editorial" data-reveal dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </Container>
    </section>
  );
}
