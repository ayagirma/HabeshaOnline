import { createClient } from "@supabase/supabase-js";

/* ⚠️  Service-role client — BYPASSES Row Level Security entirely.

   Server-only. The one legitimate use in this app is the reminder cron
   (app/api/cron/inquiry-reminders), which runs with no user session and
   must read auth.users for seller emails. That route checks CRON_SECRET
   before it touches this.

   Never import this from a Client Component, a Server Component that
   renders for users, or any route that isn't behind its own secret. If
   you're reaching for it elsewhere, you almost certainly want
   lib/supabase/server.ts (runs as the caller) instead. */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("createAdminClient: SUPABASE_SERVICE_ROLE_KEY / URL not set");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
