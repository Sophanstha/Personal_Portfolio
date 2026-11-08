"use client";

import { Fragment, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { clamp, motion } from "@/lib/motion";
import { site } from "@/content/site";

/**
 * Endless italic ticker. Scrolling speeds it up and skews it in the
 * direction of travel; it eases back when you stop.
 */
export function Marquee() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (motion.reduce) return;
      const el = track.current!;
      let x = 0;
      let half = 0;
      let visible = false;
      const measure = () => (half = (el.firstElementChild as HTMLElement).offsetWidth);
      measure();
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(root.current!);
      const ro = new ResizeObserver(measure);
      ro.observe(el);

      const tick = (_t: number, deltaMs: number) => {
        if (!visible || !half) return;
        const k = clamp(deltaMs / (1000 / 60), 1, 4);
        const v = motion.velocity;
        x -= (0.7 + Math.min(0.35 * Math.abs(v), 30)) * k;
        if (-x > half) x += half;
        const skew = clamp(-0.25 * v, -10, 10);
        el.style.transform = `translate3d(${x.toFixed(1)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
      };
      gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        io.disconnect();
        ro.disconnect();
      };
    },
    { scope: root },
  );

  const copy = (hidden: boolean) => (
    <div className="marquee__copy" aria-hidden={hidden || undefined}>
      {/* list doubled so one copy is always wider than the viewport */}
      {[...site.marquee, ...site.marquee].map((w, i) => (
        <Fragment key={i}>
          <span>{w}</span>
          <span className="marquee__diamond" aria-hidden="true" />
        </Fragment>
      ))}
    </div>
  );

  return (
    <div ref={root} className="marquee">
      <div ref={track} className="marquee__track">
        {copy(false)}
        {copy(true)}
      </div>
    </div>
  );
}
