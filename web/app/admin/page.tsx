import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { photoUrl } from "@/lib/photo";
import { Logo } from "@/app/Logo";
import { isPromoCategory, money, tierFor } from "@/lib/listing";
import { PAY, payCode } from "@/lib/pay";
import {
  approveListing,
  blockUser,
  markPaid,
  markPaidAndApprove,
  removeListingAndResolve,
  resolveReport,
  suspendListing,
  unblockUser,
} from "./actions";

type Profile = { handle: string; display_name: string } | { handle: string; display_name: string }[] | null;
function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? v[0] ?? null : v;
}

type PendingListing = {
  id: string;
  title_en: string;
  category: string;
  price: number;
  tier: string;
  payment_status: string;
  link_url: string | null;
  created_at: string;
  profiles: Profile;
  listing_photos: { storage_path: string; sort_order: number }[] | null;
};

type ReportRow = {
  id: string;
  listing_id: string;
  reason: string;
  created_at: string;
  profiles: Profile;
  listings: { title_en: string; status: string } | { title_en: string; status: string }[] | null;
};

type UserRow = {
  id: string;
  handle: string;
  display_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

type OverdueRow = {
  id: string;
  from_name: string;
  created_at: string;
  listing_id: string;
  listings: { title_en: string } | { title_en: string }[] | null;
};

const OVERDUE_DAYS = 4;

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/you");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/you");

  // Server Component — runs once per request; the purity rule targets
  // client re-renders, not this.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const overdueBefore = new Date(now - OVERDUE_DAYS * 86_400_000).toISOString();
  const weekAgo = new Date(now - 7 * 86_400_000).toISOString();

  const [
    pendingRes,
    reportsRes,
    usersRes,
    overdueRes,
    activeRes,
    inqRes,
    wListingsRes,
    wUsersRes,
    wInqRes,
  ] = await Promise.all([
    supabase
      .from("listings")
      .select(
        "id, title_en, category, price, tier, payment_status, link_url, created_at, profiles(handle, display_name), listing_photos(storage_path, sort_order)",
      )
      .eq("status", "pending_review")
      .order("created_at", { ascending: false }),
    supabase
      .from("reports")
      .select("id, listing_id, reason, created_at, profiles(handle, display_name), listings(title_en, status)")
      .eq("status", "open")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, handle, display_name, role, is_active, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("inquiries")
      .select("id, from_name, created_at, listing_id, listings!inner(title_en, status)")
      .eq("status", "open")
      .lt("created_at", overdueBefore)
      .eq("listings.status", "active")
      .order("created_at", { ascending: true }),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("inquiries").select("status"),
    supabase.from("listings").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("inquiries").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
  ]);

  const allPending = (pendingRes.data as PendingListing[] | null) || [];
  const awaitingPayment = allPending.filter((l) => l.payment_status === "pending");
  const pending = allPending.filter((l) => l.payment_status !== "pending");
  const reports = (reportsRes.data as ReportRow[] | null) || [];
  const users = (usersRes.data as UserRow[] | null) || [];
  const overdue = (overdueRes.data as OverdueRow[] | null) || [];

  const activeCount = activeRes.count ?? 0;
  const blockedCount = users.filter((u) => !u.is_active).length;

  const inqStatuses = (inqRes.data as { status: string }[] | null) || [];
  const answered = inqStatuses.filter((i) => i.status === "answered").length;
  const openInq = inqStatuses.filter((i) => i.status === "open").length;
  const respBase = answered + openInq;
  const responseRate = respBase > 0 ? Math.round((answered / respBase) * 100) : null;
  const rateClass =
    responseRate === null ? "" : responseRate >= 80 ? "good" : responseRate >= 50 ? "attn" : "alarm";

  const tiles: { label: string; value: string; sub?: string; cls?: string }[] = [
    { label: "Pending review", value: String(pending.length), cls: pending.length ? "attn" : "" },
    {
      label: "Awaiting payment",
      value: String(awaitingPayment.length),
      cls: awaitingPayment.length ? "attn" : "",
    },
    { label: "Open reports", value: String(reports.length), cls: reports.length ? "attn" : "" },
    { label: "Overdue replies", value: String(overdue.length), cls: overdue.length ? "alarm" : "" },
    { label: "Blocked users", value: String(blockedCount) },
    { label: "Active listings", value: String(activeCount) },
    {
      label: "Seller response rate",
      value: responseRate === null ? "—" : `${responseRate}%`,
      sub: responseRate === null ? "no inquiries yet" : `${answered} answered · ${openInq} waiting`,
      cls: rateClass,
    },
    { label: "Open inquiries", value: String(openInq), sub: "awaiting a seller" },
    { label: "Members", value: String(users.length) },
  ];

  return (
    <>
      <header className="topbar">
        <div className="topbar-in">
          <Link className="brand" href="/">
            <Logo />
            <span className="brand-name">
              Habesha<em>Online</em> · Admin
            </span>
          </Link>
          <nav className="nav" style={{ marginLeft: "auto" }}>
            <Link href="/">← Back to site</Link>
            <Link href="/you">Account</Link>
          </nav>
        </div>
        <div className="tibeb" aria-hidden="true" />
      </header>

      <main id="main">
        <div className="block-head">
          <h2>System health</h2>
        </div>
        <p className="health-week">
          Last 7 days: <b>{wListingsRes.count ?? 0}</b> new listings ·{" "}
          <b>{wUsersRes.count ?? 0}</b> new members · <b>{wInqRes.count ?? 0}</b> inquiries
        </p>
        <div className="health-grid">
          {tiles.map((tile) => (
            <div className={`tile${tile.cls ? " " + tile.cls : ""}`} key={tile.label}>
              <span className="tile-label">{tile.label}</span>
              <span className="tile-num">{tile.value}</span>
              {tile.sub && <span className="tile-sub">{tile.sub}</span>}
            </div>
          ))}
        </div>

        <div className="band-rule" aria-hidden="true" />

        <div className="block-head">
          <h2>Overdue replies</h2>
          <p className="block-sub">
            Active listings with a buyer message unanswered for {OVERDUE_DAYS}+ days. The seller
            was told 3 business days — take it down if they&rsquo;ve gone quiet.
          </p>
        </div>
        {overdue.length === 0 ? (
          <div className="empty">
            <p>Everyone&rsquo;s keeping up. Nothing overdue.</p>
          </div>
        ) : (
          <div className="msg-list">
            {overdue.map((q) => {
              const listing = one(q.listings);
              const waiting = Math.floor((now - new Date(q.created_at).getTime()) / 86_400_000);
              return (
                <article className="msg unread" key={q.id}>
                  <div className="msg-head">
                    <span className="msg-from">{listing?.title_en ?? "—"}</span>
                    <span className="msg-on">{waiting} days waiting</span>
                  </div>
                  <p className="msg-contact">Buyer: {q.from_name}, since {new Date(q.created_at).toLocaleDateString()}</p>
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <form action={suspendListing.bind(null, q.listing_id)}>
                      <button className="btn btn-ghost" type="submit">
                        Take listing down
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="band-rule" aria-hidden="true" />

        <div className="block-head">
          <h2>Awaiting payment</h2>
          <p className="block-sub">
            Paid plans send the fee by Cash App ({PAY.cashapp}) or Zelle ({PAY.zelle}). Each seller
            is told to put a code like <span className="pay-code">HO-XXXXXX</span> in the payment
            note — match that to the row below, then mark it paid to put the ad live.
          </p>
        </div>
        {awaitingPayment.length === 0 ? (
          <div className="empty">
            <p>No unpaid plans waiting.</p>
          </div>
        ) : (
          <div className="msg-list">
            {awaitingPayment.map((l) => {
              const seller = one(l.profiles);
              const shots = (l.listing_photos ?? [])
                .slice()
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((p) => photoUrl(p.storage_path));
              const owed = tierFor(l.tier).usd;
              return (
                <article className="msg unread" key={l.id}>
                  <div className="msg-head">
                    <span className="msg-from">{l.title_en}</span>
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
                    {tierFor(l.tier).name.en} plan — <strong>{money(owed)} owed</strong> · look for
                    note <span className="pay-code">{payCode(l.id)}</span>
                  </p>
                  {l.link_url && (
                    <p className="msg-body">
                      Links to:{" "}
                      <a href={l.link_url} target="_blank" rel="noopener noreferrer">
                        {l.link_url}
                      </a>
                    </p>
                  )}
                  <p className="msg-contact">
                    Seller: @{seller?.handle} ({seller?.display_name})
                  </p>
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <form action={markPaidAndApprove.bind(null, l.id)}>
                      <button className="btn btn-accent" type="submit">
                        Mark paid &amp; approve
                      </button>
                    </form>
                    <form action={markPaid.bind(null, l.id)}>
                      <button className="btn btn-ghost" type="submit">
                        Mark paid only
                      </button>
                    </form>
                    <form action={suspendListing.bind(null, l.id)}>
                      <button className="link-btn" type="submit">
                        Reject
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="band-rule" aria-hidden="true" />

        <div className="block-head">
          <h2>Pending listings</h2>
          <p className="block-sub">New listings wait here until approved — that&rsquo;s the real gate, not the honor system.</p>
        </div>
        {pending.length === 0 ? (
          <div className="empty">
            <p>Nothing pending review.</p>
          </div>
        ) : (
          <div className="msg-list">
            {pending.map((l) => {
              const seller = one(l.profiles);
              const shots = (l.listing_photos ?? [])
                .slice()
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((p) => photoUrl(p.storage_path));
              return (
                <article className="msg unread" key={l.id}>
                  <div className="msg-head">
                    <span className="msg-from">{l.title_en}</span>
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
                    {l.category}
                    {!isPromoCategory(l.category) && <> · ${l.price}</>} · {tierFor(l.tier).name.en} plan{" "}
                    {l.payment_status === "paid" && l.tier !== "free" && (
                      <span className="badge badge-live">paid</span>
                    )}
                  </p>
                  {isPromoCategory(l.category) && l.link_url && (
                    <p className="msg-body">
                      Links to:{" "}
                      <a href={l.link_url} target="_blank" rel="noopener noreferrer">
                        {l.link_url}
                      </a>
                    </p>
                  )}
                  <p className="msg-contact">
                    Seller: @{seller?.handle} ({seller?.display_name})
                  </p>
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <form action={approveListing.bind(null, l.id)}>
                      <button className="btn btn-accent" type="submit">
                        Approve
                      </button>
                    </form>
                    <form action={suspendListing.bind(null, l.id)}>
                      <button className="btn btn-ghost" type="submit">
                        Reject
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="band-rule" aria-hidden="true" />

        <div className="block-head">
          <h2>Reports</h2>
          <p className="block-sub">Listings flagged by buyers.</p>
        </div>
        {reports.length === 0 ? (
          <div className="empty">
            <p>Nothing reported. Good sign.</p>
          </div>
        ) : (
          <div className="msg-list">
            {reports.map((r) => {
              const reporter = one(r.profiles);
              const listing = one(r.listings);
              return (
                <article className="msg unread" key={r.id}>
                  <div className="msg-head">
                    <span className="msg-from">{r.reason}</span>
                    <span className="msg-on">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="msg-body">{listing?.title_en || "(listing already gone)"}</p>
                  <p className="msg-contact">Reported by: @{reporter?.handle}</p>
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    {listing && (
                      <form action={removeListingAndResolve.bind(null, r.listing_id, r.id)}>
                        <button className="btn btn-ghost" type="submit">
                          Remove listing
                        </button>
                      </form>
                    )}
                    <form action={resolveReport.bind(null, r.id)}>
                      <button className="link-btn" type="submit">
                        Dismiss
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="band-rule" aria-hidden="true" />

        <div className="block-head">
          <h2>Users</h2>
          <p className="block-sub">{users.length} accounts.</p>
        </div>
        <div className="mine-list">
          {users.map((u) => (
            <div
              key={u.id}
              className="mine-row"
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--line)" }}
            >
              <span className="avatar">{u.display_name.slice(0, 2).toUpperCase()}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>
                  {u.display_name} <span style={{ color: "var(--muted)", fontWeight: 400 }}>@{u.handle}</span>
                  {u.role === "admin" && <span className="badge badge-plan"> admin</span>}
                  {!u.is_active && <span className="chip chip-sample"> blocked</span>}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
                  Joined {new Date(u.created_at).toLocaleDateString()}
                </div>
              </div>
              {u.id !== user.id &&
                (u.is_active ? (
                  <form action={blockUser.bind(null, u.id)}>
                    <button className="btn btn-ghost" type="submit">
                      Block
                    </button>
                  </form>
                ) : (
                  <form action={unblockUser.bind(null, u.id)}>
                    <button className="btn btn-accent" type="submit">
                      Unblock
                    </button>
                  </form>
                ))}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
