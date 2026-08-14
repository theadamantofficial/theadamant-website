-- WhatsApp Cloud API conversations and messages for the internal CRM.
-- Provider writes use the server-only Supabase secret key. Signed-in CRM users
-- receive read access through RLS according to the existing role model.
create table if not exists public.whatsapp_conversations (
    id uuid primary key default gen_random_uuid(),
    whatsapp_business_account_id text,
    phone_number_id text not null,
    wa_id text not null,
    contact_name text not null default '',
    lead_id uuid references public.leads(id) on delete set null,
    assigned_to uuid references public.profiles(id) on delete set null,
    status text not null default 'open',
    unread_count integer not null default 0,
    customer_service_window_expires_at timestamptz,
    last_message_at timestamptz,
    last_message_preview text not null default '',
    last_message_direction text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint whatsapp_conversations_contact_unique unique (phone_number_id, wa_id),
    constraint whatsapp_conversations_status_valid check (status in ('open', 'closed')),
    constraint whatsapp_conversations_unread_non_negative check (unread_count >= 0),
    constraint whatsapp_conversations_direction_valid check (
        last_message_direction is null or last_message_direction in ('inbound', 'outbound')
    ),
    constraint whatsapp_conversations_phone_number_not_blank check (length(btrim(phone_number_id)) > 0),
    constraint whatsapp_conversations_wa_id_not_blank check (length(btrim(wa_id)) > 0)
);

create table if not exists public.whatsapp_messages (
    id uuid primary key default gen_random_uuid(),
    conversation_id uuid not null references public.whatsapp_conversations(id) on delete cascade,
    whatsapp_message_id text,
    direction text not null,
    message_type text not null default 'text',
    body text not null default '',
    media_id text,
    status text not null,
    error_code text,
    error_message text,
    sent_by uuid references public.profiles(id) on delete set null,
    message_timestamp timestamptz not null default now(),
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint whatsapp_messages_provider_id_unique unique (whatsapp_message_id),
    constraint whatsapp_messages_direction_valid check (direction in ('inbound', 'outbound')),
    constraint whatsapp_messages_status_valid check (status in ('queued', 'received', 'sent', 'delivered', 'read', 'failed')),
    constraint whatsapp_messages_type_not_blank check (length(btrim(message_type)) > 0)
);

create index if not exists whatsapp_conversations_assigned_last_idx
on public.whatsapp_conversations (assigned_to, last_message_at desc nulls last);

create index if not exists whatsapp_conversations_lead_idx
on public.whatsapp_conversations (lead_id);

create index if not exists whatsapp_messages_conversation_time_idx
on public.whatsapp_messages (conversation_id, message_timestamp, created_at);

drop trigger if exists set_whatsapp_conversations_updated_at on public.whatsapp_conversations;
create trigger set_whatsapp_conversations_updated_at
before update on public.whatsapp_conversations
for each row execute function public.set_crm_updated_at();

drop trigger if exists set_whatsapp_messages_updated_at on public.whatsapp_messages;
create trigger set_whatsapp_messages_updated_at
before update on public.whatsapp_messages
for each row execute function public.set_crm_updated_at();

create or replace function public.can_access_whatsapp_conversation(conversation_assigned_to uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select case
        when public.current_crm_role() in ('super_admin', 'admin') then true
        when public.current_crm_role() = 'employee' then auth.uid() = conversation_assigned_to
        else false
    end;
$$;

revoke all on function public.can_access_whatsapp_conversation(uuid) from public;
grant execute on function public.can_access_whatsapp_conversation(uuid) to authenticated;

alter table public.whatsapp_conversations enable row level security;
alter table public.whatsapp_messages enable row level security;

drop policy if exists whatsapp_conversations_select_accessible on public.whatsapp_conversations;
create policy whatsapp_conversations_select_accessible
on public.whatsapp_conversations for select to authenticated
using (public.can_access_whatsapp_conversation(assigned_to));

drop policy if exists whatsapp_messages_select_accessible on public.whatsapp_messages;
create policy whatsapp_messages_select_accessible
on public.whatsapp_messages for select to authenticated
using (
    exists (
        select 1
        from public.whatsapp_conversations conversation
        where conversation.id = whatsapp_messages.conversation_id
          and public.can_access_whatsapp_conversation(conversation.assigned_to)
    )
);

-- Keep a conversation's assignee aligned when an administrator reassigns the
-- linked lead from any CRM screen.
create or replace function public.sync_whatsapp_conversation_assignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if old.assigned_to is distinct from new.assigned_to then
        update public.whatsapp_conversations
        set assigned_to = new.assigned_to
        where lead_id = new.id;
    end if;
    return new;
end;
$$;

drop trigger if exists sync_whatsapp_assignment_from_lead on public.leads;
create trigger sync_whatsapp_assignment_from_lead
after update of assigned_to on public.leads
for each row execute function public.sync_whatsapp_conversation_assignment();

comment on table public.whatsapp_conversations is
'Role-aware WhatsApp Cloud API inbox conversations linked to CRM leads.';
comment on table public.whatsapp_messages is
'Inbound and outbound WhatsApp messages with provider delivery state.';
