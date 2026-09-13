-- Run after the bulk import. Requires additional disk for the text-search index.
create extension if not exists pg_trgm with schema extensions;

do $$
declare
    extension_schema text;
begin
    select n.nspname into extension_schema
    from pg_extension e join pg_namespace n on n.oid = e.extnamespace
    where e.extname = 'pg_trgm';

    execute format($index$
        create index if not exists whatsapp_lead_db_search_idx
        on public."whatsapp-lead-db" using gin ((lower(
            coalesce(name, '') || E'\n' || coalesce(contact_person, '') || E'\n' ||
            coalesce(business_name, '') || E'\n' || coalesce(company_name, '') || E'\n' ||
            coalesce(email, '') || E'\n' || coalesce(corporate_email, '') || E'\n' ||
            coalesce(company_email, '') || E'\n' || coalesce(phone, '') || E'\n' || coalesce(company_phone, '')
        )) %I.gin_trgm_ops)
    $index$, extension_schema);
end;
$$;

analyze public."whatsapp-lead-db";
