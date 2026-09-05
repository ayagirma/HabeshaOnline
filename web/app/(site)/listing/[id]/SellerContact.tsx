"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n-context";

/* Only rendered when the seller opted in (show_contact). One click to
   reveal — a speed bump, not real protection, since the value is on the
   page once shown; the seller chose to publish it. */
export function SellerContact({ method, value }: { method: string; value: string }) {
  const { t } = useLang();
  const [shown, setShown] = useState(false);

  if (!shown) {
    return (
      <button className="btn btn-accent btn-wide" style={{ marginTop: 12 }} onClick={() => setShown(true)}>
        {t("detail.contact")}
      </button>
    );
  }

  const href = method === "email" ? `mailto:${value}` : `tel:${value.replace(/[^0-9+]/g, "")}`;
  return (
    <a className="contact-out" href={href} style={{ marginTop: 12, display: "inline-block" }}>
      {value}
    </a>
  );
}
