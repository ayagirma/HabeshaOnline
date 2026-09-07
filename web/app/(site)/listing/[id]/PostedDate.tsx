"use client";

import { useSyncExternalStore } from "react";
import { useLang } from "@/lib/i18n-context";
import { bothDates } from "@/lib/ethiopic";

/* "Posted Nehase 30, 2018 · Sep 5, 2026" — the dual calendar.

   The Ethiopian conversion and the local calendar day both depend on the
   viewer's clock, so this only runs in the browser. Server (and the
   first hydration pass) render the Gregorian half fixed to UTC so the
   markup matches exactly; the full dual date swaps in once mounted. */
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function PostedDate({ ms }: { ms: number }) {
  const { lang } = useLang();
  const mounted = useMounted();

  const utcGreg = new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return <span>Posted {mounted ? bothDates(ms, lang) : utcGreg}</span>;
}
