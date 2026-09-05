import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PostForm } from "./PostForm";

/* "Post an ad": needs a signed-in account with a confirmed email. New
   listings land at pending_review — an admin approves them from /admin
   before they go on the board. */
export default async function PostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main id="main">
        <div className="auth-wrap">
          <div className="panel">
            <h2>Sign in to post an ad</h2>
            <p className="block-sub" style={{ marginTop: 8 }}>
              An account keeps your listings together and lets buyers write to you.
            </p>
            <Link className="btn btn-accent btn-wide btn-lg" href="/you" style={{ marginTop: 16 }}>
              Sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!user.email_confirmed_at) {
    return (
      <main id="main">
        <div className="auth-wrap">
          <div className="panel">
            <p className="note note-warn">
              Confirm your email before posting — check the inbox for {user.email}.
            </p>
            <Link className="btn btn-ghost" href="/you" style={{ marginTop: 12, display: "inline-block" }}>
              Your account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, is_active")
    .eq("id", user.id)
    .single();

  if (profile && !profile.is_active) {
    return (
      <main id="main">
        <div className="auth-wrap">
          <div className="panel">
            <p className="note note-bad">This account is blocked and can&rsquo;t post.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main">
      <div className="block-head">
        <h2>Post an ad</h2>
        <p className="block-sub">
          It goes live once an admin approves it — usually quick.
        </p>
      </div>
      <PostForm sellerName={profile?.display_name || ""} />
    </main>
  );
}
