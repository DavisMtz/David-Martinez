import type { Section } from "~/lib/types";
import { resolveContent } from "~/lib/sections";
import { imageUrl, srcSet } from "~/lib/cloudinary";
import { useSite } from "../context";
import { Container } from "../Container";
import { SectionHeader } from "../SectionHeader";
import { cx } from "~/lib/utils";

interface GalleryContent {
  layout: "strip" | "masonry";
  items: { image: string; caption?: string }[];
}

export function Gallery({ section, index }: { section: Section; index: number }) {
  const { cloudName } = useSite();
  const c = resolveContent<GalleryContent>("gallery", section.content);
  const items = c.items.filter((i) => i.image);
  if (!items.length) return null;
  return (
    <section id={section.id} className="section" data-section="gallery">
      <Container wide>
        <SectionHeader index={index} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
        <div className={cx(c.layout === "strip" ? "gallery-strip" : "gallery-masonry")}>
          {items.map((it, i) => (
            <figure key={i} className={cx("gallery-item", c.layout === "strip" && "gallery-item--strip")} data-reveal>
              <img
                src={imageUrl(it.image, cloudName, { w: 1200 })}
                srcSet={srcSet(it.image, cloudName, [480, 800, 1200, 1600])}
                sizes="(min-width: 1024px) 40vw, 90vw"
                alt={it.caption ?? ""}
                loading="lazy"
                decoding="async"
              />
              {it.caption && <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{it.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
