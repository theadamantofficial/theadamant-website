create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null default '',
    email text not null unique,
    role text not null default 'sales',
    avatar_url text,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint profiles_email_normalized check (email = lower(btrim(email))),
    constraint profiles_role_valid check (role in ('super_admin', 'admin', 'manager', 'sales')),
    constraint profiles_super_admin_reserved check (role <> 'super_admin' or email = 'admin@theadamant.com')
);

create table if not exists public.leads (
    id uuid primary key default gen_random_uuid(),
    customer_name text not null,
    phone text,
    email text,
    company_name text,
    service_required text not null,
    lead_source text not null default 'other',
    status text not null default 'new',
    estimated_value numeric(14, 2) not null default 0,
    assigned_to uuid references public.profiles(id) on delete set null,
    next_followup timestamptz,
    priority text not null default 'medium',
    description text not null default '',
    external_reference text,
    origin_metadata jsonb not null default '{}'::jsonb,
    created_by uuid not null references public.profiles(id) on delete restrict,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint leads_customer_name_not_blank check (length(btrim(customer_name)) > 0),
    constraint leads_service_not_blank check (length(btrim(service_required)) > 0),
    constraint leads_status_valid check (status in (
        'new', 'contacted', 'meeting_scheduled', 'requirement_discussion',
        'proposal_sent', 'negotiation', 'won', 'lost'
    )),
    constraint leads_source_valid check (lead_source in (
        'website', 'whatsapp', 'instagram', 'linkedin',
        'referral', 'email', 'phone', 'other'
    )),
    constraint leads_priority_valid check (priority in ('low', 'medium', 'high', 'urgent')),
    constraint leads_value_non_negative check (estimated_value >= 0)
);

create table if not exists public.lead_notes (
    id uuid primary key default gen_random_uuid(),
    lead_id uuid not null references public.leads(id) on delete cascade,
    created_by uuid not null references public.profiles(id) on delete restrict,
    note text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint lead_notes_note_not_blank check (length(btrim(note)) > 0)
);

create table if not exists public.tasks (
    id uuid primary key default gen_random_uuid(),
    lead_id uuid references public.leads(id) on delete cascade,
    title text not null,
    description text not null default '',
    assigned_to uuid not null references public.profiles(id) on delete restrict,
    due_date timestamptz not null,
    status text not null default 'open',
    priority text not null default 'medium',
    created_by uuid not null references public.profiles(id) on delete restrict,
    completed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint tasks_title_not_blank check (length(btrim(title)) > 0),
    constraint tasks_status_valid check (status in ('open', 'in_progress', 'completed', 'cancelled')),
    constraint tasks_priority_valid check (priority in ('low', 'medium', 'high', 'urgent'))
);

create table if not exists public.activities (
    id uuid primary key default gen_random_uuid(),
    lead_id uuid references public.leads(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete set null,
    activity_type text not null,
    description text not null,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    constraint activities_type_not_blank check (length(btrim(activity_type)) > 0),
    constraint activities_description_not_blank check (length(btrim(description)) > 0)
);

create index if not exists leads_status_created_at_idx on public.leads (status, created_at desc);
create index if not exists leads_assigned_to_status_idx on public.leads (assigned_to, status, created_at desc);
create index if not exists leads_next_followup_idx on public.leads (next_followup) where next_followup is not null;
create index if not exists leads_source_idx on public.leads (lead_source, created_at desc);
create index if not exists leads_customer_search_idx on public.leads (lower(customer_name), lower(company_name));
create unique index if not exists leads_external_reference_idx on public.leads (external_reference) where external_reference is not null;
create index if not exists lead_notes_lead_created_idx on public.lead_notes (lead_id, created_at desc);
create index if not exists tasks_assigned_status_due_idx on public.tasks (assigned_to, status, due_date);
create index if not exists tasks_lead_idx on public.tasks (lead_id, created_at desc);
create index if not exists activities_lead_created_idx on public.activities (lead_id, created_at desc);
create index if not exists activities_created_at_idx on public.activities (created_at desc);

create or replace function public.set_crm_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute function public.set_crm_updated_at();

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at before update on public.leads
for each row execute function public.set_crm_updated_at();

create or replace function public.protect_crm_ownership_fields()
returns trigger
language plpgsql
as $$
begin
    if new.created_by is distinct from old.created_by then
        raise exception 'created_by cannot be changed';
    end if;
    return new;
end;
$$;

drop trigger if exists protect_lead_ownership on public.leads;
create trigger protect_lead_ownership before update on public.leads
for each row execute function public.protect_crm_ownership_fields();

drop trigger if exists set_lead_notes_updated_at on public.lead_notes;
create trigger set_lead_notes_updated_at before update on public.lead_notes
for each row execute function public.set_crm_updated_at();

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at before update on public.tasks
for each row execute function public.set_crm_updated_at();

drop trigger if exists protect_task_ownership on public.tasks;
create trigger protect_task_ownership before update on public.tasks
for each row execute function public.protect_crm_ownership_fields();

create or replace function public.handle_new_crm_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, full_name, email, role, active)
    values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'full_name', ''),
        lower(coalesce(new.email, '')),
        case when lower(coalesce(new.email, '')) = 'admin@theadamant.com' then 'super_admin' else 'sales' end,
        lower(coalesce(new.email, '')) like '%@theadamant.com'
    )
    on conflict (id) do update
    set email = excluded.email,
        full_name = case when public.profiles.full_name = '' then excluded.full_name else public.profiles.full_name end,
        role = case when excluded.email = 'admin@theadamant.com' then 'super_admin' else public.profiles.role end;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_crm_profile on auth.users;
create trigger on_auth_user_created_create_crm_profile
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.handle_new_crm_user();

insert into public.profiles (id, full_name, email, role, active)
select
    id,
    coalesce(raw_user_meta_data ->> 'full_name', ''),
    lower(email),
    case when lower(email) = 'admin@theadamant.com' then 'super_admin' else 'sales' end,
    lower(email) like '%@theadamant.com'
from auth.users
where email is not null
on conflict (id) do update
set email = excluded.email,
    role = case when excluded.email = 'admin@theadamant.com' then 'super_admin' else public.profiles.role end;

create or replace function public.current_crm_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
    select role from public.profiles where id = auth.uid() and active = true;
$$;

create or replace function public.can_access_lead(lead_assigned_to uuid, lead_created_by uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select case
        when public.current_crm_role() in ('super_admin', 'admin', 'manager') then true
        when public.current_crm_role() = 'sales' then auth.uid() = lead_assigned_to
        else false
    end;
$$;

create or replace function public.log_lead_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    actor_id uuid := coalesce(auth.uid(), new.created_by);
begin
    if tg_op = 'INSERT' then
        insert into public.activities (lead_id, user_id, activity_type, description, metadata)
        values (new.id, actor_id, 'lead_created', 'Lead created', jsonb_build_object('source', new.lead_source));
        return new;
    end if;

    if old.status is distinct from new.status then
        insert into public.activities (lead_id, user_id, activity_type, description, metadata)
        values (
            new.id,
            auth.uid(),
            case when new.status = 'won' then 'lead_won' when new.status = 'lost' then 'lead_lost' else 'status_changed' end,
            case when new.status = 'won' then 'Lead marked as won' when new.status = 'lost' then 'Lead marked as lost' else 'Status changed' end,
            jsonb_build_object('old_status', old.status, 'new_status', new.status)
        );
    end if;

    if old.assigned_to is distinct from new.assigned_to then
        insert into public.activities (lead_id, user_id, activity_type, description, metadata)
        values (new.id, auth.uid(), 'lead_assigned', 'Lead assignment changed', jsonb_build_object('old_assigned_to', old.assigned_to, 'new_assigned_to', new.assigned_to));
    end if;

    if old.next_followup is distinct from new.next_followup then
        insert into public.activities (lead_id, user_id, activity_type, description, metadata)
        values (new.id, auth.uid(), 'followup_changed', 'Follow-up changed', jsonb_build_object('old_followup', old.next_followup, 'new_followup', new.next_followup));
    end if;

    if (to_jsonb(old) - array['status', 'assigned_to', 'next_followup', 'updated_at'])
        is distinct from
       (to_jsonb(new) - array['status', 'assigned_to', 'next_followup', 'updated_at']) then
        insert into public.activities (lead_id, user_id, activity_type, description)
        values (new.id, auth.uid(), 'lead_edited', 'Lead details updated');
    end if;

    return new;
end;
$$;

drop trigger if exists log_lead_activity on public.leads;
create trigger log_lead_activity after insert or update on public.leads
for each row execute function public.log_lead_activity();

create or replace function public.log_note_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.activities (lead_id, user_id, activity_type, description, metadata)
    values (new.lead_id, new.created_by, 'note_added', 'Note added', jsonb_build_object('note_id', new.id));
    return new;
end;
$$;

drop trigger if exists log_note_activity on public.lead_notes;
create trigger log_note_activity after insert on public.lead_notes
for each row execute function public.log_note_activity();

create or replace function public.log_task_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if tg_op = 'INSERT' and new.lead_id is not null then
        insert into public.activities (lead_id, user_id, activity_type, description, metadata)
        values (new.lead_id, new.created_by, 'task_created', 'Task created: ' || new.title, jsonb_build_object('task_id', new.id));
    elsif tg_op = 'UPDATE' and old.status is distinct from new.status and new.status = 'completed' and new.lead_id is not null then
        insert into public.activities (lead_id, user_id, activity_type, description, metadata)
        values (new.lead_id, auth.uid(), 'task_completed', 'Task completed: ' || new.title, jsonb_build_object('task_id', new.id));
    end if;
    return new;
end;
$$;

drop trigger if exists log_task_activity on public.tasks;
create trigger log_task_activity after insert or update on public.tasks
for each row execute function public.log_task_activity();

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;
alter table public.tasks enable row level security;
alter table public.activities enable row level security;

drop policy if exists profiles_select_crm_users on public.profiles;
create policy profiles_select_crm_users on public.profiles for select to authenticated
using (public.current_crm_role() is not null);

drop policy if exists profiles_update_admins on public.profiles;
create policy profiles_update_admins on public.profiles for update to authenticated
using (public.current_crm_role() in ('super_admin', 'admin'))
with check (
    public.current_crm_role() in ('super_admin', 'admin')
    and (email <> 'admin@theadamant.com' or role = 'super_admin')
);

drop policy if exists leads_select_accessible on public.leads;
create policy leads_select_accessible on public.leads for select to authenticated
using (public.can_access_lead(assigned_to, created_by));

drop policy if exists leads_insert_crm_users on public.leads;
create policy leads_insert_crm_users on public.leads for insert to authenticated
with check (
    created_by = auth.uid()
    and public.current_crm_role() is not null
    and (public.current_crm_role() <> 'sales' or assigned_to = auth.uid())
);

drop policy if exists leads_update_accessible on public.leads;
create policy leads_update_accessible on public.leads for update to authenticated
using (public.can_access_lead(assigned_to, created_by))
with check (public.can_access_lead(assigned_to, created_by));

drop policy if exists leads_delete_admins on public.leads;
create policy leads_delete_admins on public.leads for delete to authenticated
using (public.current_crm_role() in ('super_admin', 'admin'));

drop policy if exists notes_select_accessible on public.lead_notes;
create policy notes_select_accessible on public.lead_notes for select to authenticated
using (exists (select 1 from public.leads where leads.id = lead_notes.lead_id));

drop policy if exists notes_insert_accessible on public.lead_notes;
create policy notes_insert_accessible on public.lead_notes for insert to authenticated
with check (created_by = auth.uid() and exists (select 1 from public.leads where leads.id = lead_notes.lead_id));

drop policy if exists notes_update_own_or_managers on public.lead_notes;
create policy notes_update_own_or_managers on public.lead_notes for update to authenticated
using (created_by = auth.uid() or public.current_crm_role() in ('super_admin', 'admin', 'manager'))
with check (created_by = auth.uid() or public.current_crm_role() in ('super_admin', 'admin', 'manager'));

drop policy if exists tasks_select_accessible on public.tasks;
create policy tasks_select_accessible on public.tasks for select to authenticated
using (
    public.current_crm_role() in ('super_admin', 'admin', 'manager')
    or assigned_to = auth.uid()
    or created_by = auth.uid()
);

drop policy if exists tasks_insert_crm_users on public.tasks;
create policy tasks_insert_crm_users on public.tasks for insert to authenticated
with check (
    created_by = auth.uid()
    and public.current_crm_role() is not null
    and (public.current_crm_role() <> 'sales' or assigned_to = auth.uid())
);

drop policy if exists tasks_update_accessible on public.tasks;
create policy tasks_update_accessible on public.tasks for update to authenticated
using (
    public.current_crm_role() in ('super_admin', 'admin', 'manager')
    or assigned_to = auth.uid()
    or created_by = auth.uid()
)
with check (
    public.current_crm_role() in ('super_admin', 'admin', 'manager')
    or (public.current_crm_role() = 'sales' and assigned_to = auth.uid())
);

drop policy if exists tasks_delete_admins on public.tasks;
create policy tasks_delete_admins on public.tasks for delete to authenticated
using (public.current_crm_role() in ('super_admin', 'admin'));

drop policy if exists activities_select_accessible on public.activities;
create policy activities_select_accessible on public.activities for select to authenticated
using (lead_id is null or exists (select 1 from public.leads where leads.id = activities.lead_id));

drop policy if exists activities_insert_crm_users on public.activities;
create policy activities_insert_crm_users on public.activities for insert to authenticated
with check (
    user_id = auth.uid()
    and (lead_id is null or exists (select 1 from public.leads where leads.id = activities.lead_id))
);

create or replace function public.crm_dashboard_metrics()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
    with lead_metrics as (
        select
            count(*) as total_leads,
            count(*) filter (where status = 'new') as new_leads,
            count(*) filter (where status not in ('won', 'lost')) as open_opportunities,
            coalesce(sum(estimated_value) filter (where status not in ('won', 'lost')), 0) as pipeline_value,
            coalesce(sum(estimated_value) filter (where status = 'won'), 0) as won_value,
            coalesce(sum(estimated_value) filter (where status = 'lost'), 0) as lost_value,
            count(*) filter (where status = 'meeting_scheduled') as meetings,
            count(*) filter (where status in ('proposal_sent', 'negotiation')) as proposals,
            count(*) filter (where next_followup::date = current_date and status not in ('won', 'lost')) as followups_today,
            count(*) filter (where next_followup < now() and status not in ('won', 'lost')) as followups_due,
            case
                when count(*) filter (where status in ('won', 'lost')) = 0 then 0
                else round(100.0 * count(*) filter (where status = 'won') / count(*) filter (where status in ('won', 'lost')), 1)
            end as conversion_rate
        from public.leads
    ), task_metrics as (
        select count(*) filter (where due_date < now() and status not in ('completed', 'cancelled')) as overdue_tasks
        from public.tasks
    )
    select to_jsonb(lead_metrics) || to_jsonb(task_metrics)
    from lead_metrics cross join task_metrics;
$$;

create or replace function public.crm_pipeline_summary()
returns table (status text, lead_count bigint, pipeline_value numeric)
language sql
stable
security invoker
set search_path = public
as $$
    with stages(status, position) as (values
        ('new', 1), ('contacted', 2), ('meeting_scheduled', 3), ('requirement_discussion', 4),
        ('proposal_sent', 5), ('negotiation', 6), ('won', 7), ('lost', 8)
    )
    select stages.status, count(leads.id), coalesce(sum(leads.estimated_value), 0)
    from stages
    left join public.leads on leads.status = stages.status
    group by stages.status, stages.position
    order by stages.position;
$$;

create or replace function public.crm_customers_directory()
returns table (
    customer_key text,
    customer_name text,
    phone text,
    email text,
    company_name text,
    total_opportunities bigint,
    won_value numeric,
    last_interaction timestamptz
)
language sql
stable
security invoker
set search_path = public
as $$
    select
        coalesce(nullif(lower(l.email), ''), nullif(l.phone, ''), lower(l.customer_name)) as customer_key,
        max(l.customer_name) as customer_name,
        max(l.phone) as phone,
        max(l.email) as email,
        max(l.company_name) as company_name,
        count(*) as total_opportunities,
        coalesce(sum(l.estimated_value) filter (where l.status = 'won'), 0) as won_value,
        max(l.updated_at) as last_interaction
    from public.leads l
    group by coalesce(nullif(lower(l.email), ''), nullif(l.phone, ''), lower(l.customer_name))
    order by max(l.updated_at) desc;
$$;

create or replace function public.crm_team_directory()
returns table (
    id uuid,
    full_name text,
    email text,
    role text,
    avatar_url text,
    active boolean,
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
        profiles.created_at,
        count(distinct leads.id) filter (where leads.status not in ('won', 'lost')) as active_leads,
        count(distinct tasks.id) filter (where tasks.status not in ('completed', 'cancelled')) as open_tasks
    from public.profiles
    left join public.leads on leads.assigned_to = profiles.id
    left join public.tasks on tasks.assigned_to = profiles.id
    group by profiles.id
    order by profiles.active desc, profiles.full_name, profiles.email;
$$;

revoke execute on function public.current_crm_role() from public, anon;
revoke execute on function public.can_access_lead(uuid, uuid) from public, anon;
revoke execute on function public.crm_dashboard_metrics() from public, anon;
revoke execute on function public.crm_pipeline_summary() from public, anon;
revoke execute on function public.crm_customers_directory() from public, anon;
revoke execute on function public.crm_team_directory() from public, anon;

grant execute on function public.current_crm_role() to authenticated;
grant execute on function public.can_access_lead(uuid, uuid) to authenticated;
grant execute on function public.crm_dashboard_metrics() to authenticated;
grant execute on function public.crm_pipeline_summary() to authenticated;
grant execute on function public.crm_customers_directory() to authenticated;
grant execute on function public.crm_team_directory() to authenticated;

comment on table public.profiles is 'CRM user profiles and extensible role assignments.';
comment on table public.leads is 'CRM opportunities. Future channel records should reference leads rather than storing messages here.';
comment on column public.leads.external_reference is 'Optional idempotency key for a future website or channel integration.';
comment on column public.leads.origin_metadata is 'Provider-neutral metadata for future lead ingestion; never store conversation messages here.';
