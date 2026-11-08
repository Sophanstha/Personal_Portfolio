"use client";

import { FaGithub, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";
import { FiArrowUp } from "react-icons/fi";
import { KineticLine } from "@/components/motion/KineticLine";
import { Button } from "@/components/ui/button";
import { scrollToTop } from "@/lib/motion";
import { site } from "@/content/site";
import { Clock } from "./Clock";
import { TransitionLink } from "./PageTransition";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  LinkedIn: FaLinkedinIn,
  GitHub: FaGithub,
  WhatsApp: FaWhatsapp,
};

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__label eyebrow" data-reveal="">
        {site.footer.label}
      </div>
      <TransitionLink href="/contact" className="footer__big" data-cursor="Let's go" data-fit="">
        <KineticLine text={site.footer.big} className="footer__line" radius={260} />
      </TransitionLink>
      <div className="footer__row eyebrow">
        <a href={`mailto:${site.email}`} className="footer__email">
          {site.email}
        </a>
        <div className="footer__socials">
          {site.socials.map((s) => {
            const Icon = icons[s.label];
            return (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" data-magnet="">
                {Icon && <Icon className="size-3.5" />}
                {s.label}
              </a>
            );
          })}
        </div>
        <Clock />
        <Button variant="ghost" className="footer__top eyebrow" onClick={() => scrollToTop()}>
          Back to top <FiArrowUp />
        </Button>
      </div>
    </footer>
  );
}
