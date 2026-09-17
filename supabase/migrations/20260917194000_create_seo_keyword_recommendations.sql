create table if not exists public.seo_keyword_recommendations (
    id uuid primary key default gen_random_uuid(),
    keyword text not null,
    page_path text not null,
    opportunity text not null check (opportunity in ('high', 'medium', 'low')),
    reason text not null,
    suggested_title text not null,
    suggested_description text not null,
    suggested_heading text not null,
    suggested_copy text not null,
    source text not null default 'google_search_console',
    query_count integer not null default 0,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    reviewed_by uuid references public.profiles(id) on delete set null,
    reviewed_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists seo_keyword_recommendations_status_created_idx
    on public.seo_keyword_recommendations(status, created_at desc);

alter table public.seo_keyword_recommendations enable row level security;
