"use client";

import { useState, useTransition } from "react";
import { useLang } from "@/lib/i18n-context";
import { PasswordField } from "./PasswordField";
import {
  requestPasswordReset,
  resendCode,
  resetPassword,
  signIn,
  signUp,
  verifyOtp,
} from "./actions";

type Screen = "form" | "verifySignup" | "forgotRequest" | "forgotReset";

export function AuthForm() {
  const { t } = useLang();
  const [screen, setScreen] = useState<Screen>("form");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Carried between screens (signup → verify, forgot-request → forgot-reset)
  // so the follow-up form knows which address to act on.
  const [flowEmail, setFlowEmail] = useState("");

  function reset() {
    setError(null);
    setNotice(null);
  }
  function goto(s: Screen) {
    reset();
    setScreen(s);
  }

  function handleAuth(formData: FormData) {
    reset();
    startTransition(async () => {
      const result = await (mode === "signup" ? signUp(formData) : signIn(formData));
      if ("error" in result) {
        setError(t(result.error));
        return;
      }
      if (mode === "signup") {
        setFlowEmail(String(formData.get("email") || "").trim());
        setScreen("verifySignup");
      } else {
        window.location.reload();
      }
    });
  }

  function handleVerify(formData: FormData) {
    reset();
    startTransition(async () => {
      const result = await verifyOtp(formData);
      if ("error" in result) setError(t(result.error));
      else window.location.reload();
    });
  }

  function handleResend() {
    if (!flowEmail) return;
    reset();
    startTransition(async () => {
      const result = await resendCode(flowEmail);
      if ("error" in result) setError(t(result.error));
      else setNotice(t("auth.resent"));
    });
  }

  function handleForgotRequest(formData: FormData) {
    reset();
    startTransition(async () => {
      await requestPasswordReset(formData);
      setFlowEmail(String(formData.get("email") || "").trim());
      setScreen("forgotReset");
    });
  }

  function handleReset(formData: FormData) {
    reset();
    startTransition(async () => {
      const result = await resetPassword(formData);
      if ("error" in result) setError(t(result.error));
      else window.location.reload();
    });
  }

  const codeField = (
    <div className="field">
      <label htmlFor="token">{t("auth.code")}</label>
      <input
        id="token"
        name="token"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={10}
        required
        autoComplete="one-time-code"
        autoFocus
      />
    </div>
  );

  if (screen === "verifySignup") {
    return (
      <div className="auth-wrap">
        <form className="panel" action={handleVerify} style={{ display: "grid", gap: 16 }}>
          <input type="hidden" name="email" value={flowEmail} />
          <p className="note note-ok">{t("auth.codeSent", { email: flowEmail })}</p>
          {codeField}
          {error && <p className="note note-bad">{error}</p>}
          {notice && <p className="note note-ok">{notice}</p>}
          <button className="btn btn-accent btn-wide btn-lg" type="submit" disabled={pending}>
            {pending ? t("auth.working") : t("auth.confirm")}
          </button>
          <button className="link-btn" type="button" style={{ justifySelf: "start" }} onClick={handleResend}>
            {t("auth.resend")}
          </button>
        </form>
      </div>
    );
  }

  if (screen === "forgotRequest") {
    return (
      <div className="auth-wrap">
        <form className="panel" action={handleForgotRequest} style={{ display: "grid", gap: 16 }}>
          <h3 style={{ margin: 0 }}>{t("auth.resetTitle")}</h3>
          <p className="hint">{t("auth.resetIntro")}</p>
          <div className="field">
            <label htmlFor="email">{t("auth.email")}</label>
            <input id="email" name="email" type="email" required autoComplete="email" autoFocus />
          </div>
          {error && <p className="note note-bad">{error}</p>}
          <button className="btn btn-accent btn-wide btn-lg" type="submit" disabled={pending}>
            {pending ? t("auth.working") : t("auth.sendCode")}
          </button>
          <button className="link-btn" type="button" style={{ justifySelf: "start" }} onClick={() => goto("form")}>
            {t("auth.backToSignin")}
          </button>
        </form>
      </div>
    );
  }

  if (screen === "forgotReset") {
    return (
      <div className="auth-wrap">
        <form className="panel" action={handleReset} style={{ display: "grid", gap: 16 }}>
          <input type="hidden" name="email" value={flowEmail} />
          <p className="note note-ok">{t("auth.resetSent")}</p>
          {codeField}
          <PasswordField
            id="password"
            name="password"
            label={t("auth.newPassword")}
            minLength={6}
            autoComplete="new-password"
          />
          <PasswordField
            id="password2"
            name="password2"
            label={t("auth.password2")}
            minLength={6}
            autoComplete="new-password"
          />
          {error && <p className="note note-bad">{error}</p>}
          <button className="btn btn-accent btn-wide btn-lg" type="submit" disabled={pending}>
            {pending ? t("auth.working") : t("common.save")}
          </button>
          <button className="link-btn" type="button" style={{ justifySelf: "start" }} onClick={() => goto("form")}>
            {t("auth.backToSignin")}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="auth-tabs">
        <button className="pick" type="button" aria-pressed={mode === "signin"} onClick={() => { reset(); setMode("signin"); }}>
          {t("auth.signin")}
        </button>
        <button className="pick" type="button" aria-pressed={mode === "signup"} onClick={() => { reset(); setMode("signup"); }}>
          {t("auth.signup")}
        </button>
      </div>

      <form className="panel" action={handleAuth} style={{ display: "grid", gap: 16 }}>
        {mode === "signup" && (
          <>
            <div className="field">
              <label htmlFor="handle">{t("auth.handle")}</label>
              <input
                id="handle"
                name="handle"
                required
                maxLength={24}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
              />
              <span className="hint">{t("auth.handleHint")}</span>
            </div>
            <div className="field">
              <label htmlFor="display_name">{t("auth.display")}</label>
              <input id="display_name" name="display_name" maxLength={40} autoComplete="nickname" />
            </div>
            <div className="row2">
              <div className="field">
                <label htmlFor="contact_method">{t("post.method")}</label>
                <select id="contact_method" name="contact_method" defaultValue="phone">
                  <option value="phone">{t("common.phone")}</option>
                  <option value="email">{t("common.email")}</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="contact_value">{t("auth.contact")}</label>
                <input id="contact_value" name="contact_value" maxLength={80} />
              </div>
            </div>
          </>
        )}

        <div className="field">
          <label htmlFor="email">{t("auth.email")}</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>

        <PasswordField
          id="password"
          name="password"
          label={t("auth.password")}
          minLength={6}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
        />

        {mode === "signup" && (
          <PasswordField
            id="password2"
            name="password2"
            label={t("auth.password2")}
            minLength={6}
            autoComplete="new-password"
          />
        )}

        {error && <p className="note note-bad">{error}</p>}
        {notice && <p className="note note-ok">{notice}</p>}

        <button className="btn btn-accent btn-wide btn-lg" type="submit" disabled={pending}>
          {pending ? t("auth.working") : t(mode === "signup" ? "auth.signup" : "auth.signin")}
        </button>

        {mode === "signin" && (
          <button className="link-btn" type="button" style={{ justifySelf: "start" }} onClick={() => goto("forgotRequest")}>
            {t("auth.forgot")}
          </button>
        )}
      </form>
    </div>
  );
}
