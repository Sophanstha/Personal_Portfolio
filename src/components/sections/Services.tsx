import { FiArrowRight } from "react-icons/fi";
import { TransitionLink } from "@/components/layout/PageTransition";
import { services } from "@/content/site";

/** Four tiles: an accent fill sweeps up on hover and the title stretches wide. */
export function Services() {
  return (
    <section className="services">
      <div className="section-head eyebrow" data-reveal="">
        <h2 className="services__label">What I do</h2>
        <TransitionLink href="/services" className="services__link">
          All services →
        </TransitionLink>
      </div>
      <div className="services__grid">
        {services.map((s, i) => (
          <TransitionLink
            key={s.title}
            href="/services"
            className="services__tile"
            data-reveal=""
            data-cursor="Open"
            data-cursor-tone="dark"
          >
            <div className="services__fill" />
            <div className="services__content">
              <div className="services__header eyebrow">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <FiArrowRight className="services__arrow" />
              </div>
              <div className="services__title">{s.title}</div>
              <p className="services__description">{s.text}</p>
            </div>
          </TransitionLink>
        ))}
      </div>
    </section>
  );
}
