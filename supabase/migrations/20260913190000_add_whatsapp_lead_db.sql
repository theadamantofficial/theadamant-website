-- Purchased records, separate from operational CRM leads.
create table if not exists public."whatsapp-lead-db" (
    record_id bigint primary key,
    source_file text,
    source_sheet text,
    external_id text,
    name text,
    first_name text,
    last_name text,
    job_title text,
    business_name text,
    company_name text,
    contact_person text,
    email text,
    corporate_email text,
    company_email text,
    phone text,
    company_phone text,
    phone_type text,
    website text,
    linkedin_url text,
    address text,
    city text,
    state text,
    postal_code text,
    country text,
    industry text,
    sub_industry text,
    employees text,
    revenue text,
    location text,
    dataset_id text not null,
    source_record jsonb not null default '{}'::jsonb,
    constraint whatsapp_lead_db_positive_id check (record_id > 0)
);

-- One small import-status row avoids counting ten million records per request.
create table if not exists public.whatsapp_lead_db_import_status (
    id text primary key check (id = 'usa_leads'),
    dataset_id text not null,
    expected_count bigint not null check (expected_count >= 0),
    imported_count bigint not null default 0 check (imported_count >= 0),
    updated_at timestamptz not null default now()
);

alter table public."whatsapp-lead-db" enable row level security;
alter table public.whatsapp_lead_db_import_status enable row level security;
revoke all on public."whatsapp-lead-db" from anon, authenticated;
revoke all on public.whatsapp_lead_db_import_status from anon, authenticated;
grant select on public."whatsapp-lead-db", public.whatsapp_lead_db_import_status to authenticated;
grant all on public."whatsapp-lead-db", public.whatsapp_lead_db_import_status to service_role;

drop policy if exists whatsapp_lead_db_read on public."whatsapp-lead-db";
create policy whatsapp_lead_db_read on public."whatsapp-lead-db"
for select to authenticated
using ((select public.can_access_prospect_database()));

drop policy if exists whatsapp_lead_db_status_read on public.whatsapp_lead_db_import_status;
create policy whatsapp_lead_db_status_read on public.whatsapp_lead_db_import_status
for select to authenticated
using ((select public.can_access_prospect_database()));

create index if not exists whatsapp_lead_db_state_idx on public."whatsapp-lead-db" (lower(state), record_id);
create index if not exists whatsapp_lead_db_city_idx on public."whatsapp-lead-db" (lower(city), record_id);
create index if not exists whatsapp_lead_db_industry_idx on public."whatsapp-lead-db" (lower(industry), record_id);
create index if not exists whatsapp_lead_db_phone_idx on public."whatsapp-lead-db" (record_id)
where length(btrim(coalesce(phone, ''))) > 0 or length(btrim(coalesce(company_phone, ''))) > 0;

create or replace function public.query_whatsapp_lead_db(
    p_after bigint default 0,
    p_page_size integer default 50,
    p_search text default null,
    p_state text default null,
    p_city text default null,
    p_industry text default null,
    p_has_phone boolean default false
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
    clauses text := 'record_id > $1';
    search_pattern text;
    result_rows jsonb;
    result_total bigint;
    result_created_at text;
begin
    if not public.can_access_prospect_database() then
        raise exception 'You do not have access to the lead database' using errcode = '42501';
    end if;

    if nullif(btrim(p_search), '') is not null then
        search_pattern := '%' || lower(replace(replace(replace(left(btrim(p_search), 120),
            E'\\', E'\\\\'), '%', E'\\%'), '_', E'\\_')) || '%';
        clauses := clauses || $filter$
            and lower(
                coalesce(name, '') || E'\n' || coalesce(contact_person, '') || E'\n' ||
                coalesce(business_name, '') || E'\n' || coalesce(company_name, '') || E'\n' ||
                coalesce(email, '') || E'\n' || coalesce(corporate_email, '') || E'\n' ||
                coalesce(company_email, '') || E'\n' || coalesce(phone, '') || E'\n' || coalesce(company_phone, '')
            ) like $2 escape E'\\'
        $filter$;
    end if;
    if nullif(btrim(p_state), '') is not null then clauses := clauses || ' and lower(state) = lower($3)'; end if;
    if nullif(btrim(p_city), '') is not null then clauses := clauses || ' and lower(city) = lower($4)'; end if;
    if nullif(btrim(p_industry), '') is not null then clauses := clauses || ' and lower(industry) = lower($5)'; end if;
    if p_has_phone then
        clauses := clauses || ' and (length(btrim(coalesce(phone, ''''))) > 0 or length(btrim(coalesce(company_phone, ''''))) > 0)';
    end if;

    execute 'select coalesce(jsonb_agg(to_jsonb(page) order by record_id), ''[]''::jsonb)
             from (select record_id, source_file, source_sheet, external_id, name, first_name, last_name,
                          job_title, business_name, company_name, contact_person, email, corporate_email,
                          company_email, phone, company_phone, phone_type, website, linkedin_url, address,
                          city, state, postal_code, country, industry, sub_industry, employees, revenue, location
                   from public."whatsapp-lead-db" where ' || clauses || ' order by record_id limit $6) page'
    into result_rows
    using greatest(coalesce(p_after, 0), 0), search_pattern,
          left(btrim(p_state), 100), left(btrim(p_city), 100), left(btrim(p_industry), 100),
          least(greatest(coalesce(p_page_size, 50), 10), 100) + 1;

    select imported_count, dataset_id into result_total, result_created_at
    from public.whatsapp_lead_db_import_status where id = 'usa_leads';
    return jsonb_build_object(
        'rows', result_rows,
        'database', jsonb_build_object('total', coalesce(result_total, 0), 'createdAt', result_created_at)
    );
end;
$$;

revoke all on function public.query_whatsapp_lead_db(bigint, integer, text, text, text, text, boolean) from public, anon;
grant execute on function public.query_whatsapp_lead_db(bigint, integer, text, text, text, text, boolean) to authenticated;

comment on table public."whatsapp-lead-db" is 'Purchased USA records, read-only in the admin panel; operational CRM leads remain in public.leads.';
