"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { site } from "@/content/site";

// "*word*" → italic, "_word_" → accent
const words = site.statement.text.split(/\s+/).map((raw) => {
  if (/^\*.+\*$/.test(raw)) return { text: raw.slice(1, -1), kind: "italic" };
  if (/^_.+_$/.test(raw)) return { text: raw.slice(1, -1), kind: "accent" };
  return { text: raw, kind: "" };
});

/** Pinned paragraph that lights up word by word as you scroll through it. */
export function Statement() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const els = gsap.utils.toArray<HTMLElement>(".statement__word");
      const n = els.length;
      const setters = els.map((el) => gsap.quickSetter(el, "opacity"));
      const paint = (p: number) => {
        for (let i = 0; i < n; i++) {
          const t = gsap.utils.clamp(0, 1, p * n * 1.1 - i);
          setters[i](0.14 + 0.86 * t);
        }
      };
      paint(0);
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => paint(self.progress),
        onRefresh: (self) => paint(self.progress),
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="statement">
      <div className="statement__sticky">
        <span className="statement__label eyebrow eyebrow--accent">{site.statement.label}</span>
        <p className="statement__text">
          {words.map((w, i) => (
            <span key={i} className={cn("statement__word", w.kind && `statement__word--${w.kind}`)}>
              {w.text}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
