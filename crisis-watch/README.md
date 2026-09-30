# Ethiopia Crisis Watch

A mobile-first website for verified updates, petitions, letters to Congress, and
GoFundMe fundraisers. It's one self-contained file (`index.html`) with no build
step. Open it in a browser, or drop it on any static host (Vercel, Netlify,
GitHub Pages).

## Pages

| Link | Page | What it's for |
|---|---|---|
| `#home` | Home | Mission, three main actions, the featured fundraiser, the latest updates, and how we verify |
| `#news` | News & Updates | Newest first, with region filters, search, and a Verified or Developing label |
| `#post-<id>` | Post | The full post, its sources, a safety notice on anonymized accounts, and share buttons |
| `#action` | Take Action | Three steps: petitions, a letter builder with live preview and copy, then find your representative |
| `#donate` | Donate | GoFundMe campaigns with progress, where the money goes, updates, and fee and tax notes |
| `#learn` | Learn | Timeline, region explainers, slide-series articles, and trusted sources |
| `#about` | About & Contact | Who runs the site, how to share a firsthand account safely, and a contact form |

The newsletter signup appears on every page. On phones, a bar at the bottom keeps
**Take action** and **Donate** within thumb reach.

## Editing content

Everything the site shows is in the `CONFIG` and `CONTENT` objects at the top of
the `<script>`. Items marked `sample: true` show a dashed **Sample** label.
Replace them before launch.

### Connecting GoFundMe

For each campaign in `CONTENT.campaigns`:

- `gofundmeUrl`: the campaign link, `https://www.gofundme.com/f/<your-campaign>`.
  **Donate on GoFundMe** opens `<gofundmeUrl>/donate`, which is GoFundMe's own
  secure checkout. The site never touches payment details.
- `raised`, `donors`, `asOf`: copy these from the campaign page when you post an
  update.
- `uses`: the budget split shown under "Where the money goes".
- `updates`: progress notes, newest first.
- Set `featured: true` on the campaign you want on Home and at the top of Donate.

Set `CONFIG.gofundmeWidget = true` to also load GoFundMe's official embed widget,
which shows live totals, on the Donate page. The widget works on your own
domain.

### Forms

`CONFIG.newsletterEndpoint` and `CONFIG.contactEndpoint` take any JSON POST
endpoint, such as Formspree, Buttondown, or a Mailchimp proxy. Until they're
set, the forms tell visitors plainly that nothing was sent.

### Letting Soleyana post on her own

Posts live in `CONTENT.posts`. To publish without editing code, move the same
design to WordPress or Squarespace. The fields map directly to a post type:
title, date, region, type, status, summary, body, and sources.
