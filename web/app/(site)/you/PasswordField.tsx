"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n-context";

type Props = {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  minLength?: number;
};

/* A password input with an eye toggle. `type` flips between password and
   text locally; the field name/value are unchanged so the form submits
   the same either way. */
export function PasswordField({ id, name, label, autoComplete, minLength }: Props) {
  const { t } = useLang();
  const [shown, setShown] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="pw-wrap">
        <input
          id={id}
          name={name}
          type={shown ? "text" : "password"}
          required
          minLength={minLength}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="pw-eye"
          onClick={() => setShown((s) => !s)}
          aria-label={t(shown ? "auth.hide" : "auth.show")}
          aria-pressed={shown}
          title={t(shown ? "auth.hide" : "auth.show")}
        >
          {shown ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 3l18 18" strokeLinecap="round" />
              <path d="M10.6 10.6a2 2 0 002.8 2.8" />
              <path d="M9.4 5.2A9.5 9.5 0 0112 5c5 0 9 4.5 9 7a12 12 0 01-2.4 3.2M6.3 6.3A12.4 12.4 0 003 12c0 2.5 4 7 9 7 1.4 0 2.7-.3 3.9-.9" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
