"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const HANDLE_RE = /^[a-z0-9][a-z0-9._-]{2,23}$/;

type ActionResult = { ok: true } | { error: string };

export async function signUp(formData: FormData): Promise<ActionResult> {
  // People naturally type a handle the way it's shown everywhere else in
  // the app — with a leading "@", Instagram/TikTok-style. Strip it rather
  // than reject it; the stored handle never includes it.
  const handle = String(formData.get("handle") || "")
    .trim()
    .toLowerCase()
    .replace(/^@+/, "");
  const display_name = String(formData.get("display_name") || "").trim() || handle;
  const contact_method = String(formData.get("contact_method") || "phone");
  const contact_value = String(formData.get("contact_value") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const password2 = String(formData.get("password2") || "");

  if (!HANDLE_RE.test(handle)) return { error: "auth.badHandle" };
  if (password.length < 6) return { error: "auth.shortPw" };
  if (password !== password2) return { error: "auth.mismatch" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { handle, display_name, contact_method, contact_value } },
  });

  if (error) {
    // Two different things can collide here: the email (Supabase's own
    // check) or the handle (profiles.handle unique constraint, hit inside
    // the handle_new_user() trigger, which Supabase reports as a generic
    // "Database error saving new user"). Both read as "taken" to a user.
    if (/already registered|already exists|Database error saving new user/i.test(error.message)) {
      return { error: "auth.taken" };
    }
    return { error: error.message };
  }

  return { ok: true };
}

/* Confirms a new signup with the 6-digit code from the "Confirm signup"
   email template's {{ .Token }} — not the link. A successful call also
   establishes the session (same as signing in), so the account screen
   just needs a reload afterward. */
export async function verifyOtp(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") || "").trim();
  const token = String(formData.get("token") || "").trim();

  if (!/^\d{6,10}$/.test(token)) return { error: "auth.badCode" };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "signup" });
  if (error) return { error: "auth.badCode" };

  return { ok: true };
}

export async function resendCode(email: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function signIn(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "auth.badCreds" };

  // Supabase Auth and our own profiles.is_active are separate systems —
  // a blocked user's password still works against Supabase Auth itself,
  // so the block has to be enforced here, not assumed.
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", data.user.id)
    .single();

  if (profile && !profile.is_active) {
    await supabase.auth.signOut();
    return { error: "auth.blocked" };
  }

  return { ok: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/you");
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "auth.badCreds" };

  const display_name = String(formData.get("display_name") || "").trim();
  const contact_method = String(formData.get("contact_method") || "phone");
  const contact_value = String(formData.get("contact_value") || "").trim();
  const show_contact = formData.get("show_contact") === "on";

  if (!display_name) return { error: "auth.badHandle" };

  // role / is_active are held by the guard trigger — safe to send the
  // whole patch; only these columns actually change.
  const { error } = await supabase
    .from("profiles")
    .update({ display_name, contact_method, contact_value: contact_value || null, show_contact })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { ok: true };
}

export async function deleteListing(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("listings").delete().eq("id", id);
  redirect("/you");
}

/* Sends the "Reset Password" email — a 6-digit code when that template
   uses {{ .Token }}. Always reports ok, even for an unregistered email,
   so the form can't be used to probe which addresses have accounts. */
export async function requestPasswordReset(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") || "").trim();
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email);
  return { ok: true };
}

/* Verifies the recovery code (which also opens a short-lived session),
   then sets the new password on that session. */
export async function resetPassword(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") || "").trim();
  const token = String(formData.get("token") || "").trim();
  const password = String(formData.get("password") || "");
  const password2 = String(formData.get("password2") || "");

  if (!/^\d{6,10}$/.test(token)) return { error: "auth.badCode" };
  if (password.length < 6) return { error: "auth.shortPw" };
  if (password !== password2) return { error: "auth.mismatch" };

  const supabase = await createClient();
  const { error: otpError } = await supabase.auth.verifyOtp({ email, token, type: "recovery" });
  if (otpError) return { error: "auth.badCode" };

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) return { error: updateError.message };

  return { ok: true };
}
