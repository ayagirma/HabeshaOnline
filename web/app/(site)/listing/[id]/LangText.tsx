"use client";

import { useLang } from "@/lib/i18n-context";

/* Picks en / am by the current language. Lets a Server Component hand
   both strings down without pulling the whole page into a client
   component just to read the language. */
export function LangText({
  en,
  am,
  fallback,
}: {
  en?: string | null;
  am?: string | null;
  fallback?: string;
}) {
  const { lang } = useLang();
  const text = (lang === "am" ? am || en : en || am) || fallback || "";
  return <>{text}</>;
}
