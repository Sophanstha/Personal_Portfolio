"use client";

import { FiArrowRight } from "react-icons/fi";
import { KineticLine } from "@/components/motion/KineticLine";
import { Button } from "@/components/ui/button";
import { motion } from "@/lib/motion";
import { site } from "@/content/site";

export function Hero() {
  const toWork = () => {
    const el = document.getElementById("projects");
    if (!el) return;
    if (motion.lenis) motion.lenis.scrollTo(el, { duration: 1.6 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero">
      <div className="hero__top eyebrow" data-reveal="">
        <span>(Portfolio / ©{site.year})</span>
        <span className="hero__meta-centre">{site.role}</span>
        <span>{site.location}</span>
      </div>

      <h1 className="hero__name" data-fit="">
        <KineticLine text={site.firstName} className="hero__line" enter radius={320} />
        <KineticLine text={site.lastName} className="hero__line hero__line--second" enter radius={320} />
      </h1>

      <div className="hero__bottom">
        <p className="hero__intro" data-reveal="">
          {site.intro}
        </p>
        <span className="hero__scroll eyebrow" data-reveal="">
          ↓ Scroll, gently
        </span>
        <div className="hero__end" data-reveal="">
          <Button variant="outline" className="hero__button" data-magnet="" data-cursor="Look" onClick={toWork}>
            See the projects <FiArrowRight />
          </Button>
        </div>
      </div>
    </section>
  );
}
