import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/sections/ComingSoon";
import { projects } from "@/content/site";

// Temporary placeholder (projects link to their live sites once `url` is set),
// so it may wait on `params` instead of rendering an instant shell
export const instant = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  return (
    <ComingSoon
      eyebrow={`(${project.year}) ${project.kind}`}
      title={project.name.join(" ")}
      text="The live link for this project is on its way."
    />
  );
}
