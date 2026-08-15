# The Adamant Website

## Local development

1. Copy `env.sample` to `.env.local` and configure the required services.
2. Run `npm install`.
3. Run `npm run dev`.

The internal blog uses the repository JSON file when `BLOG_STORAGE_MODE=filesystem`.

## Supabase blog deployment

Blog records are stored in Supabase in production. Optional uploaded covers are stored in the public `blog_images`
Supabase Storage bucket; posts without an uploaded image use a deterministic generated cover.

1. Link the intended Supabase project with the Supabase CLI.
2. Apply the tracked migrations with `supabase db push`. This creates `blog_posts` and enables persisted HTTPS cover URLs.
3. Add these server-only Vercel environment variables to Production and Preview:
   - `BLOG_STORAGE_MODE=supabase`
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
   - `SUPABASE_BLOG_COVERS_BUCKET=blog_images`
4. In Supabase Storage, configure `blog_images` as a public bucket with a 5 MB file limit and these allowed MIME types:
   - `image/jpeg`
   - `image/png`
   - `image/webp`
   - `image/avif`

The bucket is public only for reading published blog images. Uploads and deletes run through the cookie-authenticated
server API using `SUPABASE_SECRET_KEY`, so no browser upload/delete policies are required and the secret is never sent
to the client.

5. Preview the repository seed import:

   ```bash
   npm run blog:import -- src/content/internal-blog-posts.json
   ```

6. Apply it while creating a non-overwriting backup of the current Supabase rows:

   ```bash
   npm run blog:import -- src/content/internal-blog-posts.json --apply --backup=/absolute/secure/path/blog-posts-before-seed.json
   ```

The importer always defaults to dry-run. It merges by post ID, keeps the newest matching record, preserves recovered
historical slugs, renames conflicting interim slugs, discards historical Vercel Blob cover URLs, preserves current
Supabase cover URLs, and verifies the final database row count.

## Internal CRM at `/admin`

Phase 1 of the internal CRM lives inside this Next.js application. Public routes are unchanged; the `/admin` route tree
has its own protected layout and uses Supabase Auth plus PostgreSQL row-level security.

1. Configure these Vercel and local environment values:
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY` (server-only and still used by the existing blog storage)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `SUPABASE_PUBLISHABLE_KEY`
2. Apply tracked migrations with `supabase db push`. The CRM migration creates profiles, leads, notes, tasks,
   activities, indexes, analytics functions, automatic activity tracking, and RLS policies.
3. Create company users manually in Supabase Authentication. A profile is created automatically. Company-domain users
   are active by default; users outside the company domain are disabled. `admin@theadamant.com` is permanently reserved
   as the super admin.
4. For development-only sample records, run `supabase db reset` so `supabase/seed.sql` inserts twelve realistic leads.
   Do not run the seed against production.

CRM sessions are stored only in secure, HTTP-only cookies. Normal CRM data requests use the signed-in user's Supabase
access token, so RLS remains authoritative. The Supabase secret key is never sent to the browser.

Public contact-form, website-audit, and completed SEO-chat submissions are also captured as unassigned CRM leads.
This server-side capture uses `SUPABASE_SECRET_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`) and runs independently from the
existing EmailJS, Firebase, n8n, and Discord flows. A CRM capture failure therefore does not suppress the existing
email or Discord notification. Website references are deduplicated through `leads.external_reference`.

### External USA lead database

The protected `/admin/prospects` section reads the supplied SQLite database directly in read-only mode. Configure
`USA_LEADS_DATABASE_PATH` with an absolute path that is mounted on every production application instance. Because the
source currently contains more than ten million records (about 5.3 GB), it is intentionally not bundled in Git or
copied into the operational CRM tables.

Super admins and admins always have access. Either role can grant or remove access for an employee in the Team screen.
That permission is enforced in both the page and API. Initiating a WhatsApp message opens the standard `wa.me` flow
and writes an auditable `prospect_outreach_events` record. The table already includes CRM lead and provider message
fields so a future WhatsApp Business API integration can update delivery status without replacing this workflow.

Apply the latest Supabase migration before using this feature:

```bash
supabase db push
```

### WhatsApp Cloud API inbox

The protected `/admin/whatsapp` screen stores inbound Meta WhatsApp messages, links a new sender to an unassigned CRM
lead, lets administrators assign the linked lead and conversation, and lets the assigned employee reply during Meta's
24-hour customer-service window. Delivery, read, and failure webhooks update the message status in the inbox. Existing
website email, Firebase, n8n, and Discord notification flows are unchanged.

1. Apply the WhatsApp tables and role-aware RLS policies:

   ```bash
   supabase db push
   ```

2. Add these server-only values in Vercel for Production and Preview, then redeploy:
   - `META_APP_ID`
   - `META_APP_SECRET`
   - `WHATSAPP_ACCESS_TOKEN` (a permanent system-user token, not the temporary test token)
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_BUSINESS_ACCOUNT_ID`
   - `WHATSAPP_WEBHOOK_VERIFY_TOKEN` (a new random value that is also entered in Meta)
   - `WHATSAPP_GRAPH_API_VERSION=v25.0`
   - `WHATSAPP_PAYMENT_CONFIGURATION=Adamant.Technologies` (optional override; the current Adamant configuration is the default and the value must exactly match WhatsApp Manager)
   - `WHATSAPP_AUTO_REPLY_ENABLED=true` (optional; defaults to enabled)
   - `WHATSAPP_AUTO_REPLY_MESSAGE` (optional; overrides the default first-contact acknowledgement)
   - `WHATSAPP_AUTO_REPLY_GAP_HOURS=48` (optional; minimum time between acknowledgements for a returning contact)

3. In the Meta app's WhatsApp webhook configuration, use:
   - Callback URL: `https://theadamant.com/api/webhooks/whatsapp`
   - Verify token: the exact value stored as `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
4. Click **Verify and save**, subscribe the WhatsApp Business Account to webhooks, and subscribe the `messages` field.
5. Publish the Meta app. Unpublished apps only deliver dashboard test webhooks.

The inbox automatically acknowledges a contact's first inbound message, then acknowledges them again only when their
previous message was at least 48 hours earlier. It does not reply to ordinary follow-up messages. Set
`WHATSAPP_AUTO_REPLY_ENABLED=false` to disable it, customize the wording with `WHATSAPP_AUTO_REPLY_MESSAGE`, or change
the return gap with `WHATSAPP_AUTO_REPLY_GAP_HOURS` (for example, `72` for three days).

The webhook also answers the WhatsApp Manager ice breakers for services, website development, mobile apps, and
quotations. The `/services`, `/website`, `/app`, `/quote`, `/portfolio`, `/contact`, and `/support` commands receive an
immediate informational reply every time they are sent. These command replies use the same `WHATSAPP_AUTO_REPLY_ENABLED`
switch as the first-contact acknowledgement.

Webhook POST requests are accepted only when the `x-hub-signature-256` HMAC matches `META_APP_SECRET`. Access tokens,
the app secret, and the webhook verify token are never returned to the browser. The CRM Settings screen reports only
whether each value exists and provides the public callback URL.

Inbound WhatsApp audio messages are played through a signed-in CRM-only proxy. The server uses the stored media ID to
request a fresh, short-lived download URL from Meta and streams the audio without exposing `WHATSAPP_ACCESS_TOKEN` to
the browser. This uses the same permanent token and `whatsapp_business_messaging` permission as the messaging setup.

WhatsApp payment orders are available to administrators and to the employee assigned to the conversation. Staff can
save and edit drafts, control line items, tax, discounts, expiry and the final INR amount, and send Meta `order_details`
messages through the active payment configuration. Sent amounts are immutable. Payment confirmation is deliberately
manual: staff must first verify the reference and amount in Razorpay or the settlement account, then use **Confirm
paid** to notify the customer and move the order to processing. Apply
`supabase/migrations/20260815093000_add_whatsapp_payment_orders.sql` before using these controls.

## Vercel Blob recovery on 27 August 2026

After the suspended store becomes readable, download `blog/internal-blog-posts.json` without deleting or modifying the Blob store. Run the importer against that downloaded file first in dry-run mode and then with `--apply` plus a new backup path. Keep the source export and Blob store until the final count and historical blog URLs have been checked.

## Verification

Run:

```bash
npm test
npm run lint
npm run build
```
