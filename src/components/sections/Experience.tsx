import { TransitionLink } from "@/components/layout/PageTransition";
import { cn } from "@/lib/utils";
import { experience } from "@/content/site";

/**
 * Work history as hairline rows, in the same style as the Services list.
 * - "compact" (home page): dates, role and company, plus a link to About.
 * - "full" (About page): adds type, location, a short description and skills.
 * The current job is marked "Now" with a pulsing accent dot.
 */
export function Experience({ variant }: { variant: "compact" | "full" }) {
  const { label, more, items } = experience;
  const full = variant === "full";

  return (
    <section className={cn("experience", `experience--${variant}`)} id={full ? "experience" : undefined}>
      <div className="section-head eyebrow" data-reveal="">
        <h2 className="experience__label">
          {label} ({String(items.length).padStart(2, "0")})
        </h2>
        {full ? (
          <span>
            {items.at(-1)?.start.split(" ")[1]} — Now
          </span>
        ) : (
          <TransitionLink href="/about#experience" className="experience__link" data-cursor="About">
            {more} →
          </TransitionLink>
        )}
      </div>

      <ol className="experience__rows">
        {items.map((job) => (
          <li key={`${job.company}-${job.start}`} className="experience__row" data-reveal="">
            <div className="experience__when">
              <span>
                {job.start} — {job.end ?? <span className="experience__now">Now</span>}
              </span>
              {full && <span className="experience__place">{job.place}</span>}
            </div>

            <div className="experience__who">
              <h3 className="experience__role">{job.role}</h3>
              <p className="experience__company">
                {job.company} <span className="experience__type">· {job.type}</span>
              </p>
            </div>

            {full && (
              <div className="experience__what">
                <p className="experience__text">{job.text}</p>
                {job.tags.length > 0 && (
                  <div className="chip-list">
                    {job.tags.map((t) => (
                      <span key={t} className="chip">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
