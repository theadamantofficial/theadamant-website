-- Draftable WhatsApp payment orders. All mutations are performed by protected
-- server routes after an RLS-backed conversation access check. Signed-in users
-- can only read orders for conversations allowed by their CRM role/assignment.
create table if not exists public.whatsapp_payment_orders (
    id uuid primary key default gen_random_uuid(),
    conversation_id uuid not null references public.whatsapp_conversations(id) on delete cascade,
    reference_id text not null unique,
    body text not null,
    footer text not null default '',
    items jsonb not null default '[]'::jsonb,
    subtotal_paise bigint not null,
    tax_paise bigint not null default 0,
    discount_paise bigint not null default 0,
    total_paise bigint not null,
    currency text not null default 'INR',
    quick_pay boolean not null default false,
    expires_in_minutes integer not null default 1440,
    status text not null default 'draft',
    whatsapp_message_id text,
    last_status_message_id text,
    last_status_description text,
    last_error text,
    created_by uuid references public.profiles(id) on delete set null,
    updated_by uuid references public.profiles(id) on delete set null,
    sent_at timestamptz,
    payment_confirmed_at timestamptz,
    completed_at timestamptz,
    canceled_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint whatsapp_payment_orders_reference_valid check (reference_id ~ '^[A-Za-z0-9_.-]{1,35}$'),
    constraint whatsapp_payment_orders_body_valid check (length(btrim(body)) between 1 and 1024),
    constraint whatsapp_payment_orders_footer_valid check (length(footer) <= 60),
    constraint whatsapp_payment_orders_items_array check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 10),
    constraint whatsapp_payment_orders_amounts_valid check (
        subtotal_paise > 0 and tax_paise >= 0 and discount_paise >= 0 and
        total_paise = subtotal_paise + tax_paise - discount_paise and total_paise > 0
    ),
    constraint whatsapp_payment_orders_currency_valid check (currency = 'INR'),
    constraint whatsapp_payment_orders_expiry_valid check (expires_in_minutes between 5 and 43200),
    constraint whatsapp_payment_orders_status_valid check (
        status in ('draft', 'sending', 'pending', 'processing', 'completed', 'canceled')
    )
);

create index if not exists whatsapp_payment_orders_conversation_created_idx
on public.whatsapp_payment_orders (conversation_id, created_at desc);

drop trigger if exists set_whatsapp_payment_orders_updated_at on public.whatsapp_payment_orders;
create trigger set_whatsapp_payment_orders_updated_at
before update on public.whatsapp_payment_orders
for each row execute function public.set_crm_updated_at();

alter table public.whatsapp_payment_orders enable row level security;

drop policy if exists whatsapp_payment_orders_select_accessible on public.whatsapp_payment_orders;
create policy whatsapp_payment_orders_select_accessible
on public.whatsapp_payment_orders for select to authenticated
using (
    exists (
        select 1
        from public.whatsapp_conversations conversation
        where conversation.id = whatsapp_payment_orders.conversation_id
          and public.can_access_whatsapp_conversation(conversation.assigned_to)
    )
);

comment on table public.whatsapp_payment_orders is
'Audited WhatsApp UPI payment drafts and customer-visible order status updates.';
