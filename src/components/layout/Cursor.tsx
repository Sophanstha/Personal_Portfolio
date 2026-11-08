"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { clamp, lerpFactor, motion } from "@/lib/motion";

/**
 * Dot follows the pointer exactly; the ring trails it and grows into a
 * labelled disc over anything with [data-cursor="Label"].
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!motion.fine || motion.reduce) return;
    const d = dot.current!;
    const r = ring.current!;
    const l = label.current!;
    const pos = { x: -200, y: -200 };
    let scale = 0.35;
    let target = 0.35;

    const tick = (_t: number, deltaMs: number) => {
      const p = motion.pointer;
      if (!p.inside) return;
      const k = clamp(deltaMs / (1000 / 60), 1, 4);
      const dx = p.x - pos.x;
      const dy = p.y - pos.y;
      const ds = target - scale;
      if (Math.abs(dx) + Math.abs(dy) + Math.abs(ds) > 0.05) {
        const f = lerpFactor(0.18, k);
        pos.x += dx * f;
        pos.y += dy * f;
        scale += ds * lerpFactor(0.15, k);
        r.style.transform = `translate3d(${pos.x - 44}px,${pos.y - 44}px,0) scale(${scale.toFixed(3)})`;
      }
      d.style.transform = `translate3d(${p.x}px,${p.y}px,0)`;
    };

    const over = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-cursor]");
      const text = el?.dataset.cursor ?? "";
      target = text ? 1 : 0.35;
      l.textContent = text;
      r.toggleAttribute("data-active", !!text);
      const tone = (e.target as Element | null)?.closest<HTMLElement>("[data-cursor-tone]");
      r.dataset.tone = tone?.dataset.cursorTone ?? "";
    };
    const down = () => (target = Math.max(0.25, target * 0.85));
    const up = (e: MouseEvent) => over(e);

    document.body.classList.add("has-cursor");
    gsap.ticker.add(tick);
    window.addEventListener("mouseover", over, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.body.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
      <div ref={ring} className="cursor-ring" aria-hidden="true">
        <span ref={label} />
      </div>
    </>
  );
}
