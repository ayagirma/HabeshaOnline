-- =====================================================================
-- Buyer ↔ seller contact + the 3-business-day response rule
-- =====================================================================
-- profiles.show_contact  — opt in to publishing phone/email on listings
-- inquiries.status        — open | answered | spam
-- inquiries.responded_at  — set when the seller replies or marks answered
-- inquiries.reply_body    — the seller's in-app reply text, if any
--
-- A trigger stamps inquiries.seller_id from the listing itself, so a
-- buyer (who can be anonymous) can't point an inquiry at the wrong
-- seller, and can only inquire on an active listing.
-- =====================================================================

alter table profiles add column if not exists show_contact boolean not null default false;

alter table inquiries add column if not exists status text not null default 'open';
alter table inquiries add column if not exists responded_at timestamptz;
alter table inquiries add column if not exists reply_body text;

create index if not exists idx_inquiries_status on inquiries(status);

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

drop trigger if exists trg_set_inquiry_seller on inquiries;
create trigger trg_set_inquiry_seller
    before insert on inquiries
    for each row execute function set_inquiry_seller();
