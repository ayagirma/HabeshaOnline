"use client";

/* Last-resort boundary: only renders if the root layout itself throws,
   which means LanguageProvider and globals.css never mounted. So this
   file ships its own <html>/<body>, its own styles, and English only.
   Keep it tiny and dependency-free. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <style>{`
          :root { color-scheme: light dark; }
          body { margin: 0; font: 16px/1.6 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
                 background: #faf8f3; color: #1c211f; }
          @media (prefers-color-scheme: dark) {
            body { background: #14201b; color: #e7e4d8; }
            .ge-sub { color: #9aa5a0 !important; }
          }
          .ge-wrap { min-height: 100vh; display: grid; place-content: center; justify-items: center;
                     text-align: center; gap: 16px; padding: 24px; }
          .ge-band { width: 72px; height: 8px; border-radius: 999px;
                     background:
                       repeating-linear-gradient(135deg,#D4901A 0 4px,transparent 4px 8px),
                       repeating-linear-gradient(45deg,#A83418 0 4px,transparent 4px 8px),
                       #1F5B3E; }
          .ge-wrap h1 { font-size: 26px; margin: 0; }
          .ge-sub { color: #5b6560; max-width: 380px; margin: 0; }
          .ge-btn { background: #D4901A; color: #1c211f; border: 0; border-radius: 8px;
                    padding: 10px 18px; font-size: 15px; font-weight: 600; cursor: pointer; }
        `}</style>
        <main className="ge-wrap">
          <span className="ge-band" aria-hidden="true" />
          <h1>HabeshaOnline hit a snag</h1>
          <p className="ge-sub">Something broke while loading the page. Reload and it should be fine.</p>
          <button className="ge-btn" type="button" onClick={reset}>
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
