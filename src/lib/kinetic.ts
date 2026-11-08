"use client";

import { lerpFactor, motion } from "./motion";

/**
 * Letters that stretch (Archivo 'wdth' + 'wght' axes) as the cursor gets close.
 * Each line is constrained so the stretched letters never overflow it.
 *
 * Markup: [data-kline] > [data-kinner] > .k-letter[data-k=radius]
 */

export const kineticFvs = (t: number) =>
  `'wdth' ${(70 + 55 * t).toFixed(1)}, 'wght' ${(800 - 540 * t).toFixed(0)}`;

type Letter = {
  el: HTMLElement;
  cx: number;
  cy: number; // page coords
  r: number;
  base: number;
  max: number;
  t: number;
  v: number;
};
type Line = { letters: Letter[]; room: number; grow: number[] };

export function createKinetic(root: ParentNode = document) {
  let lines: Line[] = [];

  const measure = () => {
    lines = [];
    const sy = window.scrollY;
    root.querySelectorAll<HTMLElement>("[data-kline]").forEach((lineEl) => {
      const els = [...lineEl.querySelectorAll<HTMLElement>("[data-k]")];
      if (!els.length) return;
      els.forEach((e) => (e.style.fontVariationSettings = kineticFvs(0)));
      const rects = els.map((e) => e.getBoundingClientRect());
      els.forEach((e) => (e.style.fontVariationSettings = kineticFvs(1)));
      const maxW = els.map((e) => e.getBoundingClientRect().width);
      els.forEach((e) => (e.style.fontVariationSettings = kineticFvs(0)));

      const inner = lineEl.querySelector<HTMLElement>("[data-kinner]") ?? lineEl;
      const sumBase = rects.reduce((s, r) => s + r.width, 0);
      const spaces = inner.getBoundingClientRect().width - sumBase; // word gaps etc.
      const cs = getComputedStyle(lineEl);
      const width = lineEl.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);

      lines.push({
        room: width - spaces,
        grow: new Array(els.length).fill(0),
        letters: els.map((el, i) => ({
          el,
          cx: rects[i].left + rects[i].width / 2,
          cy: rects[i].top + rects[i].height / 2 + sy,
          r: Number(el.dataset.k) || 300,
          base: rects[i].width,
          max: maxW[i],
          t: 0,
          v: 0,
        })),
      });
    });
  };

  // Width is ~linear in the stretch value, so the largest scale `s` that keeps
  // sum(base + (max - base) * t * s) <= room has a closed form.
  const stretch = (line: Line) => {
    let sumBase = 0;
    let sumGrow = 0;
    for (const l of line.letters) {
      sumBase += l.base;
      sumGrow += (l.max - l.base) * l.t;
    }
    const s = sumGrow <= 0 ? 1 : Math.max(0, Math.min(1, (line.room - sumBase) / sumGrow));
    const eps = s < 1 ? 5e-4 : 0.004;
    for (const l of line.letters) {
      const v = l.t * s;
      if (Math.abs(v - l.v) < eps) continue;
      l.v = v;
      l.el.style.fontVariationSettings = kineticFvs(v);
    }
  };

  const frame = (k: number) => {
    if (motion.reduce || !motion.fine) return;
    const vh = window.innerHeight;
    const sy = window.scrollY;
    const f = lerpFactor(0.12, k);
    const { x, y, inside } = motion.pointer;
    for (const line of lines) {
      let visible = false;
      for (const l of line.letters) {
        const ly = l.cy - sy;
        if (ly < -l.r || ly > vh + l.r) continue;
        visible = true;
        let h = 0;
        if (inside) {
          const d = Math.hypot(x - l.cx, y - ly);
          if (d < l.r) {
            h = 1 - d / l.r;
            h = h * h * (3 - 2 * h); // smoothstep
          }
        }
        l.t += (h - l.t) * f;
      }
      if (visible) stretch(line);
    }
  };

  const reset = () =>
    lines.forEach((line) => line.letters.forEach((l) => (l.el.style.fontVariationSettings = "")));

  return { measure, frame, reset };
}
