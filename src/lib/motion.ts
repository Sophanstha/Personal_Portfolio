"use client";

import type Lenis from "lenis";

/** Shared, mutable motion state read every frame (no React re-renders). */
export const motion = {
  lenis: null as Lenis | null,
  pointer: { x: -999, y: -999, inside: false },
  /** Smoothed scroll velocity in px per frame. */
  velocity: 0,
  /** (pointer: fine) and no reduced-motion preference */
  fine: false,
  reduce: false,
};

// Detect at module load so child components' effects (which run before the
// provider's) already see the right values.
if (typeof window !== "undefined") {
  motion.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  motion.fine = matchMedia("(pointer: fine)").matches;
}

export const ENTER_EVENT = "motion:enter";

export function isMotionOff() {
  if (typeof document === "undefined") return true;
  return document.documentElement.dataset.motion !== "on";
}

const BLOCKING = ["data-intro", "data-transition"];
const blocked = () => BLOCKING.some((a) => document.documentElement.hasAttribute(a));

/**
 * Fires `cb` once nothing is covering the page: the intro has finished and no
 * page transition is mid-cover. Fires immediately if neither is running.
 */
export function whenReady(cb: () => void) {
  const html = document.documentElement;
  if (!blocked()) {
    cb();
    return () => {};
  }
  const mo = new MutationObserver(() => {
    if (!blocked()) {
      mo.disconnect();
      cb();
    }
  });
  mo.observe(html, { attributes: true, attributeFilter: BLOCKING });
  return () => mo.disconnect();
}

export function lockScroll(lock: boolean) {
  if (lock) motion.lenis?.stop();
  // A transition in flight restarts Lenis itself when it finishes
  else if (!document.documentElement.hasAttribute("data-transition")) motion.lenis?.start();
  document.documentElement.style.overflow = lock ? "hidden" : "";
}

export function scrollToTop(immediate = false) {
  if (motion.lenis) motion.lenis.scrollTo(0, { immediate, duration: 1.6 });
  else window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
}

/** Framerate-independent lerp factor (base tuned for 60fps). */
export function lerpFactor(base: number, k: number) {
  return 1 - Math.pow(1 - base, k);
}

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
