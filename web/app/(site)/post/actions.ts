"use server";

import { createClient } from "@/lib/supabase/server";
import { CATS, CITIES, TIERS, UNITS, tierFor } from "@/lib/listing";
import { payCode } from "@/lib/pay";

type Result = { ok: true; ref?: string } | { error: string };

const DAY = 86_400_000;
const MAX_PER_DAY = 5;

/* The client uploaded each photo to `${user.id}/<uuid>.jpg` before
   calling this. Keep only well-formed paths under the caller's own
   prefix, then cap to what the chosen plan allows. */
function cleanPhotoPaths(raw: unknown, userId: string, cap: number): string[] {
  let list: unknown;
  try {
    list = JSON.parse(String(raw || "[]"));
  } catch {
    return [];
  }
  if (!Array.isArray(list)) return [];
  const prefix = `${userId}/`;
  const seen = new Set<string>();
  const ok: string[] = [];
  for (const p of list) {
    if (typeof p !== "string") continue;
    if (!p.startsWith(prefix) || p.includes("..") || !/\.(jpe?g|png|webp)$/i.test(p)) continue;
    if (seen.has(p)) continue;
    seen.add(p);
    ok.push(p);
    if (ok.length >= cap) break;
  }
  return ok;
}

const CAT_KEYS = new Set<string>(CATS.map((c) => c.key));
const UNIT_KEYS = new Set<string>(UNITS.map((u) => u.key));
const TIER_KEYS = new Set<string>(TIERS.map((t) => t.key));
const CITY_SET = new Set<string>(CITIES);

/* Creates a listing at pending_review (the guard trigger forces that
   status regardless of what's sent, and stamps seller_id to the caller).
   A confirmed email and staying under the daily cap are checked here. */
export async function createListing(formData: FormData): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "post.needAuth" };
  if (!user.email_confirmed_at) return { error: "post.needVerified" };

  const title = String(formData.get("title") || "").trim();
  const desc = String(formData.get("desc") || "").trim();
  const category = String(formData.get("category") || "");
  const unit = String(formData.get("unit") || "total");
  const tier = String(formData.get("tier") || "free");
  const place = String(formData.get("place") || "");
  const priceRaw = String(formData.get("price") || "").trim();
  const agree = formData.get("agree") === "on";

  if (!title) return { error: "post.errTitle" };
  if (!CAT_KEYS.has(category)) return { error: "post.errTitle" };
  if (!UNIT_KEYS.has(unit)) return { error: "post.errPrice" };
  if (!TIER_KEYS.has(tier)) return { error: "post.errTitle" };
  if (!CITY_SET.has(place)) return { error: "post.errTitle" };
  if (!agree) return { error: "post.errAgree" };

  const price = unit === "quote" ? 0 : Number(priceRaw);
  if (unit !== "quote" && !(price > 0)) return { error: "post.errPrice" };

  // Daily cap — count this seller's listings created in the last 24h.
  const since = new Date(Date.now() - DAY).toISOString();
  const { count } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", user.id)
    .gte("created_at", since);
  if ((count ?? 0) >= MAX_PER_DAY) return { error: "post.rateLimited" };

  const days = TIERS.find((t) => t.key === tier)?.days ?? 7;
  const photos = cleanPhotoPaths(formData.get("photos"), user.id, tierFor(tier).photos);

  const { data: created, error } = await supabase
    .from("listings")
    .insert({
      seller_id: user.id, // guard trigger enforces this anyway
      category,
      title_en: title,
      title_am: title, // one field, stored for both — matches the original
      desc_en: desc || null,
      desc_am: desc || null,
      price,
      unit,
      place,
      tier,
      expires_at: new Date(Date.now() + days * DAY).toISOString(),
    })
    .select("id")
    .single();

  if (error || !created) return { error: error?.message || "post.errTitle" };

  if (photos.length) {
    const { error: photoErr } = await supabase.from("listing_photos").insert(
      photos.map((storage_path, sort_order) => ({
        listing_id: created.id,
        storage_path,
        sort_order,
      })),
    );
    // The listing is already in — a photo-row hiccup shouldn't sink the
    // whole post. It lands for review either way; the seller can't yet
    // edit, but an admin sees it.
    if (photoErr) console.error("listing_photos insert failed:", photoErr.message);
  }

  // Paid plan → hand back the reference code the seller puts in the
  // Cash App / Zelle note so an admin can match the transfer.
  return tierFor(tier).usd > 0 ? { ok: true, ref: payCode(created.id) } : { ok: true };
}
