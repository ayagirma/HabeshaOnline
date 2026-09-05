-- =====================================================================
-- Fix: the privileged-field guards blocked the SQL editor too
-- =====================================================================
-- 0001's guard triggers reverted any role / is_active / status change
-- made without a signed-in admin — which includes the Supabase SQL
-- editor itself (auth.uid() is null there). That made it impossible to
-- bootstrap the first admin.
--
-- Corrected rule: only a *signed-in non-admin* is blocked. No auth
-- context at all (SQL editor, service_role, migrations) passes through,
-- same as any other trusted server-side caller.
-- =====================================================================

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
