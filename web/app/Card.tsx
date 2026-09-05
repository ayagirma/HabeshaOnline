"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n-context";
import { artFor, catFor, priceLabel, timeAgo, type ListingLike } from "@/lib/listing";

const SAVED_KEY = "ho.saved.v1";

function readSaved(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
  } catch {
    return [];
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}
function getServerSnapshot() {
  return false;
}

/* Ported from ui.js's HO.cardHtml. Bookmarking stays purely client-side
   (localStorage) — it's a per-device convenience, same as the original,
   not something that needs a Supabase table. useSyncExternalStore reads
   it the same way the language context does — see i18n-context.tsx for
   why, and why toggleSave dispatches a manual "storage" event. */
export function Card({ listing }: { listing: ListingLike }) {
  const { lang, t, tt } = useLang();
  const featured = listing.tier === "featured" || listing.tier === "premium";
  const savedOn = useSyncExternalStore(
    subscribe,
    () => readSaved().includes(listing.id),
    getServerSnapshot,
  );

  function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const list = readSaved();
    const i = list.indexOf(listing.id);
    if (i === -1) list.push(listing.id);
    else list.splice(i, 1);
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(list));
    } catch {
      /* storage unavailable — bookmark just won't persist */
    }
    window.dispatchEvent(new Event("storage"));
  }

  return (
    <article className={`card${featured ? " is-featured" : ""}`}>
      <Link className="card-open" href={`/listing/${listing.id}`} aria-label={tt(listing.title)}>
        <div className={`thumb ${artFor(listing)}`}>
          {listing.thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.thumb} alt="" loading="lazy" />
          ) : (
            <span aria-hidden="true">{listing.ico || "🗂️"}</span>
          )}
          {featured && <span className="chip chip-featured">★ {t("card.featured")}</span>}
          {listing.sample && <span className="chip chip-sample">{t("card.sample")}</span>}
          {listing.video && <span className="chip chip-video">▶ {t("card.video")}</span>}
        </div>
        <div className="card-body">
          <div className="card-cat">{tt(catFor(listing.cat))}</div>
          <h3 className="card-title">{tt(listing.title)}</h3>
          <div className="card-meta">
            <span className="price">{priceLabel(listing, lang)}</span>
            <span className="place">{listing.place}</span>
          </div>
          <div className="card-foot">
            <span>{listing.seller}</span>
            <span>{timeAgo(listing.createdAt, lang)}</span>
          </div>
        </div>
      </Link>
      <button
        className={`save${savedOn ? " on" : ""}`}
        onClick={toggleSave}
        aria-pressed={savedOn}
        title={t(savedOn ? "card.unsave" : "card.save")}
        aria-label={t(savedOn ? "card.unsave" : "card.save")}
      >
        {savedOn ? "♥" : "♡"}
      </button>
    </article>
  );
}
