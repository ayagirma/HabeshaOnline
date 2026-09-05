import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/* For Server Components, Server Actions, and Route Handlers. `cookies()`
   is async in Next 16, so this is too. A Server Component can't write
   cookies (Next throws if you try) — that's fine, the proxy below
   refreshes the session on every request, so a Server Component only
   ever needs to read it. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render — ignorable because
            // proxy.ts refreshes the session cookie on every request.
          }
        },
      },
    },
  );
}
