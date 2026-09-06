import { useEffect } from "react";
import { useLocation } from "react-router";
import Lenis from "lenis";
import { gsap, prefersReducedMotion, registerGsap, ScrollTrigger } from "~/lib/motion";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export default function SmoothScroll() {
  const location = useLocation();

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -72 }, syncTouch: false });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  useEffect(() => {
    const lenis = window.__lenis;
    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) {
        if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -72 });
        else (target as HTMLElement).scrollIntoView();
      }
    } else {
      lenis?.scrollTo(0, { immediate: true });
    }
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    return () => window.clearTimeout(id);
  }, [location.pathname, location.hash]);

  return null;
}
