import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/sections/ComingSoon";
import { services } from "@/content/site";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();
  return <ComingSoon eyebrow="(Services)" title={service.title} text={service.description} />;
}
