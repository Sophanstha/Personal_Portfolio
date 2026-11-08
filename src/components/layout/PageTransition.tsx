"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { kineticFvs } from "@/lib/kinetic";
import { motion } from "@/lib/motion";
import { routeLabels } from "@/content/site";

type Ctx = { go: (href: string) => void };
const TransitionContext = createContext<Ctx>({ go: () => {} });

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function labelFor(href: string) {
  const path = href.split(/[?#]/)[0] || "/";
  const known = routeLabels[path];
  if (known) return known;
  const last = path.split("/").filter(Boolean).pop() ?? "Home";
  return { label: last.replace(/-/g, " "), subtitle: "Loading" };
}

/**
 * Full-screen accent bars cover the page, the destination's name rises in,
 * the route changes underneath, then everything lifts away.
 */
export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const pending = useRef<{ path: string; resolve: () => void } | null>(null);

  useEffect(() => {
    const p = pending.current;
    if (p && p.path === pathname) p.resolve();
  }, [pathname]);

  const go = useCallback(
    async (href: string) => {
      const el = panel.current;
      if (!el || busy.current) return;
      busy.current = true;
      const html = document.documentElement;
      const target = href.split(/[?#]/)[0] || "/";
      const { label, subtitle } = labelFor(href);

      // Build the label letter by letter
      const labelEl = el.querySelector<HTMLElement>("[data-plabel]")!;
      labelEl.textContent = "";
      const letters: HTMLElement[] = [];
      label.split(" ").forEach((word) => {
        const w = document.createElement("span");
        w.className = "transition__word";
        Array.from(word).forEach((ch) => {
          const clip = document.createElement("span");
          clip.className = "transition__clip";
          const s = document.createElement("span");
          s.className = "transition__letter";
          s.textContent = ch;
          clip.appendChild(s);
          w.appendChild(clip);
          letters.push(s);
        });
        labelEl.appendChild(w);
      });
      el.querySelector<HTMLElement>("[data-psub]")!.textContent = subtitle;
      const bars = el.querySelectorAll<HTMLElement>("[data-bar]");
      const meta = el.querySelector<HTMLElement>("[data-pmeta]");
      const line = el.querySelector<HTMLElement>("[data-pline]");
      const main = document.getElementById("main");

      html.setAttribute("data-transition", "");
      motion.lenis?.stop();
      const started = performance.now();
      gsap.set(el, { visibility: "visible" });

      // Cover
      const cover = gsap.timeline();
      cover
        .fromTo(bars, { yPercent: 101 }, { yPercent: 0, duration: 0.52, ease: "inOut", stagger: 0.04 }, 0)
        .to(main, { y: "-10vh", opacity: 0.3, duration: 0.65, ease: "inOut" }, 0)
        .fromTo(
          letters,
          { yPercent: 110, fontVariationSettings: "'wdth' 125, 'wght' 200" },
          { yPercent: 0, fontVariationSettings: kineticFvs(0), duration: 0.65, ease: "out", stagger: 0.016 },
          0.2,
        )
        .fromTo(meta, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "out" }, 0.26)
        .fromTo(line, { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, duration: 0.7, ease: "inOut" }, 0.24);

      await wait((0.52 + (bars.length - 1) * 0.04) * 1000);

      // Swap the route while covered
      html.removeAttribute("data-entered");
      if (target !== pathname) {
        await new Promise<void>((resolve) => {
          pending.current = { path: target, resolve };
          setTimeout(resolve, 12000);
          router.push(href, { scroll: false });
        });
        pending.current = null;
      }
      gsap.set(main, { clearProps: "transform,opacity" });
      // Land on the #section the link points at (under the fixed header), else the top
      const anchor = href.includes("#") ? document.getElementById(href.split("#")[1]) : null;
      const top = anchor ? Math.max(0, anchor.getBoundingClientRect().top + window.scrollY - 80) : 0;
      motion.lenis?.scrollTo(top, { immediate: true, force: true });
      window.scrollTo(0, top);
      // Hold the cover at least 900ms in total, plus a beat for the new page to paint
      await wait(Math.max(0, 900 - (performance.now() - started)) + 50);

      // Uncover
      cover.kill();
      const uncover = gsap.timeline();
      uncover
        .to(letters, { yPercent: -110, duration: 0.5, ease: "inOut", stagger: 0.014 }, 0)
        .to(meta, { opacity: 0, duration: 0.25 }, 0)
        .to(line, { scaleX: 0, transformOrigin: "right", duration: 0.5, ease: "inOut" }, 0)
        .to(bars, { yPercent: -101, duration: 0.6, ease: "inOut", stagger: 0.04 }, 0.2)
        // Let the new page start entering while the bars lift
        .call(() => html.removeAttribute("data-transition"), [], 0.35);
      await uncover;

      gsap.set(el, { visibility: "hidden" });
      gsap.set(bars, { yPercent: 101 });
      motion.lenis?.start();
      busy.current = false;
    },
    [pathname, router],
  );

  return (
    <TransitionContext.Provider value={{ go }}>
      {children}
      <div ref={panel} className="transition" aria-hidden="true">
        <div className="transition__bars">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="transition__bar" data-bar="" />
          ))}
        </div>
        <div className="transition__text">
          <div className="transition__meta eyebrow" data-pmeta="">
            <span>(Next)</span>
            <span data-psub="" />
          </div>
          <div className="transition__label" data-plabel="" />
          <div className="transition__line" data-pline="" />
        </div>
      </div>
    </TransitionContext.Provider>
  );
}

export const useTransitionNav = () => useContext(TransitionContext);

type LinkProps = React.ComponentProps<typeof Link> & { href: string };

/** next/link that plays the page transition for internal navigations. */
export function TransitionLink({ href, ...rest }: LinkProps) {
  const { go } = useTransitionNav();
  const pathname = usePathname();
  return (
    <Link
      href={href}
      {...rest}
      onNavigate={(e) => {
        const target = href.split(/[?#]/)[0] || "/";
        if (motion.reduce || target === pathname) return;
        e.preventDefault();
        go(href);
      }}
    />
  );
}
