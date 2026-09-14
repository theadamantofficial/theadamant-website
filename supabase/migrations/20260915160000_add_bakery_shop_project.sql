-- Add the requested bakery project using its confirmed public website URL.
insert into public.projects (
    id, name, category, label, description, href, image, image_alt, highlights, theme, status, sort_order
)
select
    'e8849e03-7d26-4e12-8d6b-b759075a6571'::uuid,
    'Bakery Shop',
    'Websites',
    'Featured project',
    'A website project for a bakery, featured as part of our web development work.',
    'https://bakery-shop-beta.vercel.app/',
    '/images/work/bakery-shop.png',
    'Maison Miette bakery homepage',
    array['Bakery website'],
    'clay',
    'published',
    2
where not exists (
    select 1 from public.projects
    where lower(btrim(name)) = 'bakery shop'
)
on conflict (id) do nothing;
