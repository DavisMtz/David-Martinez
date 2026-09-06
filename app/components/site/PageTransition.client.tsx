import { useEffect, useRef } from "react";
import { useLocation, useNavigation } from "react-router";
import { gsap, prefersReducedMotion } from "~/lib/motion";

/**
 * Corte entre páginas: una cortina baja mientras carga la ruta y se retira
 * cuando la nueva ya está montada.
 */
export default function PageTransition() {
  const navigation = useNavigation();
  const location = useLocation();
  const curtain = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const first = useRef(true);

  // Baja la cortina en cuanto empieza una navegación.
  useEffect(() => {
    if (prefersReducedMotion() || !curtain.current) return;
    if (navigation.state !== "loading") return;
    busy.current = true;
    gsap.killTweensOf(curtain.current);
    gsap.fromTo(
      curtain.current,
      { yPercent: -100 },
      { yPercent: 0, duration: 0.55, ease: "power3.inOut", overwrite: true },
    );
  }, [navigation.state]);

  // La retira cuando la ruta nueva ya se pintó.
  useEffect(() => {
    if (prefersReducedMotion() || !curtain.current) return;
    if (first.current) {
      first.current = false;
      return;
    }
    if (!busy.current) return;
    busy.current = false;
    const el = curtain.current;
    gsap.to(el, {
      yPercent: 100,
      duration: 0.75,
      ease: "expo.inOut",
      delay: 0.05,
      overwrite: true,
      onComplete: () => gsap.set(el, { yPercent: -100 }),
    });
  }, [location.key]);

  return <div ref={curtain} className="page-curtain" aria-hidden="true" />;
}
