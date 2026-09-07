import { createElement, useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, registerGsap, SplitText, useGSAP } from "~/lib/motion";
import { cx } from "~/lib/utils";

interface Props {
  children: ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  /** "lines" masks each line; "words" animates words; "chars" animates characters. */
  type?: "lines" | "words" | "chars";
  delay?: number;
  once?: boolean;
  start?: string;
}

/** Text reveal on scroll using GSAP SplitText (masked lines). */
export function Reveal({ children, as: Tag = "div", className, type = "lines", delay = 0, start = "top 85%" }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const split = SplitText.create(el, {
        type: type === "chars" ? "lines,words,chars" : "lines,words",
        mask: "lines",
        autoSplit: true,
        linesClass: "split-line",
        onSplit: (self) => {
          const targets = type === "chars" ? self.chars : type === "words" ? self.words : self.lines;
          return gsap.from(targets, {
            yPercent: 118,
            rotate: type === "lines" ? 2 : 0,
            duration: 1.6,
            ease: "expo.out",
            stagger: type === "chars" ? 0.022 : type === "words" ? 0.05 : 0.13,
            delay,
            scrollTrigger: { trigger: el, start, once: true },
          });
        },
      });
      return () => split.revert();
    },
    { scope: ref },
  );

  return createElement(Tag, { ref, className: cx("reveal", className) }, children);
}
