"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { motion } from "@/lib/motion";
import { projects } from "@/content/site";
import { ProjectArt } from "./ProjectArt";
import { ProjectLink } from "./ProjectLink";

const items = projects.flatMap((p, i) =>
  (["mobile", "detail"] as const).map((variant) => ({ p, i, variant })),
);

/**
 * Desktop: the section pins and vertical scroll drives the track sideways;
 * you can also drag it. Touch / small screens: native swipe with snap.
 */
export function UpClose() {
  const root = useRef<HTMLElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        // Like the reference: mouse users get the pinned scroll; touch keeps native swipe
        "(pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          root.current!.classList.add("up-close--pinned");
          const dist = () =>
            track.current!.scrollWidth - wrap.current!.clientWidth;
          const tween = gsap.to(track.current, {
            x: () => -dist(),
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              pin: true,
              start: "top top",
              end: () => "+=" + dist(),
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
          const st = tween.scrollTrigger as ScrollTrigger;

          // Drag: 1px of drag = 1px of scroll (the pin distance equals the track distance)
          let startX = 0;
          let startScroll = 0;
          let dragging = false;
          const el = wrap.current!;
          const down = (e: PointerEvent) => {
            if (e.button !== 0) return;
            dragging = true;
            startX = e.clientX;
            startScroll = window.scrollY;
            el.setPointerCapture(e.pointerId);
            el.dataset.dragging = "";
          };
          const move = (e: PointerEvent) => {
            if (!dragging) return;
            const target = gsap.utils.clamp(
              st.start,
              st.end,
              startScroll - (e.clientX - startX) * 1.2,
            );
            if (motion.lenis) motion.lenis.scrollTo(target, { lerp: 0.15 });
            else window.scrollTo(0, target);
          };
          const up = (e: PointerEvent) => {
            if (!dragging) return;
            dragging = false;
            delete el.dataset.dragging;
            el.releasePointerCapture(e.pointerId);
            // a real drag shouldn't count as a click on the card
            if (Math.abs(e.clientX - startX) > 6) {
              el.addEventListener("click", (c) => c.preventDefault(), {
                capture: true,
                once: true,
              });
            }
          };
          el.addEventListener("pointerdown", down);
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerup", up);
          el.addEventListener("pointercancel", up);
          return () => {
            el.removeEventListener("pointerdown", down);
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerup", up);
            el.removeEventListener("pointercancel", up);
            root.current?.classList.remove("up-close--pinned");
          };
        },
      );
    },
    { scope: root },
  );

  return (
    // Wrapper div: ScrollTrigger moves the pinned <section> into a pin-spacer,
    // so React's siblings need a stable node to insert against.
    <div>
      <section ref={root} className="up-close">
        <div className="up-close__head eyebrow" data-reveal="">
          <h2 className="up-close__label">(Up close)</h2>
          <span>Drag or scroll</span>
        </div>
        <div ref={wrap} className="up-close__wrap" data-reveal="">
          <div ref={track} className="up-close__track">
            {items.map(({ p, i, variant }) => (
              <ProjectLink
                key={p.slug + variant}
                project={p}
                className="up-close__item"
                data-cursor="Look"
                draggable={false}
              >
                <div className="up-close__frame">
                  <ProjectArt
                    project={p}
                    variant={variant}
                    className="up-close__media"
                  />
                </div>
                <div className="up-close__caption eyebrow">
                  <span>
                    ({String(i + 1).padStart(2, "0")}) {p.name.join(" ")}
                  </span>
                  <span>{variant === "mobile" ? "Mobile" : "Detail"}</span>
                </div>
              </ProjectLink>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
