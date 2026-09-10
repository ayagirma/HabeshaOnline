/* ── Catalog + listing helpers ─────────────────────────────────────
   Ported from src/js/data.js and src/js/ui.js — same categories, same
   tiers, same price/date formatting. */

import { Bilingual } from "./samples";
import { Lang } from "./i18n";

export type Category = { key: string; ico: string; en: string; am: string };

export const CATS: Category[] = [
  { key: "housing", ico: "🏠", en: "Housing & Rentals", am: "ቤት እና ኪራይ" },
  { key: "sale", ico: "🏷️", en: "For Sale", am: "ለሽያጭ" },
  { key: "salon", ico: "💈", en: "Hair Salon & Barber", am: "ፀጉር ሳሎን" },
  { key: "beauty", ico: "💄", en: "Beauty & Skincare", am: "ውበት እና ቆዳ" },
  { key: "cars", ico: "🚗", en: "Cars & Rental", am: "መኪና እና ኪራይ" },
  { key: "food", ico: "☕", en: "Food & Coffee", am: "ምግብ እና ቡና" },
  { key: "services", ico: "🔧", en: "Services & Pros", am: "አገልግሎቶች" },
  { key: "jobs", ico: "💼", en: "Jobs", am: "ስራ" },
  { key: "events", ico: "🎟️", en: "Events", am: "ዝግጅቶች" },
  { key: "community", ico: "📰", en: "Community", am: "ማህበረሰብ" },
  { key: "promo", ico: "📣", en: "Ads & Promotions", am: "ማስታወቂያ" },
  { key: "other", ico: "🗂️", en: "Other", am: "ሌላ" },
];

/* A paid placement for an outside business/app/service — no price, no
   city, just a link. Not a classified listing, so it skips the fields
   that assume one (see PostForm/actions and the display components). */
export function isPromoCategory(cat: string): boolean {
  return cat === "promo";
}

export const CITIES = [
  "Denver, CO",
  "Aurora, CO",
  "Colorado Springs, CO",
  "Lakewood, CO",
  "Fort Collins, CO",
  "Boulder, CO",
  "Westminster, CO",
  "Thornton, CO",
];

export const UNITS = [
  { key: "total", en: "total", am: "ጠቅላላ" },
  { key: "mo", en: "per month", am: "በወር" },
  { key: "day", en: "per day", am: "በቀን" },
  { key: "hr", en: "per hour", am: "በሰዓት" },
  { key: "from", en: "starting at", am: "ጀምሮ" },
  { key: "quote", en: "call for quote", am: "ዋጋ ይጠይቁ" },
] as const;

export type Tier = {
  key: "free" | "standard" | "featured" | "premium";
  usd: number;
  days: number;
  photos: number;
  video: boolean;
  pop: boolean;
  name: Bilingual;
  feats: { ok: boolean; en: string; am: string }[];
};

export const TIERS: Tier[] = [
  {
    key: "free", usd: 0, days: 7, photos: 1, video: false, pop: false,
    name: { en: "Free", am: "ነፃ" },
    feats: [
      { ok: true, en: "1 photo", am: "1 ፎቶ" },
      { ok: false, en: "No video", am: "ቪዲዮ የለም" },
      { ok: true, en: "Runs 7 days", am: "ለ7 ቀናት ይቆያል" },
      { ok: true, en: "Standard placement", am: "መደበኛ ቦታ" },
    ],
  },
  {
    key: "standard", usd: 5, days: 30, photos: 5, video: false, pop: false,
    name: { en: "Standard", am: "መደበኛ" },
    feats: [
      { ok: true, en: "Up to 5 photos", am: "እስከ 5 ፎቶ" },
      { ok: false, en: "No video", am: "ቪዲዮ የለም" },
      { ok: true, en: "Runs 30 days", am: "ለ30 ቀናት ይቆያል" },
      { ok: true, en: "Higher in category", am: "በምድቡ ከፍ ያለ" },
    ],
  },
  {
    key: "featured", usd: 15, days: 30, photos: 8, video: true, pop: true,
    name: { en: "Featured", am: "ተለይቶ የቀረበ" },
    feats: [
      { ok: true, en: "Up to 8 photos", am: "እስከ 8 ፎቶ" },
      { ok: true, en: "One video clip", am: "አንድ ቪዲዮ" },
      { ok: true, en: "Runs 30 days", am: "ለ30 ቀናት ይቆያል" },
      { ok: true, en: "Woven band + top of category", am: "የጥልፍ ማሰሪያ + የምድቡ አናት" },
    ],
  },
  {
    key: "premium", usd: 30, days: 30, photos: 12, video: true, pop: false,
    name: { en: "Premium", am: "ፕሪሚየም" },
    feats: [
      { ok: true, en: "Up to 12 photos", am: "እስከ 12 ፎቶ" },
      { ok: true, en: "Two video clips", am: "ሁለት ቪዲዮ" },
      { ok: true, en: "Runs 30 days", am: "ለ30 ቀናት ይቆያል" },
      { ok: true, en: "Front page + pinned", am: "የመነሻ ገጽ + ተሰክቷል" },
    ],
  },
];

export function catFor(key: string): Category {
  return CATS.find((c) => c.key === key) || CATS[CATS.length - 1];
}
export function tierFor(key: string): Tier {
  return TIERS.find((t) => t.key === key) || TIERS[0];
}

export function money(n: number): string {
  return "$" + Number(n || 0).toLocaleString("en-US");
}

/* "$1,800/mo", "From $45", "Call for quote" — in either language. */
export function priceLabel(l: { price: number; unit: string }, lang: Lang): string {
  const am = lang === "am";
  if (l.unit === "quote" || (!l.price && l.unit !== "total")) {
    return am ? "ዋጋ ይጠይቁ" : "Call for quote";
  }
  const m = money(l.price);
  switch (l.unit) {
    case "mo": return am ? m + "/ወር" : m + "/mo";
    case "day": return am ? m + "/ቀን" : m + "/day";
    case "hr": return am ? m + "/ሰዓት" : m + "/hr";
    case "from": return am ? "ከ" + m + " ጀምሮ" : "From " + m;
    default: return m;
  }
}

/* "call for quote" sorts last. */
export function priceValue(l: { price: number; unit: string }): number {
  if (l.unit === "quote") return Number.MAX_SAFE_INTEGER;
  return Number(l.price) || 0;
}

/* Short relative age for cards: "2h", "5d", "3w". */
export function timeAgo(ms: number, lang: Lang): string {
  const s = Math.max(0, Date.now() - ms) / 1000;
  const am = lang === "am";
  if (s < 60) return am ? "አሁን" : "just now";
  if (s < 3600) return Math.floor(s / 60) + (am ? " ደቂቃ" : "m");
  if (s < 86400) return Math.floor(s / 3600) + (am ? " ሰዓት" : "h");
  if (s < 604800) return Math.floor(s / 86400) + (am ? " ቀን" : "d");
  if (s < 2592000) return Math.floor(s / 604800) + (am ? " ሳምንት" : "w");
  return Math.floor(s / 2592000) + (am ? " ወር" : "mo");
}

/* Unified shape a card can render, whether it came from Supabase (a real
   listing) or from samples.ts (fictional, client-only, never written to
   the database). */
export type ListingLike = {
  id: string;
  cat: string;
  tier: string;
  art?: string;
  ico?: string;
  video?: boolean;
  thumb?: string | null;
  title: Bilingual;
  desc: Bilingual;
  price: number;
  unit: string;
  place: string;
  seller: string;
  createdAt: number;
  sample?: boolean;
  status?: string;
  linkUrl?: string | null;
};

export function artFor(l: ListingLike): string {
  return l.art || "g-stone";
}
