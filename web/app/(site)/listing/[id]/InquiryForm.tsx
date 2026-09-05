"use client";

import { useState, useTransition } from "react";
import { useLang } from "@/lib/i18n-context";
import { sendInquiry } from "./actions";

export function InquiryForm({ listingId }: { listingId: string }) {
  const { t } = useLang();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await sendInquiry(listingId, formData);
      if ("error" in result) {
        setError(t(result.error === "ask.incomplete" ? "ask.incomplete" : "ask.error"));
        return;
      }
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="panel">
        <h3>{t("ask.title")}</h3>
        <p className="note note-ok" style={{ marginTop: 12 }}>
          {t("ask.sent")}
        </p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h3>{t("ask.title")}</h3>
      <form action={handleSubmit} style={{ display: "grid", gap: 12, marginTop: 12 }}>
        <div className="field">
          <label htmlFor="from_name">{t("ask.name")}</label>
          <input id="from_name" name="from_name" required maxLength={60} autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="contact">{t("ask.contact")}</label>
          <input id="contact" name="contact" required maxLength={80} />
        </div>
        <div className="field">
          <label htmlFor="body">{t("ask.body")}</label>
          <textarea id="body" name="body" required maxLength={600} placeholder={t("ask.ph")} />
        </div>
        {error && <p className="note note-bad">{error}</p>}
        <button className="btn btn-ink" type="submit" disabled={pending}>
          {pending ? t("common.saving") : t("ask.send")}
        </button>
      </form>
    </div>
  );
}
