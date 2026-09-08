import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { Section } from "~/lib/types";
import { resolveContent } from "~/lib/sections";
import { useSite } from "../context";
import { Magnetic } from "../Magnetic";
import { gsap, prefersReducedMotion, registerGsap, useGSAP } from "~/lib/motion";
import { cx } from "~/lib/utils";

const HeroScene = lazy(() => import("~/components/three/HeroScene.client"));
interface HeroContent {
  headline: string; sub: string;
  ctaPrimary: { label: string; url: string }; ctaSecondary: { label: string; url: string };
  scene: string; sceneIntensity: number; sceneSpeed: number;
  sceneCaption: string; concepts: string[]; ticker: string[]; showAvailability: boolean;
}
function renderHeadline(text: string) {
  return text.split(/\r?\n/).map((line, i) => <span key={i} className="block">{line.split(/(\*[^*]+\*)/g).map((part, j) => part.startsWith("*") && part.endsWith("*") ? <em key={j}>{part.slice(1, -1)}</em> : <span key={j}>{part}</span>)}</span>);
}
const bound = (n: number, fallback: number) => Number.isFinite(Number(n)) ? Math.max(0, Math.min(100, Number(n))) : fallback;
export function Hero({ section }: { section: Section }) {
  const { settings } = useSite();
  const c = resolveContent<HeroContent>("hero", section.content);
  const root = useRef<HTMLElement>(null);
  const [showScene, setShowScene] = useState(false);
  useEffect(() => {
    setShowScene(false);
    if (c.scene === "none" || prefersReducedMotion()) return;
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    if ((nav.deviceMemory && nav.deviceMemory < 2) || nav.connection?.saveData) return;
    const timer = window.setTimeout(() => {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2");
      if (!gl) return;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      setShowScene(true);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [c.scene, settings.motionMode]);
  useGSAP(() => {
    registerGsap();
    if (!root.current || prefersReducedMotion()) return;
    gsap.from(root.current.querySelectorAll(".hero-enter"), { y: 24, opacity: 0, duration: 1.15, stagger: .1, ease: "power3.out", clearProps: "opacity,transform" });
  }, { scope: root });
  return <section ref={root} id={section.id} className="hero observatory-hero" data-section="hero">
    <div className="hero-grid" aria-hidden="true" />
    <div className="hero-shell">
      <div className="hero-meta hero-enter"><span>{settings.name}</span><span>{settings.location}</span></div>
      <div className="hero-composition">
        <div className="hero-copy">
          {c.showAvailability && settings.availability !== "closed" && <p className="hero-availability hero-enter"><span className={cx("status-dot", settings.availability === "busy" && "status-dot--busy")} />{settings.availabilityText}</p>}
          <h1 className="hero-headline hero-enter">{renderHeadline(c.headline || settings.headline)}</h1>
          <p className="hero-description hero-enter">{c.sub}</p>
          <div className="hero-actions hero-enter">
            {c.ctaPrimary?.label && <Magnetic><a href={c.ctaPrimary.url} className="btn-primary btn-lg">{c.ctaPrimary.label}<span aria-hidden="true">↗</span></a></Magnetic>}
            {c.ctaSecondary?.label && <Magnetic><a href={c.ctaSecondary.url} className="hero-secondary">{c.ctaSecondary.label}<span aria-hidden="true">→</span></a></Magnetic>}
          </div>
        </div>
        <div className="hero-observation" data-scene={c.scene}>
          {c.scene !== "none" && <div className="orbital-fallback" style={{ opacity: bound(c.sceneIntensity,75) / 125 }} aria-hidden="true"><i /><i /><i /><i /></div>}
          {showScene && <Suspense fallback={null}><HeroScene accent={settings.accent} accent2={settings.accent2} scene={c.scene} intensity={bound(c.sceneIntensity,75)} speed={bound(c.sceneSpeed,30)} /></Suspense>}
          {!!c.concepts?.length && <div className="observation-labels">{c.concepts.slice(0,3).map((label,i) => <span key={i}><small>{String(i+1).padStart(2,"0")}</small>{label}</span>)}</div>}
          {c.sceneCaption && <p className="observation-caption">{c.sceneCaption}</p>}
        </div>
      </div>
      <div className="hero-baseline hero-enter">
        <ul className="hero-ticker">{c.ticker.map((item,i) => <li key={i}>{item}</li>)}</ul>
        <a href={c.ctaPrimary?.url || "#contacto"} className="hero-scroll"><span>Explorar</span><span aria-hidden="true">↓</span></a>
      </div>
    </div>
  </section>;
}
