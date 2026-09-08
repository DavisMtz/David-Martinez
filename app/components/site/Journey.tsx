import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";

/** Tracks the actual editable sections, including reordered or newly created ones. */
export function Journey() {
  const location = useLocation();
  const bar = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState({ label: "", index: 0, total: 0 });
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section]")).filter(el => el.dataset.section !== "marquee");
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${progress})`;
      let current = 0;
      sections.forEach((el, i) => { if (el.getBoundingClientRect().top < window.innerHeight*.5) current = i; });
      const el = sections[current];
      const label = el?.dataset.section === "hero" ? "Inicio" : el?.querySelector(".eyebrow")?.textContent?.replace(/^\d+\s*[—–-]?\s*/, "").trim() || el?.querySelector("h2")?.textContent || "";
      setChapter(prev => prev.index === current && prev.label === label && prev.total === sections.length ? prev : { index: current, label, total: sections.length });
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", request); window.removeEventListener("resize", request); };
  }, [location.pathname]);
  if (location.pathname !== "/") return null;
  return <>
    <div className="journey-progress" aria-hidden="true"><div ref={bar} /></div>
    {chapter.total > 0 && <div className="journey-chapter" aria-hidden="true"><span>{String(chapter.index+1).padStart(2,"0")}</span><span className="journey-rule" /><span>{chapter.label}</span><span className="journey-total">/ {String(chapter.total).padStart(2,"0")}</span></div>}
  </>;
}
