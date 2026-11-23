import { site } from "@/content/site";
import { composeEnquiry, formatPhone, invalidFields, type Enquiry } from "@/lib/enquiry";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

// Per IP: 3 enquiries per 10 minutes, 10 per day
const LIMITS = [
  { max: 3, windowMs: 10 * 60_000 },
  { max: 10, windowMs: 24 * 60 * 60_000 },
];

/**
 * Contact form → email, via Resend (https://resend.com).
 *
 * Needs RESEND_API_KEY in .env.local (and in your host's environment settings).
 * With Resend's free plan and no verified domain, mail is sent from
 * onboarding@resend.dev and can only go to the address you signed up with,
 * so sign up with the address in CONTACT_TO (defaults to site.email).
 */

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(request: Request) {
  const { rateLimited, retryAfterSeconds } = checkRateLimit(`contact:${clientIp(request)}`, LIMITS);
  if (rateLimited) {
    return Response.json(
      { error: "rate-limited", retryAfter: retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad-request" }, { status: 400 });
  }

  // Bots fill the hidden "company" field: pretend it worked
  if (str(body.company, 200)) return Response.json({ ok: true });

  const enquiry: Enquiry = {
    // No line breaks in anything that ends up in the subject
    name: str(body.name, 100).replace(/[\r\n]+/g, " "),
    email: str(body.email, 200),
    phone: str(body.phone, 40),
    message: str(body.message, 5000),
    needs: Array.isArray(body.needs) ? body.needs.filter((n) => site.contact.needs.includes(n)) : [],
    budget: site.contact.budgets.includes(body.budget as string) ? (body.budget as string) : null,
  };
  const bad = invalidFields(enquiry);
  if (bad.length) return Response.json({ error: "invalid", fields: bad }, { status: 422 });

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("[contact] RESEND_API_KEY is not set, so the enquiry was not sent");
    return Response.json({ error: "not-configured" }, { status: 503 });
  }

  const text = composeEnquiry(enquiry, site.firstName);
  const rows: [string, string][] = [
    ["Name", enquiry.name],
    ["Email", enquiry.email],
    ["Phone", formatPhone(enquiry.phone)],
    ["Looking for", enquiry.needs.join(", ") || "—"],
    ["Budget", enquiry.budget ?? "—"],
  ];
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#111">
<h2 style="margin:0 0 16px">New project enquiry</h2>
<table cellpadding="6" style="border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="color:#666">${k}</td><td><strong>${escape(v)}</strong></td></tr>`)
    .join("")}</table>
<p style="white-space:pre-wrap;margin:20px 0 0">${escape(enquiry.message)}</p>
</div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || `${site.firstName}'s portfolio <onboarding@resend.dev>`,
      to: [process.env.CONTACT_TO || site.email],
      // "Reply" in your inbox goes straight to the visitor
      reply_to: enquiry.email,
      subject: `Project enquiry from ${enquiry.name}`,
      text,
      html,
    }),
  });
  if (!res.ok) {
    console.error("[contact] Resend error", res.status, await res.text());
    return Response.json({ error: "send-failed" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
