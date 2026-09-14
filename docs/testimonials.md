# Testimonials

The homepage includes a testimonial section at `/#testimonials`, a form at
`/#write-testimonial`, and a link to the supplied Google profile. The Google link
opens in a new tab and is also offered after saving a testimonial. Website
testimonials are stored separately from Google reviews.

## Database setup

Apply `supabase/migrations/20260915120000_create_testimonials.sql`, followed by
`supabase/migrations/20260915140000_manage_projects_and_testimonials.sql`, to the
site's Supabase project. Use the existing migration workflow or the SQL editor.
The second migration enables testimonial deletion and project management.

The server uses the same connection as the CRM:

- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` (server only)

Admin sign-in additionally requires the CRM's existing Supabase public key.
Never expose the service key through a `NEXT_PUBLIC_` variable.

## Publishing

Submissions start as pending. Sign in to `/admin/testimonials` with an admin or
super admin account and select **Approve & publish**. Approved testimonials appear
when visitors load the homepage. **Hide** removes a testimonial from subsequent
homepage loads. Hidden testimonials can be approved again.

Only the name, company, rating, message, and submission date are returned by the
public endpoint. Email and publication consent timestamps stay in the database.
Database RLS blocks direct anonymous and authenticated access; the server checks
admin permissions before accessing private submissions.

The form requires publication consent, validates field lengths and ratings, and
includes a hidden spam field. The database permits one submission per email in a
24-hour period, including concurrent requests across server instances.

## Verification

Run `npm test -- tests/testimonials.test.ts tests/testimonials-api.test.ts`.
After applying the migration, submit a testimonial, confirm it is pending in the
admin page, approve it, then reload the homepage and confirm it appears. Verify
that hiding it removes it on reload and that the Google button opens the supplied
link. A failed database write must show an error rather than a success message.

## Adding and editing in admin

Use **Add testimonial** at `/admin/testimonials` to enter client feedback directly.
Provide the name, private email, optional company, star rating, and testimonial,
confirm the client agreed to publication, and choose pending, approved, or hidden.
Use **Edit** to change details and visibility. **Delete** permanently removes a
testimonial after confirmation. Public form submissions still begin as pending
and retain the database's submission rate limit.
