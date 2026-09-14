-- Testimonials are accessed through server routes. Emails and pending submissions
-- must never be exposed through the public Supabase REST API.
create table public.testimonials (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(btrim(name)) between 2 and 80),
    email text not null check (char_length(email) between 3 and 254),
    company text not null default '' check (char_length(company) <= 100),
    rating integer not null check (rating between 1 and 5),
    message text not null check (char_length(btrim(message)) between 20 and 1500),
    status text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
    publication_consent_at timestamptz not null default now(),
    created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;
revoke all on public.testimonials from anon, authenticated;
grant select, insert, update on public.testimonials to service_role;
create index testimonials_status_created_idx on public.testimonials (status, created_at desc);
create index testimonials_email_created_idx on public.testimonials (email, created_at desc);

-- Serialize concurrent submissions by email; rate limiting survives server restarts.
create function public.submit_testimonial(
    p_name text, p_email text, p_company text, p_rating integer, p_message text
) returns void language plpgsql set search_path = public as $$
begin
    perform pg_advisory_xact_lock(hashtextextended(lower(btrim(p_email)), 0));
    if exists (
        select 1 from public.testimonials
        where email = lower(btrim(p_email)) and created_at > now() - interval '24 hours'
    ) then
        raise exception 'Testimonial already submitted today' using errcode = 'P0001';
    end if;
    insert into public.testimonials (name, email, company, rating, message)
    values (btrim(p_name), lower(btrim(p_email)), btrim(p_company), p_rating, btrim(p_message));
end;
$$;
revoke all on function public.submit_testimonial(text, text, text, integer, text) from public, anon, authenticated;
grant execute on function public.submit_testimonial(text, text, text, integer, text) to service_role;
