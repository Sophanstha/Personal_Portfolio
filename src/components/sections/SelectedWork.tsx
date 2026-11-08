"use client";

import { useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Button } from "@/components/ui/button";
import { useTransitionNav } from "@/components/layout/PageTransition";
import { cn } from "@/lib/utils";
import { projects } from "@/content/site";
import { ProjectArt } from "./ProjectArt";
import { ProjectLink, projectHref } from "./ProjectLink";

const WorkScene = dynamic(() => import("./WorkScene"), { ssr: false });

const pad = (n: number) => String(n).padStart(2, "0");

// Phone layout (matches the CSS breakpoint)
const MOBILE = "(max-width: 700px)";
// Slides in the phone carousel, per project
const SLIDES = ["cover", "mobile", "detail"] as const;

/**
 * Tall project rows on the left; a sticky WebGL "cover" on the right that
 * follows whichever row is in the middle of the screen.
 *
 * On phones (as on the reference) the cover becomes a 16:9 strip pinned under
 * the header: the row whose name is most visible below it takes focus, its
 * slides cross-fade in, and a sideways swipe steps through them.
 */
export function SelectedWork() {
  const root = useRef<HTMLElement>(null);
  const col = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0.5, y: 0.5, over: false });
  const press = useRef<{ x: number; y: number } | null>(null);
  const focused = useRef(0);
  const [focus, setFocus] = useState(0);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [mobile, setMobile] = useState(false);
  const { go } = useTransitionNav();

  // A new project always starts on its first slide
  const focusOn = (i: number) => {
    if (focused.current === i) return;
    focused.current = i;
    setFocus(i);
    setSlide(0);
  };

  useGSAP(
    () => {
      // Only render the WebGL cover while the section is on screen
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => setInView(self.isActive),
      });
      gsap.fromTo(
        bar.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: ".work__list", start: "top center", end: "bottom center", scrub: true },
        },
      );

      const mm = gsap.matchMedia();
      mm.add(MOBILE, () => {
        setMobile(true);
        const names = gsap.utils.toArray<HTMLElement>(".work__name");
        // Bottom edge of the pinned strip, re-read on refresh (resize, fonts)
        let lo = 0;
        const measure = () => {
          const el = col.current;
          if (el) lo = (parseFloat(getComputedStyle(el).top) || 64) + el.offsetHeight;
        };
        measure();
        // Focus = the name most visible between the pinned strip and the bottom of the screen
        const pick = () => {
          const hi = innerHeight;
          const mid = (lo + hi) / 2;
          let best = -1;
          let bestD = Infinity;
          let pickI = 0;
          names.forEach((n, i) => {
            const r = n.getBoundingClientRect();
            const vis = Math.max(0, Math.min(r.bottom, hi) - Math.max(r.top, lo)) / (r.height || 1);
            const d = Math.abs((r.top + r.bottom) / 2 - mid);
            if (vis > best + 0.01 || (vis >= best - 0.01 && d < bestD)) {
              best = Math.max(vis, best);
              bestD = d;
              pickI = i;
            }
          });
          focusOn(pickI);
        };
        ScrollTrigger.create({
          trigger: ".work__list",
          start: "top bottom",
          end: "bottom top",
          onUpdate: pick,
          onRefresh: () => {
            measure();
            pick();
          },
        });
        return () => setMobile(false);
      });
      mm.add("(min-width: 701px)", () => {
        gsap.utils.toArray<HTMLElement>(".work__row").forEach((row, i) =>
          ScrollTrigger.create({
            trigger: row,
            start: "top center",
            end: "bottom center",
            onToggle: (self) => self.isActive && focusOn(i),
          }),
        );
      });
    },
    { scope: root },
  );

  // Cover "settles" each time the focused project changes
  useGSAP(
    () => {
      gsap.fromTo(stage.current, { scale: 1.08 }, { scale: 1, duration: 1.2, ease: "out" });
      gsap.fromTo(".work__layer--on", { scale: 1.08 }, { scale: 1, duration: 1.2, ease: "out" });
      gsap.fromTo(
        ".work__big, .work__meta > *",
        { yPercent: 60, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.8, ease: "out", stagger: 0.05 },
      );
    },
    { scope: root, dependencies: [focus] },
  );

  const current = projects[focus];

  // Tap opens the project; on phones a sideways swipe changes slide
  const onPointerUp = (e: React.PointerEvent) => {
    const start = press.current;
    press.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (mobile && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      setSlide((s) => Math.max(0, Math.min(SLIDES.length - 1, s + (dx < 0 ? 1 : -1))));
    } else if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
      if (current.url) window.open(current.url, "_blank", "noopener");
      else go(projectHref(current));
    }
  };

  return (
    <section ref={root} id="projects" className="work">
      <div className="work__head eyebrow" data-reveal="">
        <h2 className="work__label">Selected projects ({pad(projects.length)})</h2>
        <span className="work__head-end">
          <Button variant="link" className="work__pause eyebrow" onClick={() => setPaused((p) => !p)}>
            ({paused ? "Play motion" : "Pause motion"})
          </Button>
          <span className="work__years">
            {projects.at(-1)?.year} — {projects[0].year}
          </span>
        </span>
      </div>

      <div className="work__grid">
        <div className="work__list">
          {projects.map((p, i) => (
            <ProjectLink
              key={p.slug}
              project={p}
              className={cn("work__row", focus === i && "work__row--focus")}
              data-reveal=""
              data-cursor="View"
            >
              <span className="work__num">{pad(i + 1)}</span>
              <div className="work__name">
                {p.name.map((line) => (
                  <span key={line} className="work__line">
                    {line}
                  </span>
                ))}
              </div>
              <span className="work__year">{p.year}</span>
              <div className="work__details">
                <span>{p.kind}</span>
                {p.tag && <span className="work__tag">{p.tag}</span>}
                <span className="work__cta">
                  View project <FiArrowRight />
                </span>
              </div>
            </ProjectLink>
          ))}
        </div>

        <div ref={col} className="work__col" aria-hidden="true">
          <div className="work__dock">
            <div
              className="work__frame"
              data-cursor="View"
              onPointerDown={(e) => {
                const plain = !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);
                press.current = e.button === 0 && plain ? { x: e.clientX, y: e.clientY } : null;
              }}
              onPointerUp={onPointerUp}
              onPointerCancel={() => (press.current = null)}
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                pointer.current.x = (e.clientX - r.left) / r.width;
                pointer.current.y = 1 - (e.clientY - r.top) / r.height;
              }}
              onPointerEnter={() => (pointer.current.over = true)}
              onPointerLeave={() => (pointer.current.over = false)}
            >
              <div ref={stage} className="work__stage">
                {/* Phones never show the shader, so they don't pay for a WebGL context */}
                {!mobile && (
                  <WorkScene colors={current.colors} paused={paused || !inView || !!current.fullPage} pointer={pointer} />
                )}
              </div>
              {/* Desktop: a full-page screenshot fills the frame; a wide one floats on the shader */}
              {projects.map((p, i) =>
                p.fullPage ? (
                  <div key={p.slug} className={cn("work__cover", focus === i && "work__cover--on")}>
                    <Image src={p.fullPage} alt="" fill sizes="(max-width: 1100px) 300px, 460px" />
                  </div>
                ) : (
                  p.image && (
                    <div key={p.slug} className={cn("work__shot", focus === i && "work__shot--on")}>
                      <Image src={p.image} alt="" fill sizes="(max-width: 1100px) 300px, 460px" />
                    </div>
                  )
                ),
              )}
              {!current.fullPage && (
                <>
                  <span className="work__big">{pad(focus + 1)}</span>
                  <span className="work__frame-name">{current.name.join(" ")}</span>
                </>
              )}

              {/* Phones: one layer per project, each a strip of slides */}
              <div className="work__slides">
                {projects.map((p, i) => (
                  <div key={p.slug} className={cn("work__layer", focus === i && "work__layer--on")}>
                    <div
                      className="work__strip"
                      style={
                        {
                          "--slides": SLIDES.length,
                          transform: focus === i ? `translateX(${(-100 * slide) / SLIDES.length}%)` : "none",
                        } as CSSProperties
                      }
                    >
                      {SLIDES.map((v) => (
                        <div key={v} className="work__slide">
                          <ProjectArt project={p} variant={v} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="work__dots">
                  {SLIDES.map((v, k) => (
                    <span key={v} className={cn("work__dot", k === slide && "work__dot--on")} />
                  ))}
                </div>
              </div>
            </div>
            <div className="work__meta eyebrow">
              <span>
                ( <span className="work__cur">{pad(focus + 1)}</span> / {pad(projects.length)} )
              </span>
              <span className="work__plat">{current.platform}</span>
            </div>
            <div className="work__track">
              <div ref={bar} className="work__bar" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
