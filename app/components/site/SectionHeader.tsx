import { Reveal } from "./Reveal";
import { cx } from "~/lib/utils";

interface Props {
  index?: number;
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({ index, eyebrow, title, subtitle, align = "left", className }: Props) {
  if (!eyebrow && !title && !subtitle) return null;
  const num = index != null ? String(index).padStart(2, "0") : null;
  return (
    <header className={cx("mb-12 md:mb-20", align === "center" && "text-center", className)}>
      {(eyebrow || num) && (
        <p data-reveal className="eyebrow">
          {num && <span className="text-paper/60">{num}</span>}
          {num && eyebrow && <span className="mx-3 text-paper/30">—</span>}
          {eyebrow}
        </p>
      )}
      {title && (
        <Reveal as="h2" className="display-lg mt-4">
          {title}
        </Reveal>
      )}
      {subtitle && (
        <p data-reveal className={cx("mt-5 max-w-2xl text-lg text-muted md:text-xl", align === "center" && "mx-auto")}>
          {subtitle}
        </p>
      )}
    </header>
  );
}
