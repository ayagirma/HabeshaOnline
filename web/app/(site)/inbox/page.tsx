import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { markAnswered, markSpam } from "./actions";

const RESPOND_DAYS = 4; // "3 business days", counted simply

type Row = {
  id: string;
  from_name: string;
  contact: string;
  body: string;
  status: string;
  created_at: string;
  listing_id: string;
  listings: { title_en: string } | { title_en: string }[] | null;
};

function listingTitle(r: Row): string {
  const l = r.listings;
  if (!l) return "—";
  return Array.isArray(l) ? l[0]?.title_en || "—" : l.title_en;
}

export default async function InboxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main id="main">
        <div className="empty">
          <p>Sign in to read messages about your listings.</p>
          <Link className="btn btn-accent" href="/you">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  const { data } = await supabase
    .from("inquiries")
    .select("id, from_name, contact, body, status, created_at, listing_id, listings(title_en)")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (data as Row[] | null) || [];
  // Server Component — runs once per request, so reading the clock here
  // is fine (the purity rule is aimed at client re-renders).
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  return (
    <main id="main">
      <div className="block-head">
        <h2>Inquiries</h2>
        <p className="block-sub">
          Reply — yes, no, or sold — within 3 business days. Reach the buyer directly with
          what they left below, then mark it answered. Ads left unanswered come down.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="empty">
          <p>No messages yet. They arrive here when a buyer writes about one of your ads.</p>
        </div>
      ) : (
        <div className="msg-list">
          {rows.map((r) => {
            const created = new Date(r.created_at).getTime();
            const due = created + RESPOND_DAYS * 86_400_000;
            const open = r.status === "open";
            const overdue = open && now > due;
            const isEmail = r.contact.includes("@");
            const href = isEmail
              ? `mailto:${r.contact}`
              : `tel:${r.contact.replace(/[^0-9+]/g, "")}`;

            return (
              <article className={`msg${open ? " unread" : ""}`} key={r.id}>
                <div className="msg-head">
                  <span className="msg-from">
                    {r.from_name}
                    {r.status === "answered" && <span className="chip chip-sample"> answered</span>}
                    {r.status === "spam" && <span className="chip chip-sample"> spam</span>}
                  </span>
                  <span className="msg-on">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <p className="msg-body">{r.body}</p>
                <p className="msg-contact">
                  Reach them at: <a href={href}><b>{r.contact}</b></a>
                </p>
                <p className="msg-contact">
                  About:{" "}
                  <Link className="link-btn" href={`/listing/${r.listing_id}`}>
                    {listingTitle(r)}
                  </Link>
                </p>

                {open && (
                  <>
                    <p
                      className={overdue ? "note note-bad" : "note note-warn"}
                      style={{ marginTop: 8 }}
                    >
                      {overdue
                        ? "Overdue — reply now or this ad will be taken down."
                        : `Respond by ${new Date(due).toLocaleDateString()}`}
                    </p>
                    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                      <form action={markAnswered.bind(null, r.id)}>
                        <button className="btn btn-accent" type="submit">
                          Mark answered
                        </button>
                      </form>
                      <form action={markSpam.bind(null, r.id)}>
                        <button className="link-btn" type="submit">
                          Spam
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
