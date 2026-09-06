import { useEffect, useRef, useState } from "react";
import { gsap, isFinePointer, prefersReducedMotion } from "~/lib/motion";

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!isFinePointer() || prefersReducedMotion()) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const d = dot.current;
    const r = ring.current;
    if (!d || !r) return;
    document.documentElement.classList.add("has-cursor");
    const dx = gsap.quickTo(d, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(d, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(r, "x", { duration: 0.45, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.45, ease: "power3" });
    let visible = false;
    const move = (e: PointerEvent) => {
      if (!visible) {
        visible = true;
        gsap.to([d, r], { opacity: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest("a, button, [data-cursor]") as HTMLElement | null;
      if (t) {
        const l = t.getAttribute("data-cursor-label") ?? "";
        setLabel(l);
        gsap.to(r, { scale: l ? 3 : 1.8, duration: 0.35, ease: "power3" });
        gsap.to(d, { scale: l ? 0 : 0.5, duration: 0.3 });
        r.classList.toggle("cursor-ring--label", Boolean(l));
      } else {
        setLabel("");
        gsap.to(r, { scale: 1, duration: 0.35, ease: "power3" });
        gsap.to(d, { scale: 1, duration: 0.3 });
        r.classList.remove("cursor-ring--label");
      }
    };
    const leave = () => {
      visible = false;
      gsap.to([d, r], { opacity: 0, duration: 0.3 });
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
      <div ref={ring} className="cursor-ring" aria-hidden="true">
        <span className="cursor-label">{label}</span>
      </div>
    </>
  );
}
