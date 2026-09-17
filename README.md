# The Adamant Website

## Local development

1. Copy `env.sample` to `.env.local` and configure the required services.
2. Run `npm install`.
3. Run `npm run dev`.

The internal blog uses the repository JSON file when `BLOG_STORAGE_MODE=filesystem`.

## Development and production deployments

The repository deploys through Vercel using the following branch environments:

- `dev`: deploys to the Vercel Preview environment.
- `master`: deploys to the Vercel Production environment.

The GitHub Actions workflow requires these repository secrets:

- `VERCEL_TOKEN`: a Vercel access token.
- `VERCEL_ORG_ID`: the Vercel team or account ID.
- `VERCEL_PROJECT_ID`: the Vercel project ID.

Create matching GitHub Environments named `development` and `production`, then add
environment-specific secrets and variables in Vercel. Keep test services and test
payment keys in the `development`/Preview environment, and live services and live
payment keys in the `production` environment. Never commit `.env`, `.env.local`, or
server-only credentials.

To create the development branch locally:

```bash
git branch dev
git push -u origin dev
```

After the branch is pushed, every subsequent push to `dev` deploys a Preview build.
Every push to `master` deploys a Production build.

## Website analytics and crash alerts

Firebase project `adamant-3eada` sends public website analytics to the Google Analytics web stream
with measurement ID `G-GTL1BQJ71E`. Google Tag Manager container `GTM-PFTRSVCF` is installed in the root layout,
with its script in the head and its noscript iframe at the start of the body.
The application sends `page_view`, `section_view`, `contact_click`, and successful contact-form
`generate_lead` events. Custom events exclude form values and URL queries. Firebase Analytics
events exclude `/admin` and `/tear-preview`. Content blockers and unsupported browsers are
handled without affecting the website.

Google Ads contact conversions use the `conversion_event_contact` event supplied by the CONTACT
conversion action. It fires after a successful contact-form submission and on public email, phone,
or WhatsApp contact links. Same-window contact navigation waits for the event callback for up to
two seconds; new-tab contact links report without changing their normal browser behavior.

After a visitor completes or skips the homepage tear intro, the completion time is stored in that
browser and the intro remains hidden for 25 days. It becomes eligible to appear again after that
period. Direct section links bypass it, and `/tear-preview` always shows it for testing.

Telemetry is enabled by default in production. Set `NEXT_PUBLIC_TELEMETRY_ENABLED=true` to
verify locally or `false` to disable analytics, Tag Manager, and crash alerts. Public environment
changes require rebuilding the application.

In Google Analytics, open Admin → Data streams → the web stream for `G-GTL1BQJ71E`, and
disable Enhanced measurement. This application sends its own page views and contact events;
automatic history/form events can duplicate those events or collect raw URLs. In Tag Manager,
publish the intended container changes, and avoid a second Google tag targeting `G-GTL1BQJ71E`.
Other marketing tags can be managed through this container.

Firebase Crashlytics has no web SDK. Website crash alerts instead use browser error and
unhandled-rejection listeners, React error boundaries, and Next.js `onRequestError` for uncaught
server errors. They do not create issues in the Firebase Crashlytics dashboard, detect complete
browser/process crashes, or automatically capture exceptions that application code handles.

To receive alerts, create a webhook in a private `#website-crashes` channel in the Adamant Discord
server (Edit Channel → Integrations → Webhooks), then set the server-only
`DISCORD_CRASH_WEBHOOK_URL` in local and deployment environment settings. Alerts include
sanitized error messages/stacks, route, environment, release, and Next.js error reference.
Never put this URL in a `NEXT_PUBLIC_` variable. Until a webhook is configured, crash delivery
is disabled. Reports strip URL queries, emails, and common credentials, but avoid including
customer data in thrown errors.

The browser limits reports to ten per page load. The endpoint checks origins, validates reports,
limits body size and requests, and the Discord sender groups repeated errors for five minutes
and caps alerts at twenty per minute. Server limits are per instance, so separate serverless
instances can each send an alert for the same issue. Discord delivery failures never interrupt
the website. No durable crash database is created by this integration.

After deployment, check Google Analytics Realtime and Tag Manager Preview. To verify a crash
alert in a local browser with telemetry enabled and a webhook configured, run
`setTimeout(() => { throw new Error("Adamant crash notification test"); }, 0)` in DevTools.

### Analytics reports in the admin portal

Administrators and super admins can open `/admin/analytics` from the sidebar or CRM dashboard.
The server reads Google Analytics Data API reports with the `analytics.readonly` scope. The page
shows distinct users, sessions, page views, engagement, a daily chart/table, top pages, traffic
channels, countries, devices, tracked contact/section events, and recent active web users.

Configure these server-only environment variables in local and deployment settings:

- `GOOGLE_ANALYTICS_PROPERTY_ID`: the numeric GA4 Property ID from Admin → Property details.
  This is different from measurement ID `G-GTL1BQJ71E`, the Firebase project ID, and GTM container ID.
- `GOOGLE_ANALYTICS_AUTH_MODE`: `service-account` (default) or `adc` for Application Default Credentials.
- `GOOGLE_ANALYTICS_SERVICE_ACCOUNT_JSON`: the full JSON key for a Google Cloud service account.
  Enable the Google Analytics Data API in its project and grant the service-account email the
  Viewer role under Google Analytics → Property access management.
- `GOOGLE_ANALYTICS_STREAM_ID` (optional): the numeric web Stream ID from Admin → Data streams.
  This filters reports to that stream, including realtime. Without it, historical reports are
  still filtered to `theadamant.com` / `www.theadamant.com`, while the recent visitors card
  explicitly counts all web streams in the selected property.

For local development with your Google account, set `GOOGLE_ANALYTICS_AUTH_MODE=adc` and run:

```bash
gcloud auth application-default login --scopes="https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/analytics.readonly"
```

Complete the browser sign-in with an account that can view the GA4 property, then restart the
local website. ADC mode uses Google's authentication library to load and refresh the credentials;
`GOOGLE_ANALYTICS_SERVICE_ACCOUNT_JSON` is not needed in this mode. You still need the numeric
`GOOGLE_ANALYTICS_PROPERTY_ID` and an enabled Analytics Data API. A login on your Mac does not
configure a separately deployed server: configure that server with its own service account or
supported ADC identity. Restart after changing the ADC login account.

Missing/invalid credentials show connection instructions; the app does not manufacture sample
analytics. Credentials and access tokens are never returned to the browser. The API and page both
enforce administrator access, and API responses use private/no-store headers. Report requests
are coalesced and cached for sixty seconds per property, credentials, stream, and reporting period
within each server instance to limit Google quotas. Errors explain missing access, disabled API,
or exhausted quotas without exposing Google's raw authentication responses.

Historical periods cover the last 7, 30, or 90 complete days through yesterday using the GA4
property's timezone. Distinct users come from Google's period aggregate, rather than summing
daily users. CRM pages and other hosts are excluded. Empty periods show zero reported activity;
failed requests show an error. A failed realtime request leaves historical reports available.

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

For CRM password recovery, add `https://theadamant.com/admin/reset-password` to the allowed redirect URLs in
Supabase Auth. The login screen sends recovery email only to valid `@theadamant.com` addresses and the recovery page
requires Supabase's short-lived access and refresh tokens before accepting a new password.

Public contact-form, website-audit, and completed SEO-chat submissions are also captured as unassigned CRM leads.
This server-side capture uses `SUPABASE_SECRET_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`) and runs independently from the
existing EmailJS, Firebase, n8n, and Discord flows. A CRM capture failure therefore does not suppress the existing
email or Discord notification. Website references are deduplicated through `leads.external_reference`.

### External USA lead database

To import the purchased records into the separate production Supabase table
`whatsapp-lead-db`, follow [the production setup steps](docs/import-whatsapp-lead-db.md).
To send client proposals by email with the supplied PDF, follow
[the EmailJS proposal setup](docs/client-proposal-email.md).
The importer defaults to a local preview and supports batched, resumable writes.
Use `PROSPECT_DATABASE_MODE=supabase` in production and deploy the updated reader.

The protected `/admin/prospects` section reads the purchased Supabase database in
production. Local SQLite access remains available with `PROSPECT_DATABASE_MODE=sqlite`
and `USA_LEADS_DATABASE_PATH` pointing to the mounted source. More than ten million
records (about 5.3 GB in SQLite) are kept outside Git and the operational CRM tables.

Super admins and admins always have access. Either role can grant or remove access for an employee in the Team screen.
That permission is enforced in both the page and API. WhatsApp actions send through the connected Business API
and store messages in the CRM inbox. The Email action sends a reviewed client proposal with its PDF attachment
through the existing EmailJS service. Both channels write auditable `prospect_outreach_events` records.

Apply the latest Supabase migration before using this feature:

```bash
supabase db push
```

### WhatsApp Cloud API inbox

The protected `/admin/whatsapp` screen stores inbound Meta WhatsApp messages, links a new sender to an unassigned CRM
lead, lets administrators assign the linked lead and conversation, and lets the assigned employee reply during Meta's
24-hour customer-service window. Delivery, read, and failure webhooks update the message status in the inbox. Existing
website email, Firebase, n8n, and Discord notification flows are unchanged.

While that reply window is open, the composer can also upload and send one JPG/PNG image (up to 5 MB) or PDF, text,
Word, Excel, or PowerPoint document (up to 10 MB), with an optional translated caption. Files larger than the direct
request limit are staged temporarily in the private `whatsapp-outbound-media` Supabase bucket, uploaded to Meta using
the server-only access token, and then removed from temporary storage. Apply the tracked migrations before using this.

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
save and edit drafts, control line items, tax, discounts, expiry and the final INR amount (minimum ₹1), then use
**Send payment** to send a secure `/pay/<token>` checkout link in WhatsApp during the open 24-hour reply window.
Sent amounts are immutable. The customer clicks **Pay** to open Razorpay Standard Checkout. Successful payments move
the existing CRM order to **Payment confirmed** only after server-side signature, order, amount, currency and capture
checks. **Open checkout** opens the same customer page; refresh payment history to see the latest confirmation.
Completion/cancellation updates for these orders are sent as WhatsApp text messages. Historical native UPI requests
retain their original manual confirmation/status flow.

Apply `supabase/migrations/20260815093000_add_whatsapp_payment_orders.sql` if not already installed, then
`supabase/migrations/20260914090000_add_whatsapp_razorpay_checkout.sql`. The new migration adds columns/indexes to the
existing table; it does not create a new table. Configure the existing Supabase and Meta WhatsApp server credentials,
plus `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `NEXT_PUBLIC_RAZORPAY_KEY_ID` in `.env` locally and in your deployment
environment. The two key IDs must match. Never give the secret a `NEXT_PUBLIC_` prefix. `.env` is ignored by Git.
Set `NEXT_PUBLIC_SITE_URL` to the publicly reachable deployment origin so the customer can open links from WhatsApp.

For testing, use Razorpay test keys and run `npm run dev`. Sign in at `/admin/login`, open a WhatsApp conversation
with an active reply window, save/send an order of at least ₹1, open the received link, and click **Pay**. Follow
[Razorpay's Standard Checkout testing instructions](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/)
to simulate success/failure. Also close the modal to test cancellation. Configure automatic capture in the Razorpay
dashboard; authorized payments are not marked paid until captured. If verification fails after payment, use
**Retry payment verification** without paying again. The browser keeps the response in session storage for refresh
recovery. Verification accepts already-completed payments and payments made before link expiry, and is idempotent.

`POST /api/create-order` accepts `{token}` and returns `{order_id, amount, currency}`; the server derives the price
and receipt from the stored WhatsApp order and reuses its provider order ID. `POST /api/verify-payment` accepts
`{token, razorpay_payment_id, razorpay_order_id, razorpay_signature}`. Customer endpoints require the unguessable
payment-link token, not a CRM login. Invalid/missing signatures return 400 without changing payment status;
Razorpay authentication errors return 401 and other Razorpay API failures return 500. CRM users cannot manually mark
new checkout orders paid. This integration verifies through the Checkout callback; it does not add Razorpay webhooks.
If the customer leaves before the callback runs or clears recovery storage, reconcile the payment in Razorpay before
fulfilling the order. Switch to matching live keys in the deployment environment when ready for live payments.

## Vercel Blob recovery on 27 August 2026

After the suspended store becomes readable, download `blog/internal-blog-posts.json` without deleting or modifying the Blob store. Run the importer against that downloaded file first in dry-run mode and then with `--apply` plus a new backup path. Keep the source export and Blob store until the final count and historical blog URLs have been checked.

## Verification

Run:

```bash
npm test
npm run lint
npm run build
```
