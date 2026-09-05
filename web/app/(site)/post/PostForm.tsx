"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n-context";
import { CATS, CITIES, TIERS, UNITS, catFor, money, tierFor, type ListingLike } from "@/lib/listing";
import { PAY, payConfigured } from "@/lib/pay";
import { Card } from "@/app/Card";
import { createListing } from "./actions";
import { PhotoPicker, type PhotoState } from "./PhotoPicker";

const PAID_PLANS = payConfigured();

export function PostForm({ sellerName }: { sellerName: string }) {
  const { t, tt } = useLang();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const [now] = useState(() => Date.now());

  const [cat, setCat] = useState("sale");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("total");
  const [place, setPlace] = useState(CITIES[0]);
  const [tier, setTier] = useState("free");
  const [agree, setAgree] = useState(false);
  const [photos, setPhotos] = useState<PhotoState>({ paths: [], coverUrl: null, pending: false });

  const photoMax = tierFor(tier).photos;
  const tooManyPhotos = photos.paths.length > photoMax;
  const chosenTier = tierFor(tier);
  const tierChoices = PAID_PLANS ? TIERS : TIERS.filter((tr) => tr.usd === 0);

  const preview: ListingLike = useMemo(
    () => ({
      id: "preview",
      cat,
      tier,
      title: { en: title || t("post.titlePh"), am: title || t("post.titlePh") },
      desc: { en: desc, am: desc },
      price: unit === "quote" ? 0 : Number(price) || 0,
      unit,
      place,
      seller: sellerName,
      createdAt: now,
      ico: catFor(cat).ico,
      thumb: photos.coverUrl,
    }),
    [cat, tier, title, desc, price, unit, place, sellerName, now, t, photos.coverUrl],
  );

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createListing(formData);
      if ("error" in result) setError(t(result.error));
      else setDone(true);
    });
  }

  if (done) {
    const paid = chosenTier.usd > 0;
    return (
      <div className="panel" style={{ maxWidth: 520, margin: "0 auto" }}>
        {paid ? (
          <div className="pay-box">
            <h3>{t("pay.title")}</h3>
            <p>
              {t("pay.body", {
                plan: tt(chosenTier.name),
                amount: money(chosenTier.usd),
              })}
            </p>
            <div className="pay-methods">
              <div>
                <span className="pay-label">{t("pay.cashapp")}</span>
                <span className="pay-handle">{PAY.cashapp}</span>
              </div>
              <div>
                <span className="pay-label">{t("pay.zelle")}</span>
                <span className="pay-handle">{PAY.zelle}</span>
              </div>
            </div>
            <p className="hint">{t("pay.matchNote")}</p>
          </div>
        ) : (
          <p className="note note-ok">{t("post.pendingReview")}</p>
        )}
        <Link className="btn btn-accent" href="/" style={{ marginTop: 12, display: "inline-block" }}>
          {t("nav.browse")}
        </Link>
      </div>
    );
  }

  return (
    <form className="post-wrap" action={handleSubmit}>
      <div className="form-stack">
        <section className="form-sec">
          <h3>{t("post.sec1")}</h3>
          <div className="field">
            <span className="lbl">{t("post.cat")}</span>
            <div className="chips">
              {CATS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className="pick"
                  aria-pressed={cat === c.key}
                  onClick={() => setCat(c.key)}
                >
                  {c.ico} {tt(c)}
                </button>
              ))}
            </div>
          </div>
          <input type="hidden" name="category" value={cat} />

          <div className="field">
            <label htmlFor="title">{t("post.adTitle")}</label>
            <input
              id="title"
              name="title"
              maxLength={90}
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("post.titlePh")}
            />
          </div>
          <div className="field">
            <label htmlFor="desc">{t("post.desc")}</label>
            <textarea
              id="desc"
              name="desc"
              maxLength={1200}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={t("post.descPh")}
            />
          </div>
        </section>

        <section className="form-sec">
          <h3>{t("post.sec2")}</h3>
          <PhotoPicker max={photoMax} onChange={setPhotos} />
          {tooManyPhotos && (
            <p className="note note-warn">
              {t("post.photoHint", { n: String(photoMax) })}
            </p>
          )}
        </section>

        <section className="form-sec">
          <h3>{t("post.sec3")}</h3>
          <div className="row2">
            <div className="field">
              <label htmlFor="price">{t("post.price")}</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={t("post.pricePh")}
                disabled={unit === "quote"}
              />
            </div>
            <div className="field">
              <label htmlFor="unit">{t("post.priceUnit")}</label>
              <select id="unit" name="unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
                {UNITS.map((u) => (
                  <option key={u.key} value={u.key}>
                    {tt(u)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="place">{t("post.city")}</label>
            <select id="place" name="place" value={place} onChange={(e) => setPlace(e.target.value)}>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="form-sec">
          <h3>{t("post.sec5")}</h3>
          <div className="chips">
            {tierChoices.map((tr) => (
              <button
                key={tr.key}
                type="button"
                className="pick"
                aria-pressed={tier === tr.key}
                onClick={() => setTier(tr.key)}
              >
                {tt(tr.name)} · {tr.usd ? money(tr.usd) : "$0"}
              </button>
            ))}
          </div>
          <input type="hidden" name="tier" value={tier} />
          <input type="hidden" name="photos" value={JSON.stringify(photos.paths)} />
          {chosenTier.usd > 0 && (
            <p className="note note-warn" style={{ marginTop: 10 }}>
              {t("post.planPaid")}
            </p>
          )}
          <p className="hint" style={{ marginTop: 10 }}>
            {t("pricing.note")}
          </p>
        </section>

        <div className="field">
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontWeight: 400, cursor: "pointer" }}>
            <input
              type="checkbox"
              name="agree"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              style={{ marginTop: 3, width: "auto" }}
            />
            <span>{t("post.agree")}</span>
          </label>
        </div>

        {error && <p className="note note-bad">{error}</p>}

        <button
          className="btn btn-accent btn-lg"
          type="submit"
          disabled={pending || photos.pending}
        >
          {pending || photos.pending ? t("common.saving") : t("post.publish")}
        </button>
      </div>

      <aside className="preview-card">
        <span className="lbl">{t("post.preview")}</span>
        <div>
          <Card listing={preview} />
        </div>
      </aside>
    </form>
  );
}
