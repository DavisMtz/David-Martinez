import { useLocation } from "react-router";
import { gsap, isLowPowerDevice, prefersReducedMotion, registerGsap, ScrollTrigger, useGSAP } from "~/lib/motion";

/**
 * Trata cada sección como un plano: al salir del encuadre se aleja y se apaga,
 * de modo que el paso entre secciones se sienta como un cambio de plano.
 *
 * Solo se animan `transform` y `opacity`, que el compositor resuelve sin
 * repintar. Se probó con `filter: blur()` y hundía el scroll a 5 fps.
 */
export function ScrollCinema() {
  const location = useLocation();

  useGSAP(
    () => {
      registerGsap();
      if (prefersReducedMotion() || isLowPowerDevice()) return;

      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const sections = gsap.utils.toArray<HTMLElement>("[data-section]");
        const targets: HTMLElement[] = [];

        sections.forEach((section) => {
          const inner = (section.firstElementChild as HTMLElement | null) ?? section;
          targets.push(inner);

          // Salida: el plano se aleja.
          gsap.to(inner, {
            scale: 0.93,
            opacity: 0.2,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "bottom 80%",
              end: "bottom 10%",
              scrub: 0.5,
            },
          });

          // Entrada: llega desde el fondo. El hero ya nace en cámara.
          if (section.dataset.section !== "hero") {
            gsap.fromTo(
              inner,
              { scale: 1.06, opacity: 0.25 },
              {
                scale: 1,
                opacity: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: section,
                  start: "top 95%",
                  end: "top 55%",
                  scrub: 0.5,
                },
              },
            );
          }
        });

        gsap.set(targets, { transformOrigin: "center center" });
        return () => gsap.set(targets, { clearProps: "scale,opacity,transformOrigin" });
      });

      ScrollTrigger.refresh();
      return () => mm.revert();
    },
    { dependencies: [location.pathname] },
  );

  return null;
}
