-- =====================================================================
-- HabeshaOnline — day-2 "a buyer is waiting" reminder to sellers
-- =====================================================================
-- The posted rule: reply to an inquiry within 3 business days or the
-- listing comes down. Nothing tells the seller that clock is running —
-- they only see it if they open /inbox. A daily cron (Vercel →
-- /api/cron/inquiry-reminders) calls the two functions below: one to
-- find inquiries that have gone unanswered ~2 days, one to stamp them
-- so the seller isn't emailed again.
--
-- Both functions are SECURITY DEFINER (they read auth.users for the
-- seller's email) and executable ONLY by service_role — the cron route
-- authenticates with the service key. Run once in the SQL editor.
-- =====================================================================

alter table inquiries
    add column if not exists reminder_sent_at timestamptz;

-- Partial index: the cron only ever scans open, un-reminded inquiries.
create index if not exists idx_inquiries_reminder_due
    on inquiries (created_at)
    where status = 'open' and reminder_sent_at is null;

-- Rows the cron should email about: an open inquiry, older than the
-- cutoff, not yet reminded, whose listing is still active.
create or replace function get_due_inquiry_reminders(older_than interval default interval '2 days')
returns table (
    inquiry_id    uuid,
    seller_id     uuid,
    seller_email  text,
    seller_name   text,
    listing_id    uuid,
    listing_title text,
    buyer_name    text,
    created_at    timestamptz
)
language sql
security definer
set search_path = public, auth
as $$
    select i.id, i.seller_id, u.email::text, p.display_name,
           l.id, l.title_en, i.from_name, i.created_at
    from inquiries i
    join listings l on l.id = i.listing_id and l.status = 'active'
    join profiles p on p.id = i.seller_id
    join auth.users u on u.id = i.seller_id
    where i.status = 'open'
      and i.reminder_sent_at is null
      and i.created_at < now() - older_than
    order by i.seller_id, i.created_at;
$$;

revoke all on function get_due_inquiry_reminders(interval) from anon, authenticated, public;
grant execute on function get_due_inquiry_reminders(interval) to service_role;

-- Stamp inquiries the cron has emailed about, so they're skipped next run.
create or replace function mark_inquiries_reminded(p_ids uuid[])
returns void
language sql
security definer
set search_path = public
as $$
    update inquiries set reminder_sent_at = now()
    where id = any(p_ids) and reminder_sent_at is null;
$$;

revoke all on function mark_inquiries_reminded(uuid[]) from anon, authenticated, public;
grant execute on function mark_inquiries_reminded(uuid[]) to service_role;
