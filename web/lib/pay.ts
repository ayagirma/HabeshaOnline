/* Paid plans are settled by hand over Cash App or Zelle — there's no
   payment processor wired in. These are the handles a seller sends the
   fee to; an admin confirms it landed and flips the listing live.

   Set the real values in .env.local (and in Vercel's env). They're
   shown to sellers, so NEXT_PUBLIC_ is fine. */

export const PAY = {
  cashapp: process.env.NEXT_PUBLIC_PAY_CASHAPP || "$HabeshaOnline",
  zelle: process.env.NEXT_PUBLIC_PAY_ZELLE || "pay@habeshaonline.com",
};

export function payConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_PAY_CASHAPP || process.env.NEXT_PUBLIC_PAY_ZELLE);
}
