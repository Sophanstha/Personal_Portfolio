import type { Metadata } from "next";
import { PageMotion } from "@/components/motion/PageMotion";
import { PageTitle } from "@/components/sections/PageTitle";
import { ServiceList } from "@/components/sections/ServiceList";
import { servicesPage, site } from "@/content/site";

export const metadata: Metadata = {
  title: `Web Design & Development Services | ${site.firstName} ${site.lastName}`,
  description: servicesPage.intro,
};

export default function ServicesPage() {
  return (
    <>
      <PageTitle text={servicesPage.title} size="medium" intro={servicesPage.intro} />
      <ServiceList />
      {/* last, so its effect runs after this page has hydrated */}
      <PageMotion />
    </>
  );
}
