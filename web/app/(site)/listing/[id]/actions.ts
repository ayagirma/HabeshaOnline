"use server";

import { createClient } from "@/lib/supabase/server";

type Result = { ok: true } | { error: string };

/* Anyone can send — no account needed. seller_id and status are set by
   the set_inquiry_seller trigger (which also rejects a non-active
   listing), so nothing here is trusted from the form beyond the text. */
export async function sendInquiry(listingId: string, formData: FormData): Promise<Result> {
  const from_name = String(formData.get("from_name") || "").trim();
  const contact = String(formData.get("contact") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (!from_name || !contact || !body) return { error: "ask.incomplete" };

  const supabase = await createClient();
  // seller_id is left out — the set_inquiry_seller trigger fills it in
  // (and rejects the insert if the listing isn't active).
  const { error } = await supabase.from("inquiries").insert({
    listing_id: listingId,
    from_name,
    contact,
    body,
  });

  if (error) return { error: error.message };
  return { ok: true };
}
