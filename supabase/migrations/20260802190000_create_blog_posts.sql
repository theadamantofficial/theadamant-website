create table if not exists public.blog_posts (
    id uuid primary key,
    slug text not null unique,
    title text not null,
    seo_title text,
    excerpt text not null,
    content text not null,
    cover_image text,
    tags text[] not null default '{}',
    author_name text not null default 'The Adamant Team',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    published_at timestamptz not null default now(),
    constraint blog_posts_slug_not_blank check (length(btrim(slug)) > 0),
    constraint blog_posts_title_not_blank check (length(btrim(title)) > 0),
    constraint blog_posts_content_not_blank check (length(btrim(content)) > 0),
    constraint blog_posts_generated_cover_only check (cover_image is null)
);

create index if not exists blog_posts_published_at_idx
    on public.blog_posts (published_at desc);

alter table public.blog_posts enable row level security;

comment on table public.blog_posts is
    'Internal website blog posts. Access is server-only through a Supabase secret key; generated covers are not stored.';
