"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { lockScroll } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { site } from "@/content/site";
import { Clock } from "./Clock";
import { TransitionLink } from "./PageTransition";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const fill = useRef<HTMLSpanElement>(null);
  const menu = useRef<HTMLElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  // Logo box fills up as you scroll the page
  useGSAP(
    () => {
      gsap.set(fill.current, { scaleY: 0 });
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => gsap.set(fill.current, { scaleY: self.progress }),
      });
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  // Menu open / close timeline
  useGSAP(
    () => {
      const q = gsap.utils.selector(menu);
      tl.current = gsap
        .timeline({ paused: true })
        .set(menu.current, { visibility: "visible" })
        .fromTo(
          menu.current,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "inOut" },
        )
        .fromTo(
          q(".menu__label"),
          { yPercent: 110 },
          { yPercent: 0, duration: 0.8, ease: "out", stagger: 0.05 },
          0.3,
        )
        .fromTo(q(".menu__number, .menu__footer"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.5);
    },
    { scope: menu },
  );

  const locked = useRef(false);
  useEffect(() => {
    if (open) {
      tl.current?.timeScale(1).play();
      lockScroll(true);
      locked.current = true;
    } else if (locked.current) {
      tl.current?.timeScale(1.6).reverse();
      lockScroll(false);
      locked.current = false;
    }
  }, [open]);

  const { first, box, rest } = site.logo;

  return (
    <>
      <header className="header">
        <TransitionLink href="/" className="header__logo" data-cursor="Home" aria-label={`${site.firstName} ${site.lastName}, home`}>
          <span className="header__logo-first" aria-hidden="true">
            {first}
          </span>
          <span className="header__logo-box" aria-hidden="true">
            <span ref={fill} className="header__logo-fill" />
            <span className="header__logo-letter">{box}</span>
          </span>
          <span className="header__logo-rest" aria-hidden="true">
            {rest}
          </span>
        </TransitionLink>

        <div className="header__status eyebrow">
          <span>{site.location}</span>
          <span className="header__slash">/</span>
          <Clock />
        </div>

        <nav className="header__links eyebrow" aria-label="Main">
          {site.nav.map((l) => (
            <TransitionLink
              key={l.href}
              href={l.href}
              className={cn("header__link", pathname.startsWith(l.href) && "header__link--active")}
            >
              {pathname.startsWith(l.href) && <span className="header__dot" aria-hidden="true" />}
              {l.label}
            </TransitionLink>
          ))}
          <TransitionLink href={site.cta.href} className="header__cta" data-cursor="Say hi">
            {site.cta.label}
          </TransitionLink>
        </nav>

        <Button
          variant="outline"
          className="header__menu-button eyebrow"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="header__bars" aria-hidden="true">
            <span className="header__bar" />
            <span className="header__bar" />
          </span>
          {open ? "Close" : "Menu"}
        </Button>
      </header>

      <nav ref={menu} id="site-menu" className="menu" aria-label="Menu" data-lenis-prevent="">
        <div className="menu__items">
          {site.menu.map((l, i) => (
            <TransitionLink
              key={l.href}
              href={l.href}
              className={cn("menu__item", pathname === l.href && "menu__item--active")}
              onClick={() => setOpen(false)}
            >
              <span className="menu__mask">
                <span className="menu__label">{l.label}</span>
              </span>
              <span className="menu__number eyebrow">{String(i + 1).padStart(2, "0")}</span>
            </TransitionLink>
          ))}
        </div>
        <div className="menu__footer eyebrow">
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <Clock />
        </div>
      </nav>
    </>
  );
}
