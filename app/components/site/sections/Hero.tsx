import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { Section } from "~/lib/types";
import { resolveContent } from "~/lib/sections";
import { useSite } from "../context";
import { Magnetic } from "../Magnetic";
import { gsap, prefersReducedMotion, registerGsap, SplitText, useGSAP } from "~/lib/motion";
import { cx } from "~/lib/utils";

const HeroScene = lazy(() => import("~/components/three/HeroScene.client"));

interface HeroContent {
  headline: string;
  sub: string;
  ctaPrimary: { label: string; url: string };
  ctaSecondary: { label: string; url: string };
  scene: "lattice" | "waves" | "none";
  ticker: string[];
  showAvailability: boolean;
}

/** Turns "Diseño la *cuadrícula* invisible" into spans, honoring line breaks. */
function renderHeadline(text: string) {
  return text.split(/\r?\n/).map((line, li) => (
    <span key={li} className="block">
      {line.split(/(\*[^*]+\*)/g).map((part, pi) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <em key={pi} className="not-italic text-accent">
            {part.slice(1, -1)}
          </em>
        ) : (
          <span key={pi}>{part}</span>
        ),
      )}
    </span>
  ));
}

export function Hero({ section }: { section: Section }) {
  const { settings } = useSite();
  const c = resolveContent<HeroContent>("hero", section.content);
  const root = useRef<HTMLElement>(null);
  const [showScene, setShowScene] = useState(false);

  useEffect(() => {
    if (c.scene === "none") return;
    if (prefersReducedMotion()) return;
    const nav = navigator as Navigator & { deviceMemory?: number };
    if (nav.deviceMemory && nav.deviceMemory < 2) return;
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return;
    setShowScene(true);
  }, [c.scene]);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const reduced = prefersReducedMotion();
      const waitingForIntro = document.documentElement.dataset.intro === "running";
      const tl = gsap.timeline({ defaults: { ease: "expo.out" }, paused: waitingForIntro });
      let onReveal: (() => void) | undefined;
      if (waitingForIntro) {
        onReveal = () => tl.play();
        window.addEventListener("cinema:reveal", onReveal, { once: true });
      }
      const headline = el.querySelector<HTMLElement>(".hero-headline");
      if (headline && !reduced) {
        const split = SplitText.create(headline, { type: "lines,words", mask: "lines", autoSplit: true, linesClass: "split-line" });
        tl.from(split.words, { yPercent: 118, rotate: 2.5, duration: 1.9, stagger: 0.075 }, 0.15);
      }
      tl.to(el.querySelectorAll(".hero-fade"), { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.6, stagger: 0.14 }, reduced ? 0 : 0.85);
      tl.to(el.querySelectorAll(".hero-line"), { scaleX: 1, duration: 2.1, ease: "expo.inOut" }, 0.5);

      return () => {
        if (onReveal) window.removeEventListener("cinema:reveal", onReveal);
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id={section.id} className="hero" data-section="hero">
      {showScene && (
        <Suspense fallback={null}>
          <HeroScene accent={settings.accent} accent2={settings.accent2} />
        </Suspense>
      )}
      <div className="hero-poster" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1400px] flex-col justify-between px-5 pb-8 pt-28 md:px-10 md:pb-10 md:pt-36">
        <div className="hero-fade flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
          <span>// {settings.name}</span>
          <span className="hidden md:inline">{settings.location}</span>
          <span>{settings.coordinates}</span>
        </div>

        <div className="my-10 md:my-14">
          <h1 className="hero-headline display-xl">{renderHeadline(c.headline)}</h1>
          <div className="mt-8 grid gap-8 md:mt-12 md:grid-cols-12 md:items-end">
            <p className="hero-fade max-w-xl text-lg leading-relaxed text-muted md:col-span-7 md:text-xl">{c.sub}</p>
            <div className="hero-fade flex flex-wrap items-center gap-4 md:col-span-5 md:justify-end">
              {c.ctaPrimary?.label && (
                <Magnetic>
                  <a href={c.ctaPrimary.url} className="btn-primary btn-lg">
                    {c.ctaPrimary.label}
                    <span aria-hidden="true">→</span>
                  </a>
                </Magnetic>
              )}
              {c.ctaSecondary?.label && (
                <Magnetic>
                  <a href={c.ctaSecondary.url} className="btn-outline btn-lg">
                    {c.ctaSecondary.label}
                  </a>
                </Magnetic>
              )}
            </div>
          </div>
        </div>

        <div className="hero-fade">
          <div className="hero-line h-px w-full origin-left scale-x-0 bg-line" />
          <div className="mt-5 flex items-center justify-between gap-6">
            <ul className="hero-ticker flex gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              {c.ticker.map((item, i) => (
                <li key={i} className="flex items-center gap-5">
                  {i > 0 && <span className="text-accent/60">✦</span>}
                  {item}
                </li>
              ))}
            </ul>
            <div className="hidden shrink-0 items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted md:flex">
              {c.showAvailability && settings.availability !== "closed" && (
                <span className="flex items-center gap-2">
                  <span className={cx("status-dot", settings.availability === "busy" && "status-dot--busy")} />
                  {settings.availabilityText}
                </span>
              )}
              <span className="scroll-cue" aria-hidden="true" />
              <span>desliza</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
