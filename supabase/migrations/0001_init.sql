-- =====================================================================
-- HabeshaOnline — initial schema (Supabase / PostgreSQL)
-- =====================================================================
-- Purpose-built for HabeshaOnline's classifieds (not the unrelated
-- "MainList" business-directory schema also sitting in this repo).
--
-- The privileged-field guards below are the actual enforcement — RLS
-- alone only decides which ROWS a query can touch, not which COLUMNS
-- a permitted update may change. Without a guard trigger, a signed-in
-- user could set their own is_active/role, or a seller could publish
-- straight to 'active' by including that field in their own update.
-- Run this once in the Supabase SQL editor (or `supabase db push`).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- PROFILES — one row per auth.users id, created by a trigger at signup
-- ---------------------------------------------------------------------
create type user_role as enum ('member', 'admin');

create table profiles (
    id              uuid primary key references auth.users(id) on delete cascade,
    handle          text unique not null,
    display_name    text not null,
    contact_method  text not null default 'phone',
    contact_value   text,
    show_contact    boolean not null default false,  -- publish phone/email on listings
    role            user_role not null default 'member',
    is_active       boolean not null default true,   -- admin block/unblock
    created_at      timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles are publicly readable"
    on profiles for select using (true);

create policy "users can update their own profile"
    on profiles for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

create policy "admins can update any profile"
    on profiles for update
    using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- No insert policy on purpose: only handle_new_user() (security definer,
-- below) may create a profile row. Nothing in the app should be able to
-- insert one directly.

-- Guard: only an admin may change role / is_active. A signed-in member
-- updating their own row (display name, contact info, ...) has those two
-- fields silently held at their previous value. A caller with no auth
-- context at all (SQL editor, service_role, migrations) passes through —
-- that's how the first admin gets bootstrapped.
create or replace function guard_profile_privileged_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
    if auth.uid() is not null
       and not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
        new.role := old.role;
        new.is_active := old.is_active;
    end if;
    return new;
end;
$$;

create trigger trg_guard_profile_privileged
    before update on profiles
    for each row execute function guard_profile_privileged_fields();

-- Creates the profile row right after Supabase Auth creates the user.
-- handle / display_name / contact_* come from the signUp() call's
-- options.data (auth.users.raw_user_meta_data).
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
    insert into profiles (id, handle, display_name, contact_method, contact_value)
    values (
        new.id,
        lower(coalesce(new.raw_user_meta_data->>'handle', split_part(new.email, '@', 1))),
        coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
        coalesce(new.raw_user_meta_data->>'contact_method', 'phone'),
        new.raw_user_meta_data->>'contact_value'
    );
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function handle_new_user();

-- ---------------------------------------------------------------------
-- LISTINGS
-- ---------------------------------------------------------------------
create type listing_status as enum
    ('pending_review', 'active', 'suspended', 'expired', 'removed');

create table listings (
    id           uuid primary key default gen_random_uuid(),
    seller_id    uuid not null references profiles(id) on delete cascade,
    category     text not null,
    title_en     text not null,
    title_am     text,
    desc_en      text,
    desc_am      text,
    price        numeric(10,2) not null default 0,
    unit         text not null default 'total',
    place        text not null,
    tier         text not null default 'free',
    status       listing_status not null default 'pending_review',
    expires_at   timestamptz,
    created_at   timestamptz not null default now()
);

create index idx_listings_status on listings(status);
create index idx_listings_seller on listings(seller_id);

alter table listings enable row level security;

create policy "public can read active listings"
    on listings for select using (status = 'active');

create policy "owners can read their own listings at any status"
    on listings for select using (auth.uid() = seller_id);

create policy "admins can read all listings"
    on listings for select using (
        exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    );

create policy "owners can insert their own listings"
    on listings for insert with check (auth.uid() = seller_id);

create policy "owners can update their own listings"
    on listings for update using (auth.uid() = seller_id);

create policy "admins can update any listing"
    on listings for update using (
        exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    );

create policy "owners can delete their own listings"
    on listings for delete using (auth.uid() = seller_id);

-- Guard: this is the actual "approve" gate. A new listing always starts
-- pending_review no matter what the client sends, and seller_id is always
-- the caller — nobody can post on someone else's behalf. On update, only
-- an admin may move status (approve/suspend/remove) or reassign seller_id.
create or replace function guard_listing_privileged_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
    if TG_OP = 'INSERT' then
        new.status := 'pending_review';
        if auth.uid() is not null then
            new.seller_id := auth.uid();
        end if;
        return new;
    end if;

    if auth.uid() is not null
       and not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
        new.status := old.status;
        new.seller_id := old.seller_id;
    end if;
    return new;
end;
$$;

create trigger trg_guard_listing_privileged
    before insert or update on listings
    for each row execute function guard_listing_privileged_fields();

-- ---------------------------------------------------------------------
-- LISTING PHOTOS — metadata row per Supabase Storage object
-- ---------------------------------------------------------------------
create table listing_photos (
    id            uuid primary key default gen_random_uuid(),
    listing_id    uuid not null references listings(id) on delete cascade,
    storage_path  text not null,
    sort_order    int not null default 0
);

alter table listing_photos enable row level security;

create policy "public can read photos of active listings"
    on listing_photos for select using (
        exists (select 1 from listings l where l.id = listing_id and l.status = 'active')
    );

create policy "admins can read all listing photos"
    on listing_photos for select using (
        exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    );

create policy "owners can manage their own listing photos"
    on listing_photos for all
    using (exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid()))
    with check (exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid()));

-- ---------------------------------------------------------------------
-- INQUIRIES — buyer -> seller messages. Sending one needs no account;
-- reading one does. status / responded_at back the 3-business-day rule.
-- ---------------------------------------------------------------------
create table inquiries (
    id           uuid primary key default gen_random_uuid(),
    listing_id   uuid not null references listings(id) on delete cascade,
    seller_id    uuid not null references profiles(id),
    from_name    text not null,
    contact      text not null,
    body         text not null,
    is_read      boolean not null default false,
    status       text not null default 'open',        -- open | answered | spam
    responded_at timestamptz,
    reply_body   text,
    created_at   timestamptz not null default now()
);

create index idx_inquiries_seller on inquiries(seller_id);
create index idx_inquiries_status on inquiries(status);

alter table inquiries enable row level security;

create policy "anyone can send an inquiry"
    on inquiries for insert with check (true);

-- Stamp seller_id from the listing itself — a buyer can't point an
-- inquiry at the wrong seller, and can only inquire on an active listing.
create or replace function set_inquiry_seller()
returns trigger language plpgsql security definer set search_path = public as $$
declare
    l_seller uuid;
    l_status listing_status;
begin
    select seller_id, status into l_seller, l_status
    from listings where id = new.listing_id;
    if l_seller is null then
        raise exception 'listing not found';
    end if;
    if l_status <> 'active' then
        raise exception 'listing is not active';
    end if;
    new.seller_id := l_seller;
    new.status := 'open';
    new.responded_at := null;
    return new;
end;
$$;

create trigger trg_set_inquiry_seller
    before insert on inquiries
    for each row execute function set_inquiry_seller();

create policy "seller can read their own inquiries"
    on inquiries for select using (auth.uid() = seller_id);

create policy "admins can read all inquiries"
    on inquiries for select using (
        exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    );

create policy "seller can mark their inquiries read"
    on inquiries for update using (auth.uid() = seller_id);

-- ---------------------------------------------------------------------
-- REPORTS — "report this ad", now backed by a real table an admin can
-- act on. Filing one requires sign-in (a deliberate tightening from the
-- client-only version, which allowed anonymous reports).
-- ---------------------------------------------------------------------
create table reports (
    id           uuid primary key default gen_random_uuid(),
    listing_id   uuid not null references listings(id) on delete cascade,
    reporter_id  uuid references profiles(id),
    reason       text not null,
    status       text not null default 'open',
    created_at   timestamptz not null default now()
);

create index idx_reports_status on reports(status);

alter table reports enable row level security;

create policy "signed-in users can file a report"
    on reports for insert with check (auth.uid() is not null);

create policy "admins can read reports"
    on reports for select using (
        exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    );

create policy "admins can update reports"
    on reports for update using (
        exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    );

-- Always stamp the real caller — reporter_id is never client-supplied.
create or replace function set_report_reporter()
returns trigger language plpgsql security definer set search_path = public as $$
begin
    new.reporter_id := auth.uid();
    return new;
end;
$$;

create trigger trg_set_report_reporter
    before insert on reports
    for each row execute function set_report_reporter();

-- ---------------------------------------------------------------------
-- STORAGE — a public bucket for listing photos
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

create policy "anyone can view listing photos"
    on storage.objects for select
    using (bucket_id = 'listing-photos');

create policy "signed-in users can upload listing photos"
    on storage.objects for insert
    with check (bucket_id = 'listing-photos' and auth.uid() is not null);

create policy "owners can delete their own listing photos"
    on storage.objects for delete
    using (bucket_id = 'listing-photos' and owner = auth.uid());

-- ---------------------------------------------------------------------
-- First admin: there is no UI path to grant this — run it yourself,
-- once, after you've signed up through the app.
-- ---------------------------------------------------------------------
-- update profiles set role = 'admin' where handle = 'your-handle-here';
