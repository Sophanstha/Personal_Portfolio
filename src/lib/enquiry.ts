import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js/min";

/** Numbers typed without a +country code are read as Nepali. */
const DEFAULT_COUNTRY = "NP";

export type Enquiry = {
  name: string;
  email: string;
  phone: string;
  message: string;
  needs: string[];
  budget: string | null;
};

export type Field = "name" | "email" | "phone" | "message";

export const fieldErrors: Record<Field, string> = {
  name: "Please add your name.",
  email: "That email doesn't look right.",
  phone: "That phone number isn't valid. Outside Nepal? Start with your country code, like +1.",
  message: "Tell me a little about the project.",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidPhone = (phone: string) => isValidPhoneNumber(phone.trim(), DEFAULT_COUNTRY);

/** "+977 980 8005044" style, or the raw input if it can't be parsed. */
export const formatPhone = (phone: string) =>
  parsePhoneNumberFromString(phone.trim(), DEFAULT_COUNTRY)?.formatInternational() ?? phone.trim();

/** Fields that fail validation. WhatsApp enquiries don't need an email. */
export function invalidFields(e: Enquiry, { needEmail = true } = {}): Field[] {
  const bad: Field[] = [];
  if (!e.name.trim()) bad.push("name");
  if (needEmail ? !EMAIL.test(e.email.trim()) : e.email.trim() !== "" && !EMAIL.test(e.email.trim()))
    bad.push("email");
  if (!isValidPhone(e.phone)) bad.push("phone");
  if (e.message.trim().length < 10) bad.push("message");
  return bad;
}

/** Plain-text message body, used for both the email and WhatsApp. */
export function composeEnquiry(e: Enquiry, to: string) {
  return [
    `Hi ${to},`,
    "",
    e.message.trim(),
    "",
    e.needs.length ? `Looking for: ${e.needs.join(", ")}` : "",
    e.budget ? `Budget: ${e.budget}` : "",
    "",
    // Signature: skip whatever the visitor left empty
    ...[e.name.trim(), e.email.trim(), formatPhone(e.phone)].filter(Boolean),
  ]
    .filter((l, i, a) => l !== "" || a[i - 1] !== "")
    .join("\n")
    .trim();
}
