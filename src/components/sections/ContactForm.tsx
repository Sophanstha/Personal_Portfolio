"use client";

import { useId, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { site } from "@/content/site";
import { composeEnquiry, fieldErrors, invalidFields, type Enquiry, type Field } from "@/lib/enquiry";

/**
 * Enquiry form.
 * - "Send enquiry" posts to /api/contact, which emails it to you (via Resend).
 * - "WhatsApp instead" checks the phone number is a real one for its country,
 *   then opens WhatsApp with the message ready to send to your number.
 */
export function ContactForm() {
  const { contact } = site;
  const id = useId();
  const [needs, setNeeds] = useState<string[]>([]);
  const [budget, setBudget] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [invalid, setInvalid] = useState<Field[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const heading = useRef<HTMLHeadingElement>(null);

  const enquiry = (): Enquiry => ({ name, email, phone, message, needs, budget });

  const validate = (opts?: { needEmail: boolean }) => {
    const bad = invalidFields(enquiry(), opts);
    setInvalid(bad);
    if (bad.length) document.getElementById(`${id}-${bad[0]}`)?.focus();
    return bad.length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending" || !validate()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...enquiry(), company: honeypot }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      requestAnimationFrame(() => heading.current?.focus());
    } catch {
      setStatus("failed");
    }
  };

  // Opens the visitor's WhatsApp with the message addressed to you; they tap Send
  const sendWhatsApp = () => {
    if (!validate({ needEmail: false })) return;
    const text = composeEnquiry(enquiry(), site.firstName);
    window.open(`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  const toggleNeed = (n: string) => setNeeds((cur) => (cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n]));
  const fieldProps = (f: Field) =>
    invalid.includes(f) ? { "aria-invalid": true as const, "aria-describedby": `${id}-${f}-error` } : {};
  const fieldError = (f: Field) =>
    invalid.includes(f) && (
      <p id={`${id}-${f}-error`} className="contact-form__error">
        {fieldErrors[f]}
      </p>
    );

  return (
    <section className="contact-form">
      <div className="contact-form__grid">
        <div className="contact-form__intro" data-reveal="">
          <p className="contact-form__intro-text">{contact.intro}</p>
          <div className="contact-form__contact-label eyebrow">Email</div>
          <a href={`mailto:${site.email}`} className="contact-form__email" data-cursor="Email">
            {site.email}
          </a>
          <div className="contact-form__contact-label eyebrow">WhatsApp</div>
          <a
            href={`https://wa.me/${site.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="contact-form__email"
            data-cursor="Chat"
          >
            +{site.whatsapp.slice(0, 3)} {site.whatsapp.slice(3)}
          </a>
          <div className="contact-form__contact-label eyebrow">Based in</div>
          <div className="contact-form__based-in">{contact.basedIn}</div>
        </div>

        {status === "sent" ? (
          <div className="contact-form__success" data-reveal="">
            <div className="contact-form__diamond" />
            <h2 ref={heading} tabIndex={-1} className="contact-form__success-heading">
              {contact.success.replace("{name}", name.trim().split(" ")[0] || "friend")}
            </h2>
            <p className="contact-form__success-text">{contact.successText.replace("{email}", email.trim())}</p>
            <Button variant="link" className="contact-form__again eyebrow" onClick={() => setStatus("idle")}>
              ← Send another
            </Button>
          </div>
        ) : (
          <form className="contact-form__form" onSubmit={onSubmit} noValidate data-reveal="">
            <div>
              <div className="contact-form__label" id={`${id}-needs`}>
                {contact.needsLabel}
              </div>
              <div className="contact-form__chips" role="group" aria-labelledby={`${id}-needs`}>
                {contact.needs.map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={needs.includes(n)}
                    className={cn("contact-form__chip", needs.includes(n) && "contact-form__chip--selected")}
                    onClick={() => toggleNeed(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="contact-form__label" id={`${id}-budget`}>
                {contact.budgetLabel}
              </div>
              <div className="contact-form__chips" role="group" aria-labelledby={`${id}-budget`}>
                {contact.budgets.map((b) => (
                  <button
                    key={b}
                    type="button"
                    aria-pressed={budget === b}
                    className={cn("contact-form__chip", budget === b && "contact-form__chip--selected")}
                    onClick={() => setBudget(budget === b ? null : b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <label className="sr-only" htmlFor={`${id}-name`}>
              Your name
            </label>
            <input
              id={`${id}-name`}
              className="contact-form__field"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              {...fieldProps("name")}
            />
            {fieldError("name")}

            <label className="sr-only" htmlFor={`${id}-email`}>
              Email address
            </label>
            <input
              id={`${id}-email`}
              className="contact-form__field"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              {...fieldProps("email")}
            />
            {fieldError("email")}

            <label className="sr-only" htmlFor={`${id}-phone`}>
              Phone number
            </label>
            <input
              id={`${id}-phone`}
              className="contact-form__field"
              type="tel"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              placeholder="Phone / WhatsApp number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              {...fieldProps("phone")}
            />
            {fieldError("phone")}

            <label className="sr-only" htmlFor={`${id}-message`}>
              What are you making?
            </label>
            <textarea
              id={`${id}-message`}
              className="contact-form__field contact-form__field--message"
              name="message"
              rows={4}
              placeholder="What are you making?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              {...fieldProps("message")}
            />
            {fieldError("message")}

            {/* Honeypot: hidden from people, filled by bots */}
            <input
              type="text"
              name="company"
              className="sr-only"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />

            <div className="contact-form__actions">
              <Button
                type="submit"
                className="contact-form__submit"
                data-magnet=""
                data-cursor="Send"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sending…" : contact.submit} <FiArrowRight />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="contact-form__whatsapp"
                data-magnet=""
                data-cursor="Chat"
                onClick={sendWhatsApp}
              >
                <FaWhatsapp /> WhatsApp instead
              </Button>
            </div>
            {status === "failed" && (
              <p className="contact-form__error" role="alert">
                Sorry, that didn&apos;t send. Try WhatsApp instead, or email{" "}
                <a href={`mailto:${site.email}`}>{site.email}</a> directly.
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
