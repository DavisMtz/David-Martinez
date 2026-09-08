import { useLocation } from "react-router";
import { useSite } from "./context";
import { gsap, isLowPowerDevice, prefersReducedMotion, registerGsap, ScrollTrigger, useGSAP } from "~/lib/motion";

export function ScrollCinema() {
  const location = useLocation();
  const { settings } = useSite();
  useGSAP(() => {
    registerGsap();
    if (prefersReducedMotion() || isLowPowerDevice() || settings.motionMode !== "immersive") return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      // Distinct rhythms: dissolve the hero, reveal biography, open the philosophical text.
      // Never transform the pinned projects track or dim long sections while still reading.
      gsap.to(".hero-copy", { y: -65, opacity: .25, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 15%", scrub: .8 } });
      gsap.utils.toArray<HTMLElement>('[data-section="about"], [data-section="experience"], [data-section="quotes"]').forEach(section => {
        const inner = section.firstElementChild;
        if (!inner) return;
        gsap.from(inner, { y: 45, duration: 1, ease: "none", scrollTrigger: { trigger: section, start: "top 95%", end: "top 55%", scrub: .8 } });
      });
      gsap.utils.toArray<HTMLElement>('[data-section="text"]').forEach(section => {
        const text = section.querySelector(".prose-editorial");
        if (text) gsap.fromTo(text, { scale: .94 }, { scale: 1, ease: "none", scrollTrigger: { trigger: section, start: "top 85%", end: "center center", scrub: 1 } });
      });
    });
    ScrollTrigger.refresh();
    return () => mm.revert();
  }, { dependencies: [location.pathname, settings.motionMode] });
  return null;
}
