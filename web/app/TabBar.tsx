"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/i18n-context";

/* Bottom tab bar — phones only (the .tabbar CSS hides it above 860px).
   Ported from the original static app's tab bar, minus Saved (that
   screen isn't built yet). Hidden on /admin, which is desktop-only. */
const TABS = [
  { href: "/", icon: "⌂", key: "nav.browse" },
  { href: "/post", icon: "+", key: "nav.postShort", post: true },
  { href: "/inbox", icon: "✉", key: "nav.inbox" },
  { href: "/you", icon: "☺", key: "nav.you" },
];

export function TabBar() {
  const pathname = usePathname();
  const { t } = useLang();

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="tabbar" aria-label="Sections" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
      {TABS.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`tab${tab.post ? " tab-post" : ""}${active ? " on" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span aria-hidden="true">{tab.icon}</span>
            <span>{t(tab.key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
