# Production setup for whatsapp-lead-db

The purchased USA dataset belongs in the separate Supabase table
`public."whatsapp-lead-db"`. The existing operational CRM table `public.leads`
continues to hold your manually created leads. The importer reads
`/Volumes/Yashverma/Adamant/leads/USA_Leads_Combined.sqlite` without modifying it.
The source metadata reports 10,572,970 records.

## 1. Create the new table in the existing production project

Open the Supabase project matching the website's Vercel `SUPABASE_URL` or
`NEXT_PUBLIC_SUPABASE_URL`. Your existing `profiles`, `leads`, and
`prospect_outreach_events` tables should already be present.

In **SQL Editor → New query**, paste the complete contents of:

`supabase/migrations/20260913190000_add_whatsapp_lead_db.sql`

Run that query. It creates:

- `whatsapp-lead-db`: the purchased records with their original record IDs,
  names, phone numbers, email fields, companies, locations, and source details.
- `whatsapp_lead_db_import_status`: one small progress row, so displaying the
  total does not require counting ten million records on every page request.
- Read permissions for admins and employees granted Lead Database access.
- Pagination and search for the admin screen, plus location and phone indexes.

The migration uses the existing `public.can_access_prospect_database()` function.
Apply only this new file for this setup; it does not require rerunning the CRM's
older migrations or copying the dataset into `public.leads`.

In Table Editor, refresh the table list and select `whatsapp-lead-db`.

## 2. Get the import connection fields

Open **Connect → Session pooler** in that same Supabase project. Copy **Host**,
**User**, and **Port**. Session mode normally uses port 5432. The user generally
has the form `postgres.PROJECT_REF`.

The importer privately prompts for the **database password** in Terminal. It
does not use an API key for the import or save the password in a file.

Connection guidance: https://supabase.com/docs/guides/database/connecting-to-postgres

## 3. Prepare the Mac and preview the source

Keep the external drive mounted. In Terminal:

```bash
cd /Users/yashverma/adamant/theadamant-website
python3 -m venv /tmp/adamant-leads-import
/tmp/adamant-leads-import/bin/python -m pip install 'psycopg[binary]>=3.2,<4'

LEADS_DB_HOST='PASTE_SESSION_POOLER_HOST'
LEADS_DB_USER='PASTE_SESSION_POOLER_USER'

python3 scripts/import-whatsapp-lead-db.py --limit 1000
```

The preview does not connect to Supabase. It checks up to 1,000 source records
and prints counts without showing contact details.

## 4. Test with 1,000 imported records

```bash
/tmp/adamant-leads-import/bin/python scripts/import-whatsapp-lead-db.py \
  --apply --limit 1000 \
  --db-host "$LEADS_DB_HOST" \
  --db-user "$LEADS_DB_USER"
```

Enter the database password at the hidden prompt. If needed, add
`--db-port PORT_FROM_CONNECT`. The default importing admin is
`admin@theadamant.com`; use `--admin-email OTHER_ADMIN_EMAIL` if the active admin
profile in this project has another email.

The importer uses PostgreSQL COPY into temporary batches and inserts into
`whatsapp-lead-db`. Every committed batch updates the import total in the same
transaction. Original source IDs prevent duplicate imports. Existing matches
are skipped without overwriting them. All original SQLite fields, including
fields outside the admin listing, are preserved in `source_record`. PostgreSQL
cannot store JSON NUL characters; those are retained as visible `\u0000` text
escapes. No CRM activity rows are generated and no contacts are messaged.

Large-import guidance: https://supabase.com/docs/guides/database/import-data

## 5. Verify the sample and size the full import

In Supabase SQL Editor:

```sql
select * from public.whatsapp_lead_db_import_status;

select count(*) as purchased_records
from public."whatsapp-lead-db";

select pg_size_pretty(pg_total_relation_size('public."whatsapp-lead-db"'))
as purchased_records_with_indexes;
```

After the first sample import, expect 1,000 records if no prior imports exist.
Inspect the names, companies, phones, and emails in Table Editor. Review database
disk usage before and after the sample to estimate capacity for 10,572,970 rows,
their source details, indexes, and temporary/WAL space. The PostgreSQL size can
differ from the 5.3 GB SQLite file. Provision sufficient disk before importing all
records; a sample import does not demonstrate query performance at full size.

Disk guidance: https://supabase.com/docs/guides/platform/database-size

## 6. Import the complete dataset

After validating the sample and disk capacity:

```bash
/tmp/adamant-leads-import/bin/python scripts/import-whatsapp-lead-db.py \
  --apply --all \
  --db-host "$LEADS_DB_HOST" \
  --db-user "$LEADS_DB_USER"
```

The first 1,000 imported records are skipped. Keep the Mac awake, its internet
connection active, and the external drive mounted. Each committed batch prints
a resume cursor. If interrupted, add `--after LAST_COMMITTED_RECORD_ID` to resume.
Rerunning from an earlier cursor is safe: existing source IDs are skipped.

The destination accepts one source dataset. The importer refuses a different
dataset timestamp to prevent mixing unrelated records with reused source IDs.

Finish by verifying the import-status total and table count. A full import should
report 10,572,970 records. Update planner statistics afterward:

```sql
analyze public."whatsapp-lead-db";
```

For fast text searches at full size, run
`scripts/whatsapp-lead-db-search-index.sql` in SQL Editor after the bulk import.
It builds an additional index and needs extra disk space. Location filters and
phone-only browsing already have indexes from the migration.

## 7. Deploy the updated website reader

In Vercel's environment settings for **Production**, add:

```dotenv
PROSPECT_DATABASE_MODE=supabase
```

Keep the existing CRM Supabase URL and publishable/anon key configured for the
same project. Deploy the repository changes, including the updated prospect API
reader. Setting the environment variable on the old code alone does not update
its SQLite-only reader.

Open `https://theadamant.com/admin/prospects`, now titled **WhatsApp Lead
Database**. It reads `whatsapp-lead-db` with the signed-in user's Supabase access
token. Admins have access automatically; employees need the existing Team-screen
grant. Filters and cursor pagination operate on the purchased database. WhatsApp
opens only after a user chooses a record and confirms a message; outreach is
recorded in the existing `prospect_outreach_events` table.

Local development can continue using the mounted SQLite source with
`PROSPECT_DATABASE_MODE=sqlite`. For local testing against Supabase, use
`PROSPECT_DATABASE_MODE=supabase`.

The assistant validated the source preview locally. Production table creation,
database writes, and deployment have not been performed by the assistant.
