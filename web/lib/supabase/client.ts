import { createBrowserClient } from "@supabase/ssr";

/* For Client Components. Reads the two NEXT_PUBLIC_ values from
   .env.local — see .env.local.example. Safe to call repeatedly; each
   call is cheap, there's no connection to hold open. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
