import { useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, registerGsap, useGSAP } from "~/lib/motion";

/** Subtle scroll parallax on the child (scaled slightly to avoid gaps). */
export function Parallax({ children, className, amount = 8 }: { children: ReactNode; className?: string; amount?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      registerGsap();
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const inner = el.firstElementChild as HTMLElement | null;
      if (!inner) return;
      gsap.fromTo(
        inner,
        { yPercent: -amount, scale: 1 + amount / 50 },
        { yPercent: amount, scale: 1 + amount / 50, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
      );
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={className} style={{ overflow: "clip" }}>
      {children}
    </div>
  );
}
