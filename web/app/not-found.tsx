import Link from "next/link";

/* Root 404 — an unmatched route, or an explicit notFound() (e.g. a
   listing id that isn't real). Server Component so it renders fully on
   the server in both cases; kept English-only to stay dependency-free
   (the EN/AM dictionary is a client context). */
export const metadata = { title: "Not found — HabeshaOnline" };

export default function NotFound() {
  return (
    <main id="main" className="errpage">
      <span className="band" aria-hidden="true" />
      <span className="eyebrow">404</span>
      <h1>This page isn&rsquo;t here</h1>
      <p>
        The link might be old, or the listing was taken down. Everything that&rsquo;s live is one
        tap away.
      </p>
      <div className="acts">
        <Link className="btn btn-accent" href="/">
          Browse listings
        </Link>
        <Link className="btn btn-ghost" href="/post">
          Post an ad
        </Link>
      </div>
    </main>
  );
}
