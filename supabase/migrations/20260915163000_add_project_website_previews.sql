-- Attach real screenshots captured from each project's public website.
-- Preserve screenshots that have already been customized through admin.
update public.projects
set image = '/images/work/prepvista.png',
    image_alt = 'PrepVista test preparation website homepage',
    updated_at = now()
where href = 'https://prep-vista-five.vercel.app/' and image = '';

update public.projects
set image = '/images/work/aetherseo.png',
    image_alt = 'AetherSEO search workflow platform homepage',
    updated_at = now()
where href = 'https://aetherseo.com/en' and image = '';

-- Also handle a bakery entry created before its public URL was confirmed.
update public.projects
set href = 'https://bakery-shop-beta.vercel.app/', updated_at = now()
where id = 'e8849e03-7d26-4e12-8d6b-b759075a6571'::uuid and href = '';

update public.projects
set image = '/images/work/bakery-shop.png',
    image_alt = 'Maison Miette bakery homepage',
    updated_at = now()
where href = 'https://bakery-shop-beta.vercel.app/' and image = '';
