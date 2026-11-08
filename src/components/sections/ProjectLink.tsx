import { TransitionLink } from "@/components/layout/PageTransition";
import type { Project } from "@/content/site";

/** Where a project click goes: its live site once `url` is set, else its page here. */
export const projectHref = (p: Project) => p.url || `/projects/${p.slug}`;

/**
 * Link to a project. With a `url` it opens the live site in a new tab;
 * without one it plays the page transition to /projects/[slug].
 */
export function ProjectLink({
  project,
  ...rest
}: Omit<React.ComponentProps<"a">, "href"> & { project: Project }) {
  if (project.url) return <a href={project.url} target="_blank" rel="noreferrer" {...rest} />;
  return <TransitionLink href={`/projects/${project.slug}`} {...rest} />;
}
