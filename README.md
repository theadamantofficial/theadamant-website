# The Adamant Website

## Local development

1. Copy `env.sample` to `.env.local` and configure the required services.
2. Run `npm install`.
3. Run `npm run dev`.

The internal blog uses the repository JSON file when `BLOG_STORAGE_MODE=filesystem`.

## Supabase blog deployment

Blog records are stored in Supabase in production. Covers are deterministic SVG data URLs and do not use file storage.

1. Link the intended Supabase project with the Supabase CLI.
2. Apply `supabase/migrations/20260802190000_create_blog_posts.sql` with `supabase db push`.
3. Add these server-only Vercel environment variables to Production and Preview:
   - `BLOG_STORAGE_MODE=supabase`
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
4. Preview the repository seed import:

   ```bash
   npm run blog:import -- src/content/internal-blog-posts.json
   ```

5. Apply it while creating a non-overwriting backup of the current Supabase rows:

   ```bash
   npm run blog:import -- src/content/internal-blog-posts.json --apply --backup=/absolute/secure/path/blog-posts-before-seed.json
   ```

The importer always defaults to dry-run. It merges by post ID, keeps the newest matching record, preserves recovered historical slugs, renames conflicting interim slugs, clears stored cover URLs, and verifies the final database row count.

## Vercel Blob recovery on 27 August 2026

After the suspended store becomes readable, download `blog/internal-blog-posts.json` without deleting or modifying the Blob store. Run the importer against that downloaded file first in dry-run mode and then with `--apply` plus a new backup path. Keep the source export and Blob store until the final count and historical blog URLs have been checked.

## Verification

Run:

```bash
npm test
npm run lint
npm run build
```
