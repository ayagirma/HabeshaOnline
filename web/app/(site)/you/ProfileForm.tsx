"use client";

import { useState, useTransition } from "react";
import { useLang } from "@/lib/i18n-context";
import { updateProfile } from "./actions";

export function ProfileForm({
  displayName,
  contactMethod,
  contactValue,
  showContact,
}: {
  displayName: string;
  contactMethod: string;
  contactValue: string;
  showContact: boolean;
}) {
  const { t } = useLang();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if ("error" in result) setError(t(result.error));
      else setSaved(true);
    });
  }

  return (
    <form className="panel" action={handleSubmit} style={{ display: "grid", gap: 16 }}>
      <div className="field">
        <label htmlFor="display_name">{t("auth.display")}</label>
        <input id="display_name" name="display_name" defaultValue={displayName} maxLength={40} required />
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor="contact_method">{t("post.method")}</label>
          <select id="contact_method" name="contact_method" defaultValue={contactMethod}>
            <option value="phone">{t("common.phone")}</option>
            <option value="email">{t("common.email")}</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="contact_value">{t("auth.contact")}</label>
          <input id="contact_value" name="contact_value" defaultValue={contactValue} maxLength={80} />
        </div>
      </div>
      <div className="field">
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontWeight: 400, cursor: "pointer" }}>
          <input type="checkbox" name="show_contact" defaultChecked={showContact} style={{ marginTop: 3, width: "auto" }} />
          <span>
            Show my phone/email on my listings, behind a &ldquo;Show contact&rdquo; button. Off by
            default &mdash; buyers can always reach you through the message form either way.
          </span>
        </label>
      </div>
      {error && <p className="note note-bad">{error}</p>}
      {saved && <p className="note note-ok">{t("post.updated")}</p>}
      <button className="btn btn-ink" type="submit" disabled={pending} style={{ justifySelf: "start" }}>
        {pending ? t("common.saving") : t("common.save")}
      </button>
    </form>
  );
}
