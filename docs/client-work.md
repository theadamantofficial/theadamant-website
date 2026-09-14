# Project showcase

The homepage's **Our work** section is at `/#work`. Sign in as an admin or super
admin and use **Our projects** in the sidebar (`/admin/projects`) to add, edit,
publish, hide, or delete projects. Only published projects appear on the homepage.

## Database setup

Apply these migrations in order to the site's Supabase project:

1. `supabase/migrations/20260915120000_create_testimonials.sql`
2. `supabase/migrations/20260915140000_manage_projects_and_testimonials.sql`

Use the existing Supabase migration workflow or execute the migrations in the SQL
editor. The second migration creates the projects table, seeds the existing
PrepVista and AetherSEO entries, adds testimonial delete permission, and creates
the public `project_images` storage bucket. AetherSEO remains an in-house product.

Server configuration uses `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`) and
`SUPABASE_SECRET_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`), as in the CRM. Never expose
the service key in public environment variables. Admin sign-in uses the CRM's
existing Supabase public key configuration.

## Managing projects

Add a project name, category, label, description, optional HTTPS live link, and
optional screenshot. Upload JPG, PNG, WebP, or AVIF screenshots up to 4 MB, or
provide an HTTPS image URL or local `/images/` path. Screenshots require an
alternative description. Without a screenshot, a branded project cover appears.

Add up to eight highlights, one per line. Choose a cover theme and display order;
lower order numbers appear first. Save as **Draft** to prepare a project, then
**Publish** to display it. **Hide** removes it from subsequent homepage loads.
**Delete** permanently removes the project after confirmation. Deleting a project
does not delete its screenshot asset, which may be reused elsewhere.

The homepage reads projects from the database without static fallback entries, so
hidden or deleted projects do not reappear. Database RLS blocks direct anonymous
and authenticated table access. Server routes verify admin permissions before
reading private records or writing content and uploads.

## Verification

Run `npm test -- tests/projects.test.ts tests/content-admin-api.test.ts tests/project-upload-api.test.ts`.
After applying the migrations, add a draft project with a screenshot, publish it,
and reload the homepage. Check the screenshot, link, and category filter. Edit its
display order, hide it, then delete it and confirm it stays absent on reload.
