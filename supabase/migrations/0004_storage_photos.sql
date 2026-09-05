-- =====================================================================
-- HabeshaOnline — listing photos: storage bucket + policies (idempotent)
-- =====================================================================
-- 0001 already creates the "listing-photos" bucket and these policies,
-- but `create policy` errors if the policy is already there, so re-running
-- 0001 to pick up a missed line isn't safe. This file is safe to run any
-- number of times — it drops-then-creates. Run it once in the Supabase
-- SQL editor if photo upload or display isn't working.
-- =====================================================================

-- Public bucket so a photo URL is just its path (see web/lib/photo.ts).
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do update set public = true;

-- Speeds up the listing_photos embed on browse / detail / admin.
create index if not exists idx_listing_photos_listing on listing_photos(listing_id);

-- ---- storage.objects policies for the bucket -------------------------
drop policy if exists "anyone can view listing photos" on storage.objects;
create policy "anyone can view listing photos"
    on storage.objects for select
    using (bucket_id = 'listing-photos');

drop policy if exists "signed-in users can upload listing photos" on storage.objects;
create policy "signed-in users can upload listing photos"
    on storage.objects for insert
    with check (bucket_id = 'listing-photos' and auth.uid() is not null);

drop policy if exists "owners can delete their own listing photos" on storage.objects;
create policy "owners can delete their own listing photos"
    on storage.objects for delete
    using (bucket_id = 'listing-photos' and owner = auth.uid());

-- ---- listing_photos row policies ------------------------------------
drop policy if exists "public can read photos of active listings" on listing_photos;
create policy "public can read photos of active listings"
    on listing_photos for select using (
        exists (select 1 from listings l where l.id = listing_id and l.status = 'active')
    );

drop policy if exists "admins can read all listing photos" on listing_photos;
create policy "admins can read all listing photos"
    on listing_photos for select using (
        exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    );

drop policy if exists "owners can manage their own listing photos" on listing_photos;
create policy "owners can manage their own listing photos"
    on listing_photos for all
    using (exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid()))
    with check (exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid()));
