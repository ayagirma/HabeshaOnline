import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { catFor, isPromoCategory, money, priceLabel, tierFor } from "@/lib/listing";
import { photoUrl } from "@/lib/photo";
import { PAY, payCode } from "@/lib/pay";
import { AuthForm } from "./AuthForm";
import { ProfileForm } from "./ProfileForm";
import { signOutAction, deleteListing } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  pending_review: "Awaiting approval",
  active: "Live",
  suspended: "Suspended",
  expired: "Expired",
  removed: "Removed",
};

type MyListing = {
  id: string;
  category: string;
  title_en: string;
  price: number;
  unit: string;
  tier: string;
  status: string;
  payment_status: string;
  created_at: string;
  listing_photos: { storage_path: string; sort_order: number }[] | null;
};

export default async function YouPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main id="main">
        <div className="block-head center">
          <h2>Your account</h2>
        </div>
        <AuthForm />
      </main>
    );
  }

  const [{ data: profile }, { data: listingRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("handle, display_name, role, contact_method, contact_value, show_contact")
      .eq("id", user.id)
      .single(),
    supabase
      .from("listings")
      .select(
        "id, category, title_en, price, unit, tier, status, payment_status, created_at, listing_photos(storage_path, sort_order)",
      )
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const mine = (listingRows as MyListing[] | null) || [];
  const initials = (profile?.display_name || user.email || "?")
    .trim()
    .split(/\s+/)
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const verified = !!user.email_confirmed_at;

  return (
    <main id="main">
      <div className="you-head">
        <span className="avatar">{initials}</span>
        <div>
          <div className="you-name">{profile?.display_name}</div>
          <div className="you-sub">
            @{profile?.handle}
            {profile?.role === "admin" ? " · admin" : ""}
          </div>
        </div>
        <div className="you-actions">
          <Link className="btn btn-accent" href="/post">
            Post an ad
          </Link>
          <Link className="btn btn-ghost" href="/inbox">
            Inbox
          </Link>
          <Link className="btn btn-ghost" href="/">
            Browse
          </Link>
          <form action={signOutAction}>
            <button className="btn btn-ghost" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </div>

      {profile?.role === "admin" && (
        <div className="panel" style={{ marginTop: 20 }}>
          <p style={{ marginBottom: 8 }}>You&rsquo;re an admin.</p>
          <Link className="btn btn-accent" href="/admin">
            Open the admin panel
          </Link>
        </div>
      )}

      <div className="panel" style={{ marginTop: 20 }}>
        <p className={verified ? "note note-ok" : "note note-warn"}>
          {verified
            ? "Email confirmed."
            : `Email not confirmed yet — check the inbox for ${user.email}. Posting an ad needs a confirmed email.`}
        </p>
      </div>

      <div className="block-head" style={{ marginTop: 28 }}>
        <h2>Your listings</h2>
        <span className="count">{mine.length}</span>
      </div>
      {mine.length === 0 ? (
        <div className="empty">
          <p>You haven&rsquo;t posted anything yet.</p>
          <Link className="btn btn-accent" href="/post">
            Post your first ad
          </Link>
        </div>
      ) : (
        <div className="msg-list">
          {mine.map((l) => {
            const shots = (l.listing_photos ?? [])
              .slice()
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((p) => photoUrl(p.storage_path));
            return (
            <article className="msg" key={l.id}>
              <div className="msg-head">
                <span className="msg-from">
                  <Link className="link-btn" href={`/listing/${l.id}`}>
                    {l.title_en}
                  </Link>
                </span>
                <span className="msg-on">{new Date(l.created_at).toLocaleDateString()}</span>
              </div>
              {shots.length > 0 && (
                <div className="review-shots">
                  {shots.map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={src} src={src} alt="" />
                  ))}
                </div>
              )}
              <p className="msg-body">
                {catFor(l.category).en}
                {!isPromoCategory(l.category) && <> · {priceLabel(l, "en")}</>}{" "}
                <span
                  className={`badge ${
                    l.status === "active"
                      ? "badge-live"
                      : l.payment_status === "pending"
                        ? "badge-expired"
                        : "badge-draft"
                  }`}
                  style={{ marginLeft: 8 }}
                >
                  {l.payment_status === "pending"
                    ? "Awaiting payment"
                    : (STATUS_LABEL[l.status] ?? l.status)}
                </span>
              </p>
              {l.payment_status === "pending" && (
                <p className="msg-contact">
                  Send {money(tierFor(l.tier).usd)} by Cash App ({PAY.cashapp}) or Zelle ({PAY.zelle}),
                  with note <span className="pay-code">{payCode(l.id)}</span>. Goes live once we
                  confirm it.
                </p>
              )}
              <form action={deleteListing.bind(null, l.id)}>
                <button className="link-btn" type="submit" style={{ color: "var(--bad)" }}>
                  Delete
                </button>
              </form>
            </article>
            );
          })}
        </div>
      )}

      <div className="band-rule" aria-hidden="true" />

      <div className="block-head">
        <h2>Contact &amp; visibility</h2>
      </div>
      <ProfileForm
        displayName={profile?.display_name ?? ""}
        contactMethod={profile?.contact_method ?? "phone"}
        contactValue={profile?.contact_value ?? ""}
        showContact={profile?.show_contact ?? false}
      />
    </main>
  );
}
