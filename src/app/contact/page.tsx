import type { Metadata } from "next";
import { PageMotion } from "@/components/motion/PageMotion";
import { ContactForm } from "@/components/sections/ContactForm";
import { PageTitle } from "@/components/sections/PageTitle";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `Contact ${site.firstName} ${site.lastName} | ${site.role}`,
  description: site.contact.intro,
};

export default function ContactPage() {
  return (
    <>
      <PageTitle text={site.contact.title} size="small" />
      <ContactForm />
      {/* last, so its effect runs after this page has hydrated */}
      <PageMotion />
    </>
  );
}
