"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { createKinetic } from "@/lib/kinetic";
import { clamp, motion, whenReady } from "@/lib/motion";

/**
 * Text that has to fill its container ([data-fit]) gets a --ems variable:
 * the width of its widest line in ems. CSS then sizes it with
 * `calc(100cqw / var(--ems))`.
 */
function fitText() {
  document.querySelectorAll<HTMLElement>("[data-fit]").forEach((el) => {
    let ems = 0;
    el.querySelectorAll<HTMLElement>("[data-kinner]").forEach((inner) => {
      const fs = parseFloat(getComputedStyle(inner).fontSize) || 1;
      const lineEms = inner.getBoundingClientRect().width / fs;
      ems = Math.max(ems, lineEms);
      // Per-line value: on mobile each hero line fills the width on its own
      inner.closest<HTMLElement>("[data-kline]")?.style.setProperty("--line-ems", (lineEms * 1.02).toFixed(4));
    });
    if (ems > 0) el.style.setProperty("--ems", (ems * 1.02).toFixed(4));
  });
}

/**
 * Per-page motion, re-run on every route change once the page is uncovered:
 *  - hero letters rise in ([data-in])
 *  - [data-reveal] blocks fade up, staggered if already on screen, else on scroll
 *  - [data-magnet] elements are pulled toward the cursor
 *  - kinetic letters stretch near the cursor
 */
export function PageMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const kinetic = createKinetic();
    let ctx: gsap.Context | null = null;
    let measureTimer = 0;
    const timers: number[] = [];
    type Magnet = { el: HTMLElement; x: (v: number) => void; y: (v: number) => void; on: boolean };
    let mags: Magnet[] = [];
    const last = { x: NaN, y: NaN, sy: NaN };

    const measure = () => {
      kinetic.reset();
      fitText();
      kinetic.measure();
    };
    const queueMeasure = () => {
      cancelAnimationFrame(measureTimer);
      measureTimer = requestAnimationFrame(() => {
        measure();
        ScrollTrigger.refresh();
      });
    };

    measure();
    document.fonts?.ready.then(queueMeasure);

    const stop = whenReady(() => {
      ctx = gsap.context(() => {
        const vh = window.innerHeight;
        const off = motion.reduce;

        // Drop the CSS pre-hide first so GSAP doesn't read its translateY(115%)
        // as a pixel offset. fromTo renders synchronously, so nothing flashes.
        document.documentElement.setAttribute("data-entered", "");

        // 1. Hero letters rise
        const letters = gsap.utils.toArray<HTMLElement>("[data-in]");
        if (letters.length && !off) {
          gsap.fromTo(
            letters,
            { yPercent: 115 },
            { yPercent: 0, duration: 1.3, ease: "out", stagger: 0.055, delay: 0.08, clearProps: "transform" },
          );
        }

        // 2. Reveals
        let i = 0;
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          const anim = (delay = 0) =>
            gsap.fromTo(
              el,
              { autoAlpha: 0, y: 48 },
              { autoAlpha: 1, y: 0, duration: 1.1, ease: "out", delay, clearProps: "transform" },
            );
          if (off) return;
          if (el.getBoundingClientRect().top < vh * 0.92) anim(0.3 + 0.07 * i++);
          else {
            gsap.set(el, { autoAlpha: 0 });
            ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: () => anim() });
          }
        });

        // 3. Magnetic elements (moved once per frame in `tick`, not per pointer event)
        if (motion.fine && !off) {
          mags = gsap.utils.toArray<HTMLElement>("[data-magnet]").map((el) => ({
            el,
            x: gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" }),
            y: gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" }),
            on: false,
          }));
        }
      });

      // Re-measure once the entrance has settled (letters were translated)
      timers.push(window.setTimeout(queueMeasure, 1500));
    });

    // Magnets only re-check when the pointer or the page has moved
    const pullMagnets = () => {
      const { x, y } = motion.pointer;
      const sy = window.scrollY;
      if (!mags.length || (x === last.x && y === last.y && sy === last.sy)) return;
      last.x = x;
      last.y = y;
      last.sy = sy;
      const rects = mags.map((m) => m.el.getBoundingClientRect());
      mags.forEach((m, i) => {
        const r = rects[i];
        const dx = x - (r.left + r.width / 2 - (Number(gsap.getProperty(m.el, "x")) || 0));
        const dy = y - (r.top + r.height / 2 - (Number(gsap.getProperty(m.el, "y")) || 0));
        const near = Math.abs(dx) < r.width / 2 + 50 && Math.abs(dy) < r.height / 2 + 50;
        if (!near && !m.on) return;
        m.on = near;
        m.x(near ? dx * 0.35 : 0);
        m.y(near ? dy * 0.35 : 0);
      });
    };

    const tick = (_t: number, deltaMs: number) => {
      pullMagnets();
      kinetic.frame(clamp(deltaMs / (1000 / 60), 1, 4));
    };
    gsap.ticker.add(tick);

    let lastW = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      queueMeasure();
    };
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      ctx?.revert();
      timers.forEach(clearTimeout);
      cancelAnimationFrame(measureTimer);
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", onResize);
      kinetic.reset();
      mags = [];
    };
  }, [pathname]);

  return null;
}
