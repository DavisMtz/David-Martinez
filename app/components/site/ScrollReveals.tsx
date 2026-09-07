import { useLocation } from "react-router";
import { gsap, prefersReducedMotion, registerGsap, ScrollTrigger, useGSAP } from "~/lib/motion";

/** Animates every [data-reveal] element as it enters the viewport. */
export function ScrollReveals() {
  const location = useLocation();
  useGSAP(
    () => {
      registerGsap();
      const els = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      if (!els.length) return;
      if (prefersReducedMotion()) {
        gsap.set(els, { opacity: 1, y: 0, filter: "blur(0px)" });
        return;
      }
      ScrollTrigger.batch(els, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.5,
            ease: "expo.out",
            stagger: 0.11,
            overwrite: true,
          }),
      });
    },
    { dependencies: [location.pathname] },
  );
  return null;
}
