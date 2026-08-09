-- Consolidate CRM access into the three supported roles.
update public.profiles
set role = 'employee'
where role in ('manager', 'sales');

update public.profiles
set role = 'employee'
where role = 'super_admin'
  and email <> 'admin@theadamant.com';

update public.profiles
set role = 'super_admin', active = true
where email = 'admin@theadamant.com';

alter table public.profiles alter column role set default 'employee';
alter table public.profiles drop constraint if exists profiles_role_valid;
alter table public.profiles add constraint profiles_role_valid
check (role in ('super_admin', 'admin', 'employee'));

alter table public.profiles drop constraint if exists profiles_super_admin_reserved;
alter table public.profiles add constraint profiles_super_admin_reserved
check (role <> 'super_admin' or email = 'admin@theadamant.com');

alter table public.profiles drop constraint if exists profiles_super_admin_active;
alter table public.profiles add constraint profiles_super_admin_active
check (role <> 'super_admin' or active = true);

alter table public.profiles drop constraint if exists profiles_reserved_email_role;
alter table public.profiles add constraint profiles_reserved_email_role
check (email <> 'admin@theadamant.com' or (role = 'super_admin' and active = true));

create unique index if not exists profiles_single_super_admin_idx
on public.profiles (role)
where role = 'super_admin';

-- Every new official company account starts as an employee. The reserved
-- company account is always restored as the single active super admin.
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
        case when lower(coalesce(new.email, '')) = 'admin@theadamant.com' then 'super_admin' else 'employee' end,
        lower(coalesce(new.email, '')) like '%@theadamant.com'
    )
    on conflict (id) do update
    set email = excluded.email,
        full_name = case when public.profiles.full_name = '' then excluded.full_name else public.profiles.full_name end,
        role = case
            when excluded.email = 'admin@theadamant.com' then 'super_admin'
            when public.profiles.role = 'super_admin' then 'employee'
            else public.profiles.role
        end,
        active = case when excluded.email = 'admin@theadamant.com' then true else public.profiles.active end;
    return new;
end;
$$;

create or replace function public.can_access_lead(lead_assigned_to uuid, lead_created_by uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select case
        when public.current_crm_role() in ('super_admin', 'admin') then true
        when public.current_crm_role() = 'employee' then auth.uid() = lead_assigned_to
        else false
    end;
$$;

-- Even if an employee bypasses the website UI and calls Supabase directly,
-- only the status column of a lead assigned to that employee may change.
create or replace function public.enforce_crm_lead_update_permissions()
returns trigger
language plpgsql
set search_path = public
as $$
declare
    actor_role text := public.current_crm_role();
begin
    if actor_role = 'employee' then
        if old.assigned_to is distinct from auth.uid()
            or new.assigned_to is distinct from auth.uid() then
            raise exception 'Employees can only update leads assigned to them'
                using errcode = '42501';
        end if;

        if (to_jsonb(new) - array['status', 'updated_at'])
            is distinct from
           (to_jsonb(old) - array['status', 'updated_at']) then
            raise exception 'Employees can only change lead status'
                using errcode = '42501';
        end if;
    elsif actor_role not in ('super_admin', 'admin') then
        raise exception 'CRM role cannot update leads'
            using errcode = '42501';
    end if;

    return new;
end;
$$;

drop trigger if exists enforce_crm_lead_update_permissions on public.leads;
create trigger enforce_crm_lead_update_permissions
before update on public.leads
for each row execute function public.enforce_crm_lead_update_permissions();

-- Only the super admin can change roles or deactivate accounts. Admins retain
-- a read-only team directory so they can assign leads and coordinate comments.
drop policy if exists profiles_update_admins on public.profiles;
drop policy if exists profiles_update_super_admin on public.profiles;
create policy profiles_update_super_admin on public.profiles for update to authenticated
using (public.current_crm_role() = 'super_admin')
with check (
    public.current_crm_role() = 'super_admin'
    and (email <> 'admin@theadamant.com' or (role = 'super_admin' and active = true))
);

drop policy if exists leads_insert_crm_users on public.leads;
create policy leads_insert_crm_users on public.leads for insert to authenticated
with check (
    created_by = auth.uid()
    and public.current_crm_role() in ('super_admin', 'admin')
);

drop policy if exists leads_update_accessible on public.leads;
create policy leads_update_accessible on public.leads for update to authenticated
using (public.can_access_lead(assigned_to, created_by))
with check (public.can_access_lead(assigned_to, created_by));

drop policy if exists notes_update_own_or_managers on public.lead_notes;
drop policy if exists notes_update_own_or_admins on public.lead_notes;
create policy notes_update_own_or_admins on public.lead_notes for update to authenticated
using (created_by = auth.uid() or public.current_crm_role() in ('super_admin', 'admin'))
with check (created_by = auth.uid() or public.current_crm_role() in ('super_admin', 'admin'));

drop policy if exists tasks_select_accessible on public.tasks;
create policy tasks_select_accessible on public.tasks for select to authenticated
using (
    public.current_crm_role() in ('super_admin', 'admin')
    or assigned_to = auth.uid()
);

drop policy if exists tasks_insert_crm_users on public.tasks;
create policy tasks_insert_crm_users on public.tasks for insert to authenticated
with check (
    created_by = auth.uid()
    and public.current_crm_role() in ('super_admin', 'admin')
);

drop policy if exists tasks_update_accessible on public.tasks;
create policy tasks_update_accessible on public.tasks for update to authenticated
using (public.current_crm_role() in ('super_admin', 'admin'))
with check (public.current_crm_role() in ('super_admin', 'admin'));

drop policy if exists activities_insert_crm_users on public.activities;

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
    where public.current_crm_role() in ('super_admin', 'admin')
    group by profiles.id
    order by profiles.active desc, profiles.full_name, profiles.email;
$$;

comment on column public.profiles.role is 'CRM role: one reserved super_admin, multiple admins, or multiple employees.';
