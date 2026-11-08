"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "@/lib/motion";
import { projects, site } from "@/content/site";

const WorkScene = dynamic(() => import("./WorkScene"), { ssr: false });

/**
 * About columns, as on the reference: a sticky 4:5 portrait that tilts toward
 * the cursor (±10°, eased by a 0.2s CSS transition) on the left; the intro,
 * paragraphs and toolkit list on the right, each fading up on its own.
 */
export function AboutColumns() {
  const frame = useRef<HTMLDivElement>(null);
  const { about } = site;

  // Tilt: only while the pointer is over (or just around) the portrait
  useEffect(() => {
    const el = frame.current;
    if (!el || motion.reduce || !motion.fine) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const near = Math.abs(x) < 0.6 && Math.abs(y) < 0.6;
      el.style.transform = near
        ? `perspective(900px) rotateY(${(10 * x).toFixed(2)}deg) rotateX(${(-10 * y).toFixed(2)}deg)`
        : "none";
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <section className="columns">
      <div className="columns__grid">
        <div className="columns__column columns__column--media">
          <div className="media-block">
            <div className="media-block__reveal" data-reveal="">
              <div ref={frame} className="media-block__frame">
                {about.photo ? (
                  <Image
                    src={about.photo}
                    alt={`${site.firstName} ${site.lastName}`}
                    fill
                    sizes="(max-width: 700px) 100vw, 45vw"
                    className="media-block__img"
                    priority
                  />
                ) : (
                  <WorkScene colors={projects[0].colors} paused={false} />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="columns__column">
          <div className="content">
            <p className="content__lead" data-reveal="">
              {about.lead}
            </p>
            <div className="content__text">
              {about.text.map((t, i) => (
                <p key={i} data-reveal="">
                  {t}
                </p>
              ))}
            </div>
          </div>
          <div className="list">
            <div className="list__label eyebrow eyebrow--field" data-reveal="">
              {about.toolkitLabel}
            </div>
            <ul className="list__grid" data-reveal="">
              {about.toolkit.map((t) => (
                <li key={t} className="list__item">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
