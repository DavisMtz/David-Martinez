import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "~/lib/motion";
import { useSite } from "./context";

const SESSION_KEY = "dm_intro_seen";

/** Marca el arranque para que el hero espere a que se abra el obturador. */
function markRunning() {
  document.documentElement.dataset.intro = "running";
}

function finish() {
  delete document.documentElement.dataset.intro;
  document.documentElement.classList.remove("intro-lock");
  window.dispatchEvent(new CustomEvent("cinema:reveal"));
}

/**
 * Secuencia de apertura: contador, nombre y un obturador que se abre
 * en dos mitades para descubrir el hero. Se reproduce una vez por sesión.
 */
export default function Intro() {
  const { settings } = useSite();
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(false);

  // Decide en el primer render del cliente si toca reproducirla.
  useEffect(() => {
    let seen = true;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      seen = false; // modo privado: se reproduce igual
    }
    if (seen || prefersReducedMotion()) {
      finish();
      return;
    }
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // sin sessionStorage no pasa nada, solo se repetirá
    }
    markRunning();
    document.documentElement.classList.add("intro-lock");
    setActive(true);
  }, []);

  useEffect(() => {
    if (!active || !root.current) return;
    const el = root.current;
    const q = gsap.utils.selector(el);
    const count = { v: 0 };
    let cancelled = false;

    const tl = gsap.timeline({
      defaults: { ease: "expo.out" },
      onComplete: () => {
        finish();
        setActive(false);
      },
    });

    // Espera a que la tipografía esté lista para que el título no salte de fuente
    // a media secuencia. Con tope de tiempo: si tarda, se arranca igual.
    const fontsReady =
      typeof document !== "undefined" && "fonts" in document
        ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))])
        : Promise.resolve();
    void fontsReady.then(() => {
      if (!cancelled) tl.play(0);
    });

    tl.pause();
    tl.set(el, { autoAlpha: 1 })
      .from(q(".intro-word"), { yPercent: 115, duration: 1.1, stagger: 0.08 }, 0.15)
      .to(q(".intro-rule"), { scaleX: 1, duration: 1.6, ease: "power2.inOut" }, 0.2)
      .to(
        count,
        {
          v: 100,
          duration: 1.7,
          ease: "power2.inOut",
          onUpdate: () => {
            if (counter.current) counter.current.textContent = String(Math.round(count.v)).padStart(3, "0");
          },
        },
        0.2,
      )
      .to(q(".intro-meta"), { opacity: 1, duration: 0.8 }, 0.5)
      // El obturador se abre y descubre la escena.
      .to(q(".intro-content"), { opacity: 0, duration: 0.5, ease: "power2.in" }, 1.95)
      .to(q(".intro-shutter--top"), { yPercent: -100, duration: 1.2, ease: "expo.inOut" }, 2.1)
      .to(q(".intro-shutter--bottom"), { yPercent: 100, duration: 1.2, ease: "expo.inOut" }, 2.1)
      .set(el, { autoAlpha: 0 });

    return () => {
      cancelled = true;
      tl.kill();
    };
  }, [active]);

  if (!active) return null;

  const words = (settings.name || "David Martínez").split(" ");

  return (
    <div ref={root} className="intro" aria-hidden="true">
      <div className="intro-shutter intro-shutter--top" />
      <div className="intro-shutter intro-shutter--bottom" />
      <div className="intro-content">
        <p className="intro-name">
          {words.map((w, i) => (
            <span key={i} className="intro-word-mask">
              <span className="intro-word">{w}</span>
            </span>
          ))}
        </p>
        <div className="intro-rule" />
        <div className="intro-meta">
          <span>{settings.location || "Morelia, MX"}</span>
          <span className="intro-counter">
            <span ref={counter}>000</span>
          </span>
        </div>
      </div>
    </div>
  );
}
