"use client";

// Runs synchronously during HTML parsing (before first paint). See Next docs:
// "Preventing flash before hydration". It must be a Client Component: on the
// client it renders as inert text/plain, so React doesn't warn about a <script>.
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
