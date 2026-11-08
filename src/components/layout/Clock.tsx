"use client";

import { useSyncExternalStore } from "react";
import { site } from "@/content/site";

const format = () =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: site.timeZone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 20_000);
  return () => clearInterval(id);
};

/** Live HH:MM clock. Renders empty on the server so there's no hydration mismatch. */
export function Clock() {
  const time = useSyncExternalStore(subscribe, format, () => "");
  return <span suppressHydrationWarning>{time || "--:--"}</span>;
}
