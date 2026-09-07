/* Transactional email the app sends itself, via Resend's REST API.

   Auth emails (verification codes, password resets) do NOT go through
   here — those are sent by Supabase over its own SMTP (also Resend).
   This is for everything else, currently just the inquiry reminder.

   RESEND_API_KEY is a server-only secret (no NEXT_PUBLIC_). */

const FROM = "HabeshaOnline <noreply@habesha-online.com>";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not set");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html }),
  });

  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
}
