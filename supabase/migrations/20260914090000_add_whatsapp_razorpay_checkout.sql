-- Extend the existing payment history; checkout tokens grant access only through
-- the server's limited customer checkout routes. Existing native UPI orders remain valid.
alter table public.whatsapp_payment_orders
    add column if not exists checkout_token text,
    add column if not exists razorpay_order_id text,
    add column if not exists razorpay_payment_id text;

create unique index if not exists whatsapp_payment_orders_checkout_token_idx
    on public.whatsapp_payment_orders(checkout_token) where checkout_token is not null;
create unique index if not exists whatsapp_payment_orders_razorpay_order_idx
    on public.whatsapp_payment_orders(razorpay_order_id) where razorpay_order_id is not null;
create unique index if not exists whatsapp_payment_orders_razorpay_payment_idx
    on public.whatsapp_payment_orders(razorpay_payment_id) where razorpay_payment_id is not null;
