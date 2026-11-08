import { TransitionLink } from "@/components/layout/PageTransition";
import { services, servicesPage } from "@/content/site";

/**
 * Services page body, as on the reference: full-width rows (number + title,
 * description, tag chips) that slide right and turn accent on hover; a
 * four-step process; and two plan cards that lift and fill with the accent.
 */
export function ServiceList() {
  const { stepsLabel, steps, plansLabel, plans } = servicesPage;

  return (
    <>
      <section className="service-list">
        <div className="service-list__rows">
          {services.map((s, i) => (
            <TransitionLink
              key={s.slug}
              href={`/services/${s.slug}`}
              className="service-list__row"
              data-reveal=""
              data-cursor="Open"
            >
              <div className="service-list__heading">
                <span className="service-list__number">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="service-list__title">{s.title}</h2>
              </div>
              <p className="service-list__description">{s.description}</p>
              <div className="service-list__tags chip-list">
                {s.tags.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            </TransitionLink>
          ))}
        </div>
      </section>

      <section className="steps">
        <h2 className="steps__label eyebrow" data-reveal="">
          {stepsLabel}
        </h2>
        <ol className="steps__grid">
          {steps.map((s) => (
            <li key={s.title} className="steps__step" data-reveal="">
              <h3 className="steps__title">{s.title}</h3>
              <p className="steps__description">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="plans">
        <h2 className="plans__label eyebrow" data-reveal="">
          {plansLabel}
        </h2>
        <div className="plans__grid">
          {plans.map((p) => (
            // The reveal tween moves the wrapper, so it never fights the card's hover lift
            <div key={p.title} className="plans__item" data-reveal="">
              <TransitionLink href="/contact" className="plans__card" data-cursor="Enquire" data-cursor-tone="dark">
                <h3 className="plans__title">{p.title}</h3>
                <p className="plans__description">{p.text}</p>
                <div className="plans__price">{p.price}</div>
              </TransitionLink>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
