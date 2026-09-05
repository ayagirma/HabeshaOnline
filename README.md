# HabeshaOnline

A community marketplace for the Ethiopian and Eritrean community in Colorado —
listings, seller accounts, buyer inquiries, and paid placement plans, in Amharic
and English.

Published as a claude.ai Artifact. This repository is the source; `dist/index.html`
is the single file that gets published.

## Build

```
node scripts/build.mjs      # src/ → dist/index.html
```

An Artifact is one HTML file, so the build inlines every stylesheet and script in
the order `src/index.html` lists them, via `<!--include:path-->` markers. There
are no dependencies and no bundler.

## Layout

```
src/
  index.html                  page skeleton, screens, include markers
  fonts/
    noto-sans-ethiopic.css    Ge'ez face, embedded as a data URI
  styles/
    tokens.css                colour, type and spacing tokens; all three themes
    base.css                  shell, header, footer, tab bar, the tibeb band
    components.css            buttons, cards, forms, panels, notes
    screens.css               per-screen layout
  js/
    i18n.js                   every interface string, en + am
    ethiopic.js               Gregorian ↔ Ethiopian calendar
    data.js                   categories, cities, plans, sample listings
    media.js                  client-side image shrinking
    auth.js                   password hashing, sessions, validation
    store.js                  storage: shared database or this browser
    ui.js                     escaping, formatting, the listing card
    screens/                  browse · detail · post · pricing · account
    app.js                    router, nav, language, start-up
scripts/build.mjs
dist/index.html               built output — do not edit
```

## Storage

Two backends behind one API in `store.js`:

- **shared** — the artifact's own database, when the viewer's session grants it.
  Listings, accounts and inquiries are real and live; everyone opening the page
  sees the same board.
- **local** — `localStorage`, when the database isn't available. The page still
  works end to end, but nothing is shared.

Which one is in play is printed in the footer rather than hidden, so nobody posts
an ad believing it went further than it did.

Shape of the shared store:

```
listings/<id>                 the record, with a small cover thumbnail inline
listings/<id>/photos/<n>      full-size photos, one document each
accounts/<handle>             salt + derived key — never a password
inquiries/<id>                buyer messages, keyed by seller
reports/<id>                  "report this ad" flags, open or resolved
```

Documents are capped at 256 KiB, so photos are shrunk on the seller's device
(long edge 1100px, JPEG, ~90 KB) and the grid draws from a 440px cover thumbnail
carried inside the listing record — the full set is only fetched on the detail
page.

## Accounts, and what the security here is worth

Passwords are stretched with **PBKDF2-SHA-256, 210,000 rounds**, against 16 bytes
of per-account random salt, using Web Crypto on the seller's own device. Only the
derived key and the salt are stored. Sign-in repeats the derivation and compares
the result in constant time; a missing handle costs the same time as a wrong
password, so the form does not reveal which handles exist. Sessions are local
tokens that expire after 30 days. Five wrong attempts lock the form for a minute.
Handles are claimed with a database lease so two people can't take the same one.

**What this cannot do.** There is no server. Account records live in the same
store the page shares with its viewers, so someone who can read the store can
copy it and guess against it offline. The iteration count makes that expensive,
not impossible. The sign-up form says so, and nobody should use a password here
that they use anywhere else. Real account security needs a backend that holds
the hashes where clients can't read them. The same limit applies to *identity*:
nothing running only in the visitor's browser can confirm an email inbox, a
phone number, or a real name — that needs a trusted third party in the loop,
which means a backend too.

## Accountability, short of real verification

What a client-only page *can* do is make posting less anonymous and misuse
easier to catch and undo:

- **Posting requires an account** and a signed confirmation — "I confirm this
  listing is accurate and I'm responsible for its content" — on every publish
  or edit ([post.js](src/js/screens/post.js)).
- **A rolling per-account cap** (5 new listings / 24h) slows a script down
  without pretending to stop one.
- **"Report this ad"** actually records a reason against the listing now,
  instead of just relabeling its own button.
- **A Reports screen** (footer link) lists open reports so a listing can be
  pulled or a report dismissed. It has no sign-in gate — there's no
  server-side role to put one behind in a page like this, so it's left open
  rather than given a lock a browser console can pick in ten seconds.

## Sample listings

`data.js` ships sixteen sample listings so a first-time visitor sees a working
board instead of an empty one. They are marked `sample: true`, labelled "Sample"
wherever they appear, carry no contact details, and are never written to the
shared store.

## Design

Palette and type are in `styles/tokens.css`. The recurring woven band — the
*tibeb* border from a netela — is drawn in CSS gradients and used only where it
marks an edge: under the header, above the footer, between sections, and along
the top of a featured card. Featured listings literally wear the band.

Dates appear in both calendars ("Nehase 28, 2018 · Sep 3, 2026"); the conversion
in `ethiopic.js` goes through the Julian Day Number and handles Pagume and leap
years.

Light and dark are both defined at token level, including the un-stamped
system-default state.
