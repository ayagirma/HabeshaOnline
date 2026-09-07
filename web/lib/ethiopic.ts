/* ── Ethiopian calendar ────────────────────────────────────────────
   Ported from src/js/ethiopic.js, logic unchanged. Conversion goes
   through the Julian Day Number, exact for every date this app shows.
   The Ethiopian year is twelve 30-day months plus Pagume, a short
   thirteenth month of 5 days (6 before a leap year).

   Pure functions — but toEthiopic reads a Date in *local* time, so call
   these from a Client Component (the viewer's clock), not the server. */

import { Lang } from "./i18n";

const JDN_EPOCH = 1723856; // 1 Meskerem 1 EC, Amete Mihret

const MONTHS_EN = [
  "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit",
  "Megabit", "Miazia", "Ginbot", "Sene", "Hamle", "Nehase", "Pagume",
];
const MONTHS_AM = [
  "መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት",
  "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ",
];

function mod(a: number, b: number): number {
  return ((a % b) + b) % b;
}

function gregorianToJDN(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  );
}

function jdnToEthiopic(jdn: number): { y: number; m: number; d: number } {
  const r = mod(jdn - JDN_EPOCH, 1461);
  const n = mod(r, 365) + 365 * Math.floor(r / 1460);
  return {
    y: 4 * Math.floor((jdn - JDN_EPOCH) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460),
    m: Math.floor(n / 30) + 1,
    d: mod(n, 30) + 1,
  };
}

export function toEthiopic(date: Date): { y: number; m: number; d: number } {
  return jdnToEthiopic(gregorianToJDN(date.getFullYear(), date.getMonth() + 1, date.getDate()));
}

export function ethiopicLabel(date: Date, lang: Lang): string {
  const e = toEthiopic(date);
  const names = lang === "am" ? MONTHS_AM : MONTHS_EN;
  return `${names[e.m - 1]} ${e.d}, ${e.y}`;
}

/* "Nehase 30, 2018 · Sep 5, 2026" — both calendars, one line. */
export function bothDates(ms: number, lang: Lang): string {
  const d = new Date(ms);
  const greg = d.toLocaleDateString(lang === "am" ? "am-ET" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${ethiopicLabel(d, lang)} · ${greg}`;
}
