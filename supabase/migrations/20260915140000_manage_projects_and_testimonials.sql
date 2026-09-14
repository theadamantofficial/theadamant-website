grant delete on public.testimonials to service_role;

create table public.projects (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(btrim(name)) between 2 and 100),
    category text not null check (category in ('Websites', 'Web apps', 'Mobile apps', 'UI/UX design')),
    label text not null check (char_length(btrim(label)) between 2 and 80),
    description text not null check (char_length(btrim(description)) between 20 and 1500),
    href text not null default '' check (char_length(href) <= 2000),
    image text not null default '' check (char_length(image) <= 2000),
    image_alt text not null default '' check (char_length(image_alt) <= 200),
    highlights text[] not null default '{}' check (cardinality(highlights) <= 8),
    theme text not null default 'teal' check (theme in ('teal', 'clay')),
    status text not null default 'draft' check (status in ('draft', 'published', 'hidden')),
    sort_order integer not null default 0 check (sort_order between 0 and 9999),
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
alter table public.projects enable row level security;
revoke all on public.projects from anon, authenticated;
grant select, insert, update, delete on public.projects to service_role;
create index projects_status_order_idx on public.projects (status, sort_order, created_at desc);

-- Preserve the initial showcase entries while moving management into admin.
insert into public.projects (name, category, label, description, href, highlights, theme, status, sort_order)
values
    ('PrepVista', 'Websites', 'Featured project',
     'Take a closer look at the PrepVista website and explore the live experience.',
     'https://prep-vista-five.vercel.app/', array['Website'], 'clay', 'published', 0),
    ('AetherSEO', 'Web apps', 'In-house product',
     'Our SEO workspace brings multilingual publishing, audits, and content operations together in one product.',
     'https://aetherseo.com/en', array['SEO audits', 'Multilingual publishing', 'Content workflows'], 'teal', 'published', 1);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project_images', 'project_images', true, 4194304,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set public = excluded.public,
    file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
-- Uploads use the service key after server-side admin authorization.
