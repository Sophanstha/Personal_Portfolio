"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { clamp, lerpFactor, motion } from "@/lib/motion";

/**
 * One frame loop for the whole site: GSAP's ticker drives Lenis, and Lenis
 * keeps ScrollTrigger in sync. Also tracks pointer + smoothed scroll velocity
 * so any component can read them each frame without re-rendering.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.toggleAttribute("data-nocursor", motion.fine && !motion.reduce);

    let lenis: Lenis | null = null;
    if (!motion.reduce) {
      lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1, autoRaf: false });
      motion.lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      if (document.documentElement.hasAttribute("data-intro")) lenis.stop();
    }

    let lastY = window.scrollY;
    const tick = (time: number, deltaMs: number) => {
      lenis?.raf(time * 1000);
      const k = clamp(deltaMs / (1000 / 60), 1, 4);
      const y = window.scrollY;
      const v = (y - lastY) / k;
      lastY = y;
      motion.velocity += (v - motion.velocity) * lerpFactor(0.12, k);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onMove = (e: PointerEvent) => {
      motion.pointer.x = e.clientX;
      motion.pointer.y = e.clientY;
      motion.pointer.inside = true;
    };
    const onLeave = () => (motion.pointer.inside = false);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      lenis?.destroy();
      motion.lenis = null;
    };
  }, []);

  return <>{children}</>;
}
