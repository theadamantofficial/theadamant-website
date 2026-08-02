alter table public.blog_posts
    drop constraint if exists blog_posts_generated_cover_only;

alter table public.blog_posts
    add constraint blog_posts_cover_image_https
    check (cover_image is null or cover_image ~ '^https://');

comment on table public.blog_posts is
    'Internal website blog posts. Access is server-only through a Supabase secret key; optional cover images are stored in Supabase Storage.';

comment on column public.blog_posts.cover_image is
    'Public HTTPS URL for an optional image in the configured Supabase blog cover bucket.';
