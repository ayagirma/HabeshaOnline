"use client";

import { useEffect } from "react";
import Link from "next/link";

/* Catches a runtime error thrown while rendering any page below the root
   layout. Must be a Client Component (Next requirement). English-only to
   match not-found.tsx and avoid depending on the language context, which
   may be part of what failed. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="errpage">
      <span className="band" aria-hidden="true" />
      <span className="eyebrow">Something broke</span>
      <h1>That&rsquo;s on us, not you</h1>
      <p>
        The page ran into a problem loading. Try again — if it keeps happening, come back in a
        little while.
      </p>
      <div className="acts">
        <button className="btn btn-accent" type="button" onClick={reset}>
          Try again
        </button>
        <Link className="btn btn-ghost" href="/">
          Browse listings
        </Link>
      </div>
    </main>
  );
}
