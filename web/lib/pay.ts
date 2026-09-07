/* Paid plans are settled by hand over Cash App or Zelle — there's no
   payment processor wired in. These are the handles a seller sends the
   fee to; an admin confirms it landed and flips the listing live.

   Set the real values in .env.local (and in Vercel's env). They're
   shown to sellers, so NEXT_PUBLIC_ is fine. */

export const PAY = {
  cashapp: process.env.NEXT_PUBLIC_PAY_CASHAPP || "$HabeshaOnline",
  zelle: process.env.NEXT_PUBLIC_PAY_ZELLE || "pay@habesha-online.com",
};

export function payConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_PAY_CASHAPP || process.env.NEXT_PUBLIC_PAY_ZELLE);
}

/* A short code the seller puts in the Cash App / Zelle note, so an admin
   can match "$5 landed from someone" to one exact listing in the
   Awaiting-payment queue. Derived from the listing id — no extra column,
   and it's stable for the life of the listing. */
export function payCode(listingId: string): string {
  return "HO-" + listingId.replace(/-/g, "").slice(0, 6).toUpperCase();
}
