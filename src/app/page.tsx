import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { UpClose } from "@/components/sections/UpClose";
import { Statement } from "@/components/sections/Statement";
import { Services } from "@/components/sections/Services";
import { Experience } from "@/components/sections/Experience";
import { PageMotion } from "@/components/motion/PageMotion";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <SelectedWork />
      <UpClose />
      <Statement />
      <Experience variant="compact" />
      <Services />
      {/* last, so its effect runs after this page has hydrated */}
      <PageMotion />
    </>
  );
}
