import type { Metadata } from "next";
import { PageMotion } from "@/components/motion/PageMotion";
import { AboutColumns } from "@/components/sections/AboutColumns";
import { Experience } from "@/components/sections/Experience";
import { PageTitle } from "@/components/sections/PageTitle";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `About ${site.firstName} ${site.lastName} | ${site.role}`,
  description: site.about.lead,
};

export default function AboutPage() {
  return (
    <>
      <PageTitle text={site.about.title} />
      <AboutColumns />
      <Experience variant="full" />
      {/* last, so its effect runs after this page has hydrated */}
      <PageMotion />
    </>
  );
}
