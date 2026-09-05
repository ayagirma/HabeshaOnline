-- =====================================================================
-- HabeshaOnline — paid plans (manual Cash App / Zelle, admin-verified)
-- =====================================================================
-- There's no payment API at this scale: a seller on a paid plan sends
-- the fee by Cash App or Zelle, and an admin confirms it arrived and
-- flips the listing live. This adds the state that flow needs.
--
--   payment_status:
--     'none'    — free plan, nothing owed (the default)
--     'pending' — paid plan, fee not yet confirmed  → stays pending_review
--     'paid'    — admin has confirmed the transfer   → can go active
--
-- Run once in the Supabase SQL editor.
-- =====================================================================

alter table listings
    add column if not exists payment_status text not null default 'none';

alter table listings
    drop constraint if exists listings_payment_status_check;
alter table listings
    add constraint listings_payment_status_check
    check (payment_status in ('none', 'pending', 'paid'));

create index if not exists idx_listings_payment on listings(payment_status);

-- Guard, extended: on INSERT the plan alone decides payment_status, so a
-- client can't post a paid plan pre-marked 'paid'. On UPDATE a non-admin
-- can't touch it (same rule as status / seller_id). 'free' is the only
-- plan key that owes nothing — keep this list in step with lib/listing.ts.
create or replace function guard_listing_privileged_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
    if TG_OP = 'INSERT' then
        new.status := 'pending_review';
        if new.tier is null or new.tier = 'free' then
            new.payment_status := 'none';
        else
            new.payment_status := 'pending';
        end if;
        if auth.uid() is not null then
            new.seller_id := auth.uid();
        end if;
        return new;
    end if;

    if auth.uid() is not null
       and not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
        new.status := old.status;
        new.seller_id := old.seller_id;
        new.payment_status := old.payment_status;
    end if;
    return new;
end;
$$;

-- Backfill anything already posted: free stays 'none', paid plans that
-- are already active were effectively accepted, so call them 'paid';
-- paid plans still in review are 'pending'.
update listings set payment_status =
    case
        when tier = 'free' then 'none'
        when status = 'active' then 'paid'
        else 'pending'
    end
where payment_status = 'none';
