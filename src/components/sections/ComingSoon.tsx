import { KineticLine } from "@/components/motion/KineticLine";
import { PageMotion } from "@/components/motion/PageMotion";
import { TransitionLink } from "@/components/layout/PageTransition";

/** Placeholder for pages that aren't designed yet (keeps nav + transitions working). */
export function ComingSoon({
  eyebrow = "(On its way)",
  title = "Soon",
  text = "This page is still being designed. The home page is where the action is for now.",
}: {
  eyebrow?: string;
  title?: string;
  text?: string;
}) {
  return (
    <section className="soon">
      <span className="eyebrow eyebrow--accent" data-reveal="">
        {eyebrow}
      </span>
      <h1 className="soon__title" data-fit="">
        <KineticLine text={title} className="soon__line" enter radius={300} />
      </h1>
      <p className="soon__text" data-reveal="">
        {text}
      </p>
      <TransitionLink href="/" className="soon__link eyebrow" data-reveal="" data-magnet="" data-cursor="Home">
        ← Back home
      </TransitionLink>
      <PageMotion />
    </section>
  );
}
