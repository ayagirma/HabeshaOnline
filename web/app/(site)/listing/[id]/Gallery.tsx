"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n-context";

/* Main shot + thumbnail strip. Uses the .gallery / .shot / .thumbs
   styles already in screens.css. Rendered only when a listing has
   photos — the emoji placeholder shot lives in page.tsx. */
export function Gallery({ photos, title }: { photos: string[]; title: string }) {
  const { t } = useLang();
  const [active, setActive] = useState(0);
  const current = photos[active] ?? photos[0];

  return (
    <div className="gallery">
      <div className="shot">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current} alt={title} />
      </div>
      {photos.length > 1 && (
        <div className="thumbs">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-current={i === active}
              aria-label={`${t("card.photo")} ${i + 1}`}
              onClick={() => setActive(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
