"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { KineticLine } from "@/components/motion/KineticLine";
import { clamp, isMotionOff, lerpFactor, motion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { projects, type Project } from "@/content/site";
import { ProjectArt } from "./ProjectArt";
import { ProjectLink } from "./ProjectLink";

const pad = (n: number) => String(n).padStart(2, "0");

const noop = () => () => {};
const getBody = () => (isMotionOff() ? null : document.body);
const getNoBody = () => null;

/** A project's tallest picture: full-page shot, else its art. */
function Cover({ project, sizes }: { project: Project; sizes: string }) {
  return project.fullPage ? (
    <Image src={project.fullPage} alt="" fill sizes={sizes} className="work-index__img" />
  ) : (
    <ProjectArt project={project} variant="cover" />
  );
}

/**
 * Projects index, as on the reference's /work page: a big kinetic title with
 * the project count, and a List / Grid toggle.
 * - List: a table of rows; hovering one shows its cover beside the cursor
 *   (fine pointers only), easing in, tilting with the cursor's speed.
 * - Grid: two columns of 4:3 cards whose picture zooms slowly on hover.
 */
export function ProjectIndex({ title }: { title: string }) {
  const root = useRef<HTMLElement>(null);
  const reveal = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);
  const [list, setList] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);
  // The hover card is portalled to <body> so page transforms never offset it
  const body = useSyncExternalStore(noop, getBody, getNoBody);

  useEffect(() => {
    hovering.current = hovered !== null;
  }, [hovered]);

  // Hover card: follows the cursor (30px right, 200px up), fades and grows in
  useEffect(() => {
    const el = reveal.current;
    if (!el || !motion.fine || motion.reduce) return;
    const s = { x: motion.pointer.x, y: motion.pointer.y, scale: 0.6, alpha: 0 };
    const tick = (_time: number, dt: number) => {
      const on = hovering.current;
      if (!on && s.alpha <= 0.005) {
        s.x = motion.pointer.x;
        s.y = motion.pointer.y;
        return;
      }
      const k = clamp(dt / 16.67, 1, 4);
      const px = s.x;
      s.x += (motion.pointer.x - s.x) * lerpFactor(0.1, k);
      s.y += (motion.pointer.y - s.y) * lerpFactor(0.1, k);
      s.scale += ((on ? 1 : 0.6) - s.scale) * lerpFactor(0.12, k);
      s.alpha += (Number(on) - s.alpha) * lerpFactor(0.15, k);
      const tilt = clamp(((s.x - px) / k) * 0.6, -12, 12);
      el.style.transform = `translate3d(${(s.x + 30).toFixed(1)}px,${(s.y - 200).toFixed(1)}px,0) rotate(${tilt.toFixed(2)}deg) scale(${s.scale.toFixed(3)})`;
      el.style.opacity = s.alpha.toFixed(3);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [body]);

  // Switching view: the new rows / cards rise in like the page reveals
  // (compares with the last view, so React's double-run on mount does nothing)
  const shown = useRef(list);
  useGSAP(
    () => {
      if (shown.current === list) return;
      shown.current = list;
      ScrollTrigger.refresh();
      if (motion.reduce) return;
      gsap.fromTo(
        ".work-index__cols, .work-index__row, .project-card",
        { autoAlpha: 0, y: 48 },
        { autoAlpha: 1, y: 0, duration: 1.1, ease: "out", stagger: 0.07, clearProps: "transform" },
      );
    },
    { scope: root, dependencies: [list] },
  );

  const view = (toList: boolean) => {
    setList(toList);
    setHovered(null);
  };

  return (
    <section ref={root} className="work-index">
      <div className="work-index__head">
        <h1 className="work-index__title" data-fit="">
          <KineticLine text={title} className="work-index__line" enter radius={360} />
          <sup className="work-index__count" data-in="">
            ({pad(projects.length)})
          </sup>
        </h1>
        <div className="work-index__toggle" role="group" aria-label="View">
          <button
            type="button"
            className={cn("work-index__view", list && "work-index__view--active")}
            aria-pressed={list}
            onClick={() => view(true)}
          >
            List
          </button>
          <button
            type="button"
            className={cn("work-index__view", !list && "work-index__view--active")}
            aria-pressed={!list}
            onClick={() => view(false)}
          >
            Grid
          </button>
        </div>
      </div>

      {list ? (
        <div onMouseLeave={() => setHovered(null)}>
          <div className="work-index__cols" aria-hidden="true">
            <span>#</span>
            <span>Project</span>
            <span>Type</span>
            <span>Role</span>
            <span className="work-index__year">Year</span>
          </div>
          {projects.map((p, i) => (
            <ProjectLink
              key={p.slug}
              project={p}
              className="work-index__row"
              data-reveal=""
              data-cursor={p.url ? "Visit" : "View"}
              onMouseEnter={() => setHovered(i)}
            >
              <span className="work-index__num">{pad(i + 1)}</span>
              <span className="work-index__name">{p.name.join(" ")}</span>
              <span className="work-index__detail">{p.kind}</span>
              <span className="work-index__detail">{p.role}</span>
              <span className="work-index__num work-index__year">{p.year}</span>
            </ProjectLink>
          ))}
          <div className="work-index__end" />
        </div>
      ) : (
        <div className="work-index__grid">
          {projects.map((p) => (
            <ProjectLink
              key={p.slug}
              project={p}
              className="project-card"
              data-reveal=""
              data-cursor={p.url ? "Visit" : "View"}
            >
              <div className="project-card__media">
                <div className="project-card__layer">
                  <ProjectArt project={p} variant="cover" />
                </div>
              </div>
              <div className="project-card__meta">
                <span className="project-card__name">{p.name.join(" ")}</span>
                <span className="project-card__year">{p.year}</span>
              </div>
              <div className="project-card__type">{p.kind}</div>
            </ProjectLink>
          ))}
        </div>
      )}

      {body &&
        createPortal(
          <div ref={reveal} className="project-reveal" aria-hidden="true">
            {projects.map((p, i) => (
              <div key={p.slug} className={cn("project-reveal__layer", hovered === i && "project-reveal__layer--active")}>
                <Cover project={p} sizes="320px" />
              </div>
            ))}
          </div>,
          body,
        )}
    </section>
  );
}
