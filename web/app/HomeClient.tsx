"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLang } from "@/lib/i18n-context";
import { CATS, TIERS, catFor, money, priceValue, type ListingLike } from "@/lib/listing";
import { Card } from "./Card";
import { Logo } from "./Logo";

/* The Browse screen — ported from src/js/screens/browse.js. Filtering,
   search and sort all happen client-side over the listings the server
   already fetched (samples + whatever's really in Supabase), same as
   the original: no round-trip per keystroke. */
export function HomeClient({
  listings,
  isAdmin,
}: {
  listings: ListingLike[];
  isAdmin?: boolean;
}) {
  const { lang, setLang, t, tt } = useLang();
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"new" | "low" | "high">("new");

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const l of listings) c[l.cat] = (c[l.cat] || 0) + 1;
    return c;
  }, [listings]);

  const cities = useMemo(() => new Set(listings.map((l) => l.place)).size, [listings]);

  const featured = useMemo(
    () => listings.filter((l) => l.tier === "featured" || l.tier === "premium").slice(0, 4),
    [listings],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    return listings.filter((l) => {
      if (filterCat && l.cat !== filterCat) return false;
      if (!words.length) return true;
      const hay = [tt(l.title), tt(l.desc), l.place, l.seller, tt(catFor(l.cat))]
        .join(" ")
        .toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [listings, filterCat, search, tt]);

  const sorted = useMemo(() => {
    const out = filtered.slice();
    if (sort === "low") out.sort((a, b) => priceValue(a) - priceValue(b));
    if (sort === "high") out.sort((a, b) => priceValue(b) - priceValue(a));
    return out;
  }, [filtered, sort]);

  const filtering = !!filterCat || !!search.trim();
  const recentTitle = filterCat ? tt(catFor(filterCat)) : t("browse.recent");

  return (
    <>
      <a className="skip" href="#main">
        Skip to listings
      </a>

      <header className="topbar">
        <div className="topbar-in">
          <button className="brand" aria-label="HabeshaOnline home">
            <Logo />
            <span className="brand-name">
              Habesha<em>Online</em>
            </span>
          </button>
          <nav className="nav" aria-label="Main" />
          <div className="topbar-right">
            <div className="lang" role="group" aria-label="Language">
              <button className={`lang-btn${lang === "en" ? " on" : ""}`} onClick={() => setLang("en")}>
                EN
              </button>
              <button className={`lang-btn${lang === "am" ? " on" : ""}`} onClick={() => setLang("am")}>
                አማ
              </button>
            </div>
            <Link className="btn btn-accent btn-post" href="/post">
              {t("nav.post")}
            </Link>
          </div>
        </div>
        <div className="tibeb" aria-hidden="true" />
      </header>

      <main id="main">
        <div className="hero">
          <div className="hero-main">
            <div className="hero-copy">
              <p className="eyebrow">{t("hero.eyebrow")}</p>
              <h1>{t("hero.title")}</h1>
              <p className="lede">{t("hero.lede")}</p>
              <p className="note note-warn" style={{ marginTop: 16, maxWidth: "58ch" }}>
                {t("hero.telegram")}
              </p>
              <form
                className="searchbar"
                onSubmit={(e) => e.preventDefault()}
                style={{ marginTop: 20 }}
              >
                <span className="search-ico" aria-hidden="true">
                  ⌕
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("search.placeholder")}
                  aria-label="Search listings"
                />
                <button type="submit" className="btn btn-accent">
                  {t("search.go")}
                </button>
              </form>
              <div className="stat-strip">
                <span>
                  <b>{listings.length}</b> {t("stat.listings")}
                </span>
                <span>
                  <b>{CATS.length}</b> {t("stat.cats")}
                </span>
                <span>
                  <b>{cities}</b> {t("stat.cities")}
                </span>
              </div>
            </div>
          </div>
          <aside className="hero-side">
            <div className="cap" aria-hidden="true" />
            <div className="in">
              <h3>{t("pricing.title")}</h3>
              <ul>
                {TIERS.map((tier) => (
                  <li key={tier.key}>
                    <span>{tt(tier.name)}</span>
                    <b>{tier.usd ? money(tier.usd) : "$0"}</b>
                  </li>
                ))}
              </ul>
              <p className="why">{t("pricing.sub")}</p>
              <Link className="btn btn-accent btn-wide" href="/post">
                {t("nav.post")}
              </Link>
            </div>
          </aside>
        </div>

        <div className="rail-wrap">
          <div className="rail" role="group" aria-label="Categories">
            {CATS.map((c) => (
              <button
                key={c.key}
                className={`cat${filterCat === c.key ? " on" : ""}`}
                aria-pressed={filterCat === c.key}
                onClick={() => setFilterCat(filterCat === c.key ? null : c.key)}
              >
                <span className="ico" aria-hidden="true">
                  {c.ico}
                </span>
                <span>{tt(c)}</span>
                <span className="n">{counts[c.key] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="band-rule" aria-hidden="true" />

        {featured.length > 0 && (
          <section className="block">
            <div className="block-head">
              <h2>{t("browse.featured")}</h2>
              <p className="block-sub">{t("browse.featuredSub")}</p>
            </div>
            <div className="grid">
              {featured.map((l) => (
                <Card key={l.id} listing={l} />
              ))}
            </div>
          </section>
        )}

        <section className="block">
          <div className="block-head">
            <h2>{recentTitle}</h2>
            <div className="block-tools">
              <span className="count">
                {sorted.length} {t("browse.results")}
              </span>
              <label className="sort">
                <span>{t("browse.sort")}</span>
                <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
                  <option value="new">{t("sort.new")}</option>
                  <option value="low">{t("sort.low")}</option>
                  <option value="high">{t("sort.high")}</option>
                </select>
              </label>
              {filtering && (
                <button
                  className="link-btn"
                  onClick={() => {
                    setFilterCat(null);
                    setSearch("");
                  }}
                >
                  {t("browse.clear")}
                </button>
              )}
            </div>
          </div>
          {sorted.length > 0 ? (
            <div className="grid">
              {sorted.map((l) => (
                <Card key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <p>{t("browse.emptyTitle")}</p>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setFilterCat(null);
                  setSearch("");
                }}
              >
                {t("browse.emptyCta")}
              </button>
            </div>
          )}
        </section>

        <div className="band-rule" aria-hidden="true" />

        <section className="block how">
          <div className="block-head">
            <h2>{t("how.title")}</h2>
          </div>
          <ol className="how-steps">
            {[1, 2, 3, 4].map((n) => (
              <li key={n}>
                <h3>{t(`how.${n}t`)}</h3>
                <p>{t(`how.${n}b`)}</p>
              </li>
            ))}
          </ol>
          <p className="note note-warn" style={{ marginTop: 16, maxWidth: "60ch" }}>
            {t("how.buyers")}
          </p>
        </section>
      </main>

      <footer className="foot">
        <div className="tibeb" aria-hidden="true" />
        <div className="foot-in">
          <div>
            <p className="foot-brand">HabeshaOnline</p>
            <p className="foot-note">{t("foot.note")}</p>
          </div>
          <div className="foot-links">
            <Link className="link-btn" href="/you">
              {t("nav.you")}
            </Link>
            <Link className="link-btn" href="/terms">
              {t("foot.terms")}
            </Link>
            <Link className="link-btn" href="/privacy">
              {t("foot.privacy")}
            </Link>
            {isAdmin && (
              <Link className="link-btn" href="/admin">
                {t("nav.moderation")}
              </Link>
            )}
          </div>
          <p className="foot-status">{t("foot.status")}</p>
        </div>
      </footer>
    </>
  );
}
