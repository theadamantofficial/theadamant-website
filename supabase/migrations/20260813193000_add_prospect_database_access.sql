-- Permissioned access to the external USA prospect database and an outreach
-- event model that can later be connected to a CRM lead or WhatsApp provider.
alter table public.profiles
add column if not exists can_access_prospect_database boolean not null default false;

create or replace function public.can_access_prospect_database()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select coalesce(
        (
            select active
                and (profiles.role in ('super_admin', 'admin') or profiles.can_access_prospect_database)
            from public.profiles
            where id = auth.uid()
        ),
        false
    );
$$;

create or replace function public.set_prospect_database_access(target_id uuid, access_enabled boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if public.current_crm_role() not in ('super_admin', 'admin') then
        raise exception 'Only CRM administrators can grant lead database access'
            using errcode = '42501';
    end if;

    if not exists (select 1 from public.profiles where id = target_id) then
        raise exception 'Team member not found'
            using errcode = 'P0002';
    end if;

    update public.profiles
    set can_access_prospect_database = access_enabled
    where id = target_id
      and role = 'employee';
end;
$$;

revoke all on function public.set_prospect_database_access(uuid, boolean) from public;
grant execute on function public.set_prospect_database_access(uuid, boolean) to authenticated;

create table if not exists public.prospect_outreach_events (
    id uuid primary key default gen_random_uuid(),
    prospect_source text not null default 'usa_leads_sqlite',
    prospect_record_id bigint not null,
    crm_lead_id uuid references public.leads(id) on delete set null,
    user_id uuid not null references public.profiles(id) on delete restrict,
    channel text not null default 'whatsapp',
    destination text not null,
    message_body text not null,
    status text not null default 'initiated',
    provider_message_id text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint prospect_outreach_source_valid check (prospect_source in ('usa_leads_sqlite')),
    constraint prospect_outreach_channel_valid check (channel in ('whatsapp')),
    constraint prospect_outreach_status_valid check (status in ('initiated', 'sent', 'delivered', 'read', 'failed')),
    constraint prospect_outreach_destination_not_blank check (length(btrim(destination)) > 0),
    constraint prospect_outreach_message_not_blank check (length(btrim(message_body)) > 0)
);

create index if not exists prospect_outreach_record_created_idx
on public.prospect_outreach_events (prospect_source, prospect_record_id, created_at desc);

create index if not exists prospect_outreach_user_created_idx
on public.prospect_outreach_events (user_id, created_at desc);

drop trigger if exists set_prospect_outreach_updated_at on public.prospect_outreach_events;
create trigger set_prospect_outreach_updated_at
before update on public.prospect_outreach_events
for each row execute function public.set_crm_updated_at();

alter table public.prospect_outreach_events enable row level security;

drop policy if exists prospect_outreach_select_accessible on public.prospect_outreach_events;
create policy prospect_outreach_select_accessible
on public.prospect_outreach_events for select to authenticated
using (
    public.can_access_prospect_database()
    and (public.current_crm_role() in ('super_admin', 'admin') or user_id = auth.uid())
);

drop policy if exists prospect_outreach_insert_own on public.prospect_outreach_events;
create policy prospect_outreach_insert_own
on public.prospect_outreach_events for insert to authenticated
with check (public.can_access_prospect_database() and user_id = auth.uid());

drop policy if exists prospect_outreach_update_admins on public.prospect_outreach_events;
create policy prospect_outreach_update_admins
on public.prospect_outreach_events for update to authenticated
using (public.current_crm_role() in ('super_admin', 'admin'))
with check (public.current_crm_role() in ('super_admin', 'admin'));

-- PostgreSQL cannot replace a table function when its result columns change.
drop function if exists public.crm_team_directory();
create function public.crm_team_directory()
returns table (
    id uuid,
    full_name text,
    email text,
    role text,
    avatar_url text,
    active boolean,
    can_access_prospect_database boolean,
    created_at timestamptz,
    active_leads bigint,
    open_tasks bigint
)
language sql
stable
security invoker
set search_path = public
as $$
    select
        profiles.id,
        profiles.full_name,
        profiles.email,
        profiles.role,
        profiles.avatar_url,
        profiles.active,
        profiles.can_access_prospect_database,
        profiles.created_at,
        count(distinct leads.id) filter (where leads.status not in ('won', 'lost')) as active_leads,
        count(distinct tasks.id) filter (where tasks.status not in ('completed', 'cancelled')) as open_tasks
    from public.profiles
    left join public.leads on leads.assigned_to = profiles.id
    left join public.tasks on tasks.assigned_to = profiles.id
    where public.current_crm_role() in ('super_admin', 'admin')
    group by profiles.id
    order by profiles.active desc, profiles.full_name, profiles.email;
$$;

comment on column public.profiles.can_access_prospect_database is
'Explicit access to the external prospect database. Super admins and admins always have access.';
comment on table public.prospect_outreach_events is
'Auditable outbound message intents; designed for future CRM lead linking and WhatsApp provider delivery updates.';
