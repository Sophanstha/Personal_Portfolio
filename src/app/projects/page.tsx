import type { Metadata } from "next";
import { PageMotion } from "@/components/motion/PageMotion";
import { ProjectIndex } from "@/components/sections/ProjectIndex";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `Web Design & Development Projects | ${site.firstName} ${site.lastName}`,
  description: "Websites, web apps and stores I've designed and built.",
};

export default function ProjectsPage() {
  return (
    <>
      <ProjectIndex title="Projects" />
      {/* last, so its effect runs after this page has hydrated */}
      <PageMotion />
    </>
  );
}
