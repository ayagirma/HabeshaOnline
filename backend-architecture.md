# Local Business Marketplace — Backend & Architecture Design

## 1. Tech Stack Recommendation

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (React) | SEO-friendly (critical for a directory people find via Google), SSR for fast listing pages |
| Backend | Node.js + Express (or Next.js API routes) | Same language as frontend, huge ecosystem, easy to hire for |
| Database | PostgreSQL + PostGIS | Relational data (users/businesses/bookings) + geo search ("plumbers near me") |
| ORM | Prisma | Type-safe queries, easy migrations |
| Auth | JWT access token + refresh token, or Clerk/Auth0 if you want to outsource it | Standard, secure, supports social login |
| Payments | Stripe (Billing + Connect if you ever want to split payouts) | Handles subscriptions, invoicing, webhooks out of the box |
| File storage | AWS S3 / Cloudflare R2 | Business photos, logos |
| Search | Postgres full-text search initially; Algolia/Meilisearch if you outgrow it | Keep it simple until you have scale |
| Messaging (real-time) | WebSockets (Socket.io) or polling to start | In-app chat between customer and business |
| Hosting | Vercel (frontend) + Render/Railway/Fly.io (API + DB) | Low ops overhead for a solo/small team launch |
| Email/SMS | Postmark or SendGrid (email), Twilio (SMS reminders) | Booking confirmations, notifications |

## 2. High-Level Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  Next.js Web │──────▶│  Express API      │──────▶│  PostgreSQL      │
│  (customer + │      │  (REST/GraphQL)   │      │  + PostGIS       │
│  business    │◀──────│                   │◀──────│                  │
│  dashboards) │      └───────┬───────────┘      └─────────────────┘
└─────────────┘              │
                              ├──▶ Stripe (subscriptions, payments)
                              ├──▶ S3/R2 (photos)
                              ├──▶ Socket.io (real-time messaging)
                              └──▶ Postmark/Twilio (notifications)
```

## 3. Core API Endpoints

### Auth
- `POST /auth/register` — customer or business owner signup
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### Businesses (listings)
- `GET /businesses` — search/filter by category, city, rating, distance
- `GET /businesses/:slug` — public listing detail
- `POST /businesses` — create listing (owner)
- `PATCH /businesses/:id` — edit listing (owner)
- `POST /businesses/:id/photos` — upload photos
- `GET /categories` — list all categories

### Reviews
- `GET /businesses/:id/reviews`
- `POST /businesses/:id/reviews` — customer leaves a review
- `POST /reviews/:id/reply` — owner replies

### Bookings / Quote requests
- `POST /businesses/:id/bookings` — customer requests service
- `GET /businesses/:id/bookings` — owner's booking queue
- `PATCH /bookings/:id` — confirm/decline/complete

### Messaging
- `GET /conversations`
- `POST /conversations/:id/messages`
- WebSocket channel `conversation:{id}` for real-time delivery

### Billing
- `GET /plans`
- `POST /subscriptions` — start subscription (creates Stripe Checkout session)
- `POST /webhooks/stripe` — handle subscription lifecycle events (payment succeeded/failed, cancellation)

### Admin
- `GET /admin/businesses?status=pending_review` — moderation queue
- `PATCH /admin/businesses/:id/approve`
- `PATCH /admin/businesses/:id/suspend`

## 4. Listing Lifecycle

```
draft → pending_review → active → (expired | suspended)
```
- New listings go through a lightweight moderation step before going live (prevents spam/fake churches, etc.).
- `active` requires a valid subscription (or a free Basic tier if you offer one).
- Subscription lapses → `expired` (listing hidden from search, but owner can still log in and reactivate).

## 5. Pricing Tiers (as recommended)

| Tier | Monthly | Perks |
|---|---|---|
| Basic | Free or $9 | 1 photo, contact info, category listing |
| Featured | $29–49 | Top-of-category placement, full gallery, booking calendar |
| Premium | $79–149 | Homepage/search priority, in-app messaging, analytics dashboard, multi-location |

**Churches and funeral homes are always free**, regardless of tier — these are marked with `categories.is_free_category = TRUE` in the schema. App logic checks this flag and skips subscription enforcement entirely for any business in those categories: they can go straight from `pending_review` to `active` with no payment step, and never expire due to non-payment. This keeps community/civic listings out of the paywall while all commercial trade and retail categories still monetize normally.

Stripe Billing handles the recurring charges; `subscriptions` and `payments` tables mirror Stripe state for fast local queries (search/filter by plan without hitting Stripe's API every time). Free-category businesses simply won't have a row in `subscriptions` at all.

## 6. Security & Trust Considerations

- **Review integrity**: one review per customer per business (enforced by DB constraint), plus an `is_flagged` field for moderation.
- **Business verification**: `is_verified` badge — manually confirmed phone/address/business license builds trust (especially useful for churches and home-service trades where scams are a concern).
- **Rate limiting**: on review submission, messaging, and booking requests to prevent spam.
- **PII handling**: customer phone/email only visible to a business after a booking/message is initiated, not exposed in public search.

## 7. Suggested Build Order (MVP → Full Marketplace)

1. **Phase 1 (MVP)**: Auth, business listings (CRUD), category browse/search, Stripe Basic/Featured/Premium subscriptions.
2. **Phase 2**: Reviews & ratings, business photo galleries, geo search ("near me").
3. **Phase 3**: In-app messaging, booking/quote requests, notifications.
4. **Phase 4**: Admin moderation dashboard, analytics for Premium tier, SMS/email reminders.

This lets you launch and start collecting subscription revenue well before messaging/booking is built.

---

**Files delivered:**
- `schema.sql` — full PostgreSQL schema (users, businesses, categories, reviews, bookings, messaging, subscriptions/payments, notifications), with an auto-updating rating trigger.
- This document — architecture, API design, and pricing rationale.
