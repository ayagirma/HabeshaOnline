import { createClient } from "@/lib/supabase/server";
import { SAMPLES } from "@/lib/samples";
import type { ListingLike } from "@/lib/listing";
import { photoUrl } from "@/lib/photo";
import { HomeClient } from "./HomeClient";

type PhotoRow = { storage_path: string; sort_order: number };

type ListingRow = {
  id: string;
  category: string;
  title_en: string;
  title_am: string | null;
  desc_en: string | null;
  desc_am: string | null;
  price: number;
  unit: string;
  place: string;
  tier: string;
  created_at: string;
  profiles: { display_name: string } | { display_name: string }[] | null;
  listing_photos: PhotoRow[] | null;
};

function sellerName(row: ListingRow): string {
  const p = row.profiles;
  if (!p) return "";
  return Array.isArray(p) ? p[0]?.display_name || "" : p.display_name;
}

function coverUrl(row: ListingRow): string | null {
  const photos = row.listing_photos;
  if (!photos || !photos.length) return null;
  const first = [...photos].sort((a, b) => a.sort_order - b.sort_order)[0];
  return photoUrl(first.storage_path);
}

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    isAdmin = me?.role === "admin";
  }

  const { data } = await supabase
    .from("listings")
    .select(
      "id, category, title_en, title_am, desc_en, desc_am, price, unit, place, tier, created_at, profiles(display_name), listing_photos(storage_path, sort_order)",
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(300);

  const real: ListingLike[] = (data as ListingRow[] | null || []).map((row) => ({
    id: row.id,
    cat: row.category,
    tier: row.tier,
    title: { en: row.title_en, am: row.title_am || row.title_en },
    desc: { en: row.desc_en || "", am: row.desc_am || row.desc_en || "" },
    price: Number(row.price),
    unit: row.unit,
    place: row.place,
    seller: sellerName(row),
    createdAt: new Date(row.created_at).getTime(),
    thumb: coverUrl(row),
  }));

  const samples: ListingLike[] = SAMPLES.map((s) => ({ ...s, sample: true }));

  // Samples first-class alongside real records, newest first — same
  // rule as the original store.listings().
  const listings = [...real, ...samples].sort((a, b) => b.createdAt - a.createdAt);

  return <HomeClient listings={listings} isAdmin={isAdmin} />;
}
