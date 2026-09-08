import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";

let registered = false;

/** Register GSAP plugins once, on the client only. */
export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, useGSAP);
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && (window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.querySelector(".universe-site")?.getAttribute("data-motion") === "still");
}

/**
 * Equipos modestos: se saltan los efectos de scroll más caros. No se puede
 * medir aquí sobre hardware real, así que se degrada por precaución.
 */
export function isLowPowerDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) return true;
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4) return true;
  return false;
}

export function isFinePointer(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, useGSAP };
