"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { lockScroll } from "@/lib/motion";
import { site } from "@/content/site";

/**
 * First-visit loader: the logo letters rise and morph through the width axis,
 * a counter runs 000 → 100, then the accent box zooms to fill the screen and
 * wipes away to reveal the page. Click or Esc plays it at 4× speed.
 */
export function Intro() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const el = root.current;
    if (!el || !html.hasAttribute("data-intro")) return;

    html.setAttribute("data-intro", "playing");
    try {
      sessionStorage.setItem("sp-intro", "1");
    } catch {}
    lockScroll(true);

    const q = gsap.utils.selector(el);
    const letters = q<HTMLElement>("[data-il]");
    const box = q<HTMLElement>("[data-ibox]")[0];
    const boxLetter = q<HTMLElement>("[data-iw]")[0];
    const bg = q<HTMLElement>("[data-ibg]")[0];
    const meta = q<HTMLElement>("[data-imeta]")[0];
    const count = q<HTMLElement>("[data-icount]")[0];
    const line = q<HTMLElement>("[data-iline]")[0];

    let done = false;
    const finish = () => {
      done = true;
      lockScroll(false);
      html.removeAttribute("data-intro");
    };

    const tl = gsap.timeline({ onComplete: () => gsap.set(el, { display: "none" }) });

    // Letters rise + morph wide/thin → narrow/heavy → resting style
    letters.forEach((l, i) => {
      const rest = l.dataset.il === "italic" ? "'wdth' 110, 'wght' 250" : "'wdth' 68, 'wght' 850";
      tl.fromTo(l, { yPercent: 115 }, { yPercent: 0, duration: 0.65, ease: "out" }, 0.08 + 0.03 * i);
      tl.fromTo(
        l,
        { fontVariationSettings: "'wdth' 125, 'wght' 150" },
        {
          keyframes: [
            { fontVariationSettings: "'wdth' 62, 'wght' 900", duration: 0.3375, ease: "sine.inOut" },
            { fontVariationSettings: rest, duration: 0.4125, ease: "sine.inOut" },
          ],
        },
        0.1 + 0.022 * i,
      );
    });
    tl.fromTo(box, { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 0.65, ease: "out" }, 0.22);
    tl.fromTo(meta, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.14);

    const progress = { p: 0 };
    tl.to(
      progress,
      {
        p: 1,
        duration: 1,
        ease: "power2.out", // cubic out
        onUpdate: () => {
          count.textContent = String(Math.round(progress.p * 100)).padStart(3, "0");
          line.style.transform = `scaleX(${progress.p.toFixed(4)})`;
        },
      },
      0,
    );

    // Exit
    const exitAt = 1.12;
    tl.to(letters, { yPercent: -115, duration: 0.48, ease: "inOut", stagger: 0.016 }, exitAt);
    tl.to([meta, line], { opacity: 0, duration: 0.25 }, exitAt);
    tl.to(boxLetter, { opacity: 0, duration: 0.2 }, exitAt + 0.2);
    tl.call(() => el.setAttribute("data-cursor-tone", "dark"), [], exitAt);
    tl.to(
      box,
      {
        duration: 0.9,
        ease: "inOutStrong",
        x: () => {
          const r = box.getBoundingClientRect();
          return innerWidth / 2 - (r.left + r.width / 2);
        },
        y: () => {
          const r = box.getBoundingClientRect();
          return innerHeight / 2 - (r.top + r.height / 2);
        },
        scale: () => {
          const r = box.getBoundingClientRect();
          return 1.15 * Math.max(innerWidth / r.width, innerHeight / r.height);
        },
      },
      exitAt,
    );
    // Box now covers the screen: drop the dark backdrop, start the page, wipe the box up
    tl.set(bg, { opacity: 0 }, exitAt + 0.9);
    tl.call(finish, [], exitAt + 0.95);
    tl.to(box, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.8, ease: "inOut" }, exitAt + 0.95);

    const skip = () => {
      tl.timeScale(4);
      el.removeAttribute("data-cursor");
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && skip();
    el.addEventListener("click", skip);
    window.addEventListener("keydown", onKey);

    return () => {
      el.removeEventListener("click", skip);
      window.removeEventListener("keydown", onKey);
      tl.kill();
      // Strict Mode re-runs this effect: leave it pending so the re-run plays it
      if (!done) {
        html.setAttribute("data-intro", "pending");
        lockScroll(false);
      }
    };
  }, []);

  const { first, box, rest } = site.logo;
  return (
    <div ref={root} className="intro" data-cursor="Skip" aria-hidden="true">
      <div className="intro__bg" data-ibg="" />
      <div className="intro__lockup">
        <div className="intro__logo">
          <span className="intro__clip">
            {Array.from(first).map((ch, i) => (
              <span key={i} className="intro__letter" data-il="">
                {ch}
              </span>
            ))}
          </span>
          <span className="intro__box" data-ibox="">
            <span data-iw="">{box}</span>
          </span>
          <span className="intro__clip">
            {Array.from(rest).map((ch, i) => (
              <span key={i} className="intro__letter intro__letter--italic" data-il="italic">
                {ch}
              </span>
            ))}
          </span>
        </div>
      </div>
      <div className="intro__meta" data-imeta="">
        <div className="intro__role eyebrow">
          <span>{site.role}</span>
          <span>{site.location}</span>
        </div>
        <span className="intro__count" data-icount="">
          000
        </span>
      </div>
      <div className="intro__line" data-iline="" />
    </div>
  );
}
