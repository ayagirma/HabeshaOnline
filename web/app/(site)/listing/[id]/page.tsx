import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SAMPLES } from "@/lib/samples";
import { catFor, priceLabel, type ListingLike } from "@/lib/listing";
import { photoUrl } from "@/lib/photo";
import { LangText } from "./LangText";
import { InquiryForm } from "./InquiryForm";
import { SellerContact } from "./SellerContact";
import { Gallery } from "./Gallery";
import { PostedDate } from "./PostedDate";

type Row = {
  id: string;
  status: string;
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
  seller_id: string;
  profiles:
    | { handle: string; display_name: string; show_contact: boolean; contact_method: string; contact_value: string | null }
    | null;
  listing_photos: { storage_path: string; sort_order: number }[] | null;
};

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("listings")
    .select(
      "id, status, category, title_en, title_am, desc_en, desc_am, price, unit, place, tier, created_at, seller_id, profiles(handle, display_name, show_contact, contact_method, contact_value), listing_photos(storage_path, sort_order)",
    )
    .eq("id", id)
    .maybeSingle<Row>();

  const sample = row ? null : SAMPLES.find((s) => s.id === id);
  if (!row && !sample) notFound();

  const cat = catFor(row?.category ?? sample!.cat);
  const listing: ListingLike = row
    ? {
        id: row.id,
        cat: row.category,
        tier: row.tier,
        title: { en: row.title_en, am: row.title_am || row.title_en },
        desc: { en: row.desc_en || "", am: row.desc_am || row.desc_en || "" },
        price: Number(row.price),
        unit: row.unit,
        place: row.place,
        seller: row.profiles?.display_name ?? "",
        createdAt: new Date(row.created_at).getTime(),
        status: row.status,
      }
    : { ...sample!, sample: true, status: "active" };

  const seller = row?.profiles ?? null;
  const photos = (row?.listing_photos ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => photoUrl(p.storage_path));
  return (
    <main id="main">
      <Link className="back" href="/">
        ← Back
      </Link>

      <div className="detail">
        <div>
          {photos.length > 0 ? (
            <Gallery photos={photos} title={listing.title.en} />
          ) : (
            <div className={`shot ${listing.art ?? "g-stone"}`}>
              <span aria-hidden="true">{listing.ico || cat.ico}</span>
            </div>
          )}
          <div className="detail-head">
            <div className="detail-title">
              <h1>
                <LangText en={listing.title.en} am={listing.title.am} />
              </h1>
              <span className="detail-price">
                <LangText en={priceLabel(listing, "en")} am={priceLabel(listing, "am")} />
              </span>
            </div>
            <div className="detail-meta">
              <span>
                <LangText en={cat.en} am={cat.am} />
              </span>
              <span className="dot">·</span>
              <span>📍 {listing.place}</span>
              <span className="dot">·</span>
              <PostedDate ms={listing.createdAt} />
            </div>
          </div>

          <h3 className="detail-body-h3">About this listing</h3>
          <p className="detail-desc">
            <LangText en={listing.desc.en} am={listing.desc.am} fallback="The seller didn't add a description." />
          </p>
        </div>

        <aside className="aside">
          {listing.sample ? (
            <div className="panel">
              <p className="note note-warn">
                This is a sample listing that ships with the site, not a real seller.
              </p>
            </div>
          ) : (
            <>
              <div className="panel">
                {seller && (
                  <div className="seller">
                    <span className="avatar">
                      {(seller.display_name || "?").slice(0, 2).toUpperCase()}
                    </span>
                    <span>
                      <span className="seller-name">{seller.display_name}</span>
                      <br />
                      <Link className="seller-sub" href={`/seller/${seller.handle}`}>
                        See all their listings
                      </Link>
                    </span>
                  </div>
                )}
                {seller?.show_contact && seller.contact_value ? (
                  <SellerContact method={seller.contact_method} value={seller.contact_value} />
                ) : null}
              </div>

              {listing.status === "active" ? (
                <InquiryForm listingId={listing.id} />
              ) : (
                <div className="panel">
                  <p className="note note-warn">
                    This listing isn&rsquo;t active — messages are closed.
                  </p>
                </div>
              )}
            </>
          )}

          <div className="panel">
            <h3>Staying safe</h3>
            <ul className="safety" style={{ marginTop: 10 }}>
              <li>Meet in a public place, in daylight.</li>
              <li>Look at the item before you pay.</li>
              <li>Never wire money or send gift cards to someone you haven&rsquo;t met.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
