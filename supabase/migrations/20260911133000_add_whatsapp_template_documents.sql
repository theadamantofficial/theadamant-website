create table if not exists public.whatsapp_template_documents (
    id uuid primary key default gen_random_uuid(),
    media_id text not null unique,
    filename text not null,
    uploaded_by uuid not null references public.profiles(id) on delete restrict,
    created_at timestamptz not null default now(),
    constraint whatsapp_template_documents_filename_not_blank check (length(btrim(filename)) > 0)
);

create index if not exists whatsapp_template_documents_created_at_idx
on public.whatsapp_template_documents (created_at desc);

alter table public.whatsapp_template_documents enable row level security;

drop policy if exists whatsapp_template_documents_select_access on public.whatsapp_template_documents;
create policy whatsapp_template_documents_select_access
on public.whatsapp_template_documents for select to authenticated
using (public.current_crm_role() is not null);

comment on table public.whatsapp_template_documents is
'Previously uploaded Meta WhatsApp PDF media available to CRM template composers.';
