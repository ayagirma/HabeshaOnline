-- =====================================================================
-- HabeshaOnline — "Ads & Promotions" posts (paid placements, not listings)
-- =====================================================================
-- A pure advertisement (someone paying to promote a business, app, or
-- service that isn't itself for sale/rent through the site) doesn't
-- have a price or a Colorado city — it has a link. category = 'promo'
-- carries that link; price/unit/place stay at their normal defaults
-- (0 / 'total' / '') for these rows, unused by the UI for this category.
-- Run once in the Supabase SQL editor.
-- =====================================================================

alter table listings
    add column if not exists link_url text;
