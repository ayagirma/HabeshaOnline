import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

/* Daily cron (see web/vercel.json). Emails a seller once when a buyer's
   inquiry has gone ~2 days unanswered — a nudge before the posted
   3-business-day rule runs out and an admin takes the listing down.

   Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Any
   other caller without that header is rejected, so it's safe that the
   path is public.

   Manual testing (with the header):
     ?dry=1        — report who would be emailed, send nothing
     ?hours=0      — ignore the 2-day cutoff (catch every open inquiry) */

export const dynamic = "force-dynamic";

type DueRow = {
  inquiry_id: string;
  seller_id: string;
  seller_email: string | null;
  seller_name: string | null;
  listing_id: string;
  listing_title: string;
  buyer_name: string;
  created_at: string;
};

const SITE = "https://habesha-online.com";
const RESPOND_RULE = "3 business days";

function daysAgo(iso: string): number {
  return Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

function buildEmail(rows: DueRow[]): { subject: string; html: string } {
  const name = rows[0].seller_name || "there";
  const many = rows.length > 1;
  const subject = many
    ? `${rows.length} buyers are waiting to hear from you`
    : `${rows[0].buyer_name} is waiting to hear from you`;

  const items = rows
    .map(
      (r) =>
        `<li style="margin:0 0 8px"><strong>${escapeHtml(r.buyer_name)}</strong> asked about ` +
        `“${escapeHtml(r.listing_title)}” ${daysAgo(r.created_at)} days ago.</li>`,
    )
    .join("");

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#1c211f;max-width:520px">
      <p>Hi ${escapeHtml(name)},</p>
      <p>${many ? "Some buyers messaged you on HabeshaOnline and haven’t heard back:" : "A buyer messaged you on HabeshaOnline and hasn’t heard back:"}</p>
      <ul style="padding-left:20px;margin:0 0 16px">${items}</ul>
      <p>Our rule is a reply within <strong>${RESPOND_RULE}</strong> — a yes, a no, or “sold” is enough.
      ${many ? "Listings" : "A listing"} left unanswered ${many ? "are" : "is"} taken down so buyers aren’t left waiting.</p>
      <p style="margin:20px 0">
        <a href="${SITE}/inbox" style="background:#c2410c;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;display:inline-block">Open your inbox</a>
      </p>
      <p style="color:#6b7280;font-size:13px">HabeshaOnline · ${SITE}</p>
    </div>`;

  return { subject, html };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const dry = url.searchParams.get("dry") === "1";
  const hoursParam = url.searchParams.get("hours");

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc(
    "get_due_inquiry_reminders",
    hoursParam !== null ? { older_than: `${Math.max(0, Number(hoursParam))} hours` } : {},
  );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as DueRow[];

  // One email per seller, listing all their waiting inquiries.
  const bySeller = new Map<string, DueRow[]>();
  for (const r of rows) {
    if (!r.seller_email) continue;
    const list = bySeller.get(r.seller_email);
    if (list) list.push(r);
    else bySeller.set(r.seller_email, [r]);
  }

  if (dry) {
    return NextResponse.json({
      dry: true,
      sellers: [...bySeller.entries()].map(([email, list]) => ({
        email,
        inquiries: list.map((r) => ({ listing: r.listing_title, buyer: r.buyer_name })),
      })),
    });
  }

  const remindedIds: string[] = [];
  let failed = 0;
  for (const [email, list] of bySeller) {
    try {
      const { subject, html } = buildEmail(list);
      await sendEmail({ to: email, subject, html });
      remindedIds.push(...list.map((r) => r.inquiry_id));
    } catch (e) {
      failed++;
      console.error("inquiry reminder failed for", email, e);
    }
  }

  if (remindedIds.length) {
    await supabase.rpc("mark_inquiries_reminded", { p_ids: remindedIds });
  }

  return NextResponse.json({
    sellers: bySeller.size,
    emailed: bySeller.size - failed,
    failed,
    inquiries: remindedIds.length,
  });
}
