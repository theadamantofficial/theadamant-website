#!/usr/bin/env python3
"""Import purchased SQLite records into public.\"whatsapp-lead-db\".

Defaults to a local preview. --apply writes committed batches; --all processes
the full dataset. Operational public.leads is never queried or modified.
"""

import argparse
import getpass
import json
import sqlite3
import sys
from pathlib import Path

DEFAULT_SOURCE = "/Volumes/Yashverma/Adamant/leads/USA_Leads_Combined.sqlite"
TABLE = 'public."whatsapp-lead-db"'
FIELDS = (
    "record_id", "source_file", "source_sheet", "external_id", "name", "first_name",
    "last_name", "job_title", "business_name", "company_name", "contact_person",
    "email", "corporate_email", "company_email", "phone", "company_phone", "phone_type",
    "website", "linkedin_url", "address", "city", "state", "postal_code", "country",
    "industry", "sub_industry", "employees", "revenue", "location",
)
COLUMNS = ", ".join((*FIELDS, "dataset_id", "source_record"))
INSERT_SQL = f"""
insert into {TABLE} ({COLUMNS})
select {COLUMNS} from whatsapp_lead_import_batch
on conflict (record_id) do nothing
"""


def json_safe(value):
    # JSONB cannot store NUL: retain it as visible escaped text.
    if isinstance(value, str):
        return value.replace("\x00", "\\u0000")
    if isinstance(value, list):
        return [json_safe(item) for item in value]
    if isinstance(value, dict):
        return {json_safe(key): json_safe(item) for key, item in value.items()}
    return value


def map_record(source, dataset):
    original = dict(source)
    row = {field: original.get(field) for field in FIELDS}
    row["record_id"] = int(row["record_id"])
    if row["record_id"] <= 0:
        raise RuntimeError("Source record IDs must be positive.")
    for field in FIELDS[1:]:
        value = row[field]
        row[field] = None if value is None else str(value).replace("\x00", "\\u0000")
    raw = original.get("raw_values_json")
    if raw:
        try:
            original["raw_values_json"] = json.loads(raw, parse_constant=lambda value: value)
        except (TypeError, ValueError):
            pass
    row["dataset_id"] = dataset
    row["source_record"] = json_safe(original)
    return row


def records(database, after, limit):
    sql = """
        select l.*, s.relative_path as source_file, s.sheet_name as source_sheet
        from leads l left join sources s on s.source_id = l.source_id
        where l.record_id > ? order by l.record_id
    """
    params = [after]
    if limit is not None:
        sql += " limit ?"
        params.append(limit)
    return database.execute(sql, params)


def preview(database, dataset, args):
    count = phones = 0
    for source in records(database, args.after, min(args.limit, 1000)):
        row = map_record(source, dataset)
        count += 1
        phones += any(str(row[field] or "").strip() for field in ("phone", "company_phone"))
    print(f"Preview: {count:,} records; {phones:,} with phone numbers.")
    print(f"Destination: {TABLE}. Original fields and full source details are preserved.")
    print("No Supabase connection was opened and no data was changed.")


def initialize_status(connection, dataset, expected_count):
    with connection.transaction():
        with connection.cursor() as cursor:
            cursor.execute("select pg_advisory_xact_lock(hashtext('adamant_whatsapp_lead_import'))")
            cursor.execute("select dataset_id from public.whatsapp_lead_db_import_status where id = 'usa_leads' for update")
            existing = cursor.fetchone()
            if existing:
                if existing[0] != dataset:
                    raise RuntimeError("This destination contains a different dataset. Source record IDs must not be mixed.")
                return
            cursor.execute(f"select dataset_id from {TABLE} where dataset_id <> %s limit 1", (dataset,))
            existing_record = cursor.fetchone()
            if existing_record and existing_record[0] != dataset:
                raise RuntimeError("This destination contains a different dataset.")
            cursor.execute(f"select count(*) from {TABLE}")
            imported = cursor.fetchone()[0]
            cursor.execute("""
                insert into public.whatsapp_lead_db_import_status
                    (id, dataset_id, expected_count, imported_count)
                values ('usa_leads', %s, %s, %s)
            """, (dataset, expected_count, imported))


def apply(database, dataset, expected_count, args):
    try:
        import psycopg
        from psycopg.types.json import Jsonb
    except ImportError:
        raise RuntimeError("Install psycopg: python -m pip install 'psycopg[binary]>=3.2,<4'") from None
    if not args.db_host or not args.db_user:
        raise RuntimeError("--apply requires --db-host and --db-user from Supabase Connect > Session pooler.")
    password = getpass.getpass("Supabase database password (hidden): ")
    processed = inserted = 0
    last_committed = args.after
    try:
        with psycopg.connect(
            host=args.db_host, user=args.db_user, password=password, dbname="postgres",
            port=args.db_port, sslmode="require", connect_timeout=20,
            application_name="adamant_whatsapp_lead_import", autocommit=True,
        ) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    select 1 from public.profiles
                    where email = %s and active and role in ('super_admin', 'admin')
                """, (args.admin_email.strip().lower(),))
                if not cursor.fetchone():
                    raise RuntimeError("Choose the production project containing your active CRM administrator profile.")
                cursor.execute(f"select {COLUMNS} from {TABLE} limit 0")
                cursor.execute("set statement_timeout = '5min'")
                cursor.execute("set lock_timeout = '15s'")
                cursor.execute(f"create temporary table whatsapp_lead_import_batch (like {TABLE} including defaults) on commit delete rows")
            initialize_status(connection, dataset, expected_count)
            source_cursor = records(database, args.after, None if args.all else args.limit)
            while True:
                batch = source_cursor.fetchmany(args.batch_size)
                if not batch:
                    break
                with connection.transaction():
                    with connection.cursor() as cursor:
                        # Serialize import batches to keep the count and dataset guard consistent.
                        cursor.execute("select dataset_id from public.whatsapp_lead_db_import_status where id = 'usa_leads' for update")
                        status = cursor.fetchone()
                        if not status or status[0] != dataset:
                            raise RuntimeError("The destination dataset changed. Import stopped.")
                        with cursor.copy(f"copy whatsapp_lead_import_batch ({COLUMNS}) from stdin") as copy:
                            for source in batch:
                                row = map_record(source, dataset)
                                copy.write_row((*[row[field] for field in FIELDS], dataset, Jsonb(row["source_record"])))
                        cursor.execute(INSERT_SQL)
                        batch_inserted = cursor.rowcount
                        cursor.execute("""
                            update public.whatsapp_lead_db_import_status
                            set imported_count = imported_count + %s, updated_at = now()
                            where id = 'usa_leads'
                        """, (batch_inserted,))
                processed += len(batch)
                inserted += batch_inserted
                last_committed = int(batch[-1]["record_id"])
                print(f"Committed: {processed:,} processed; {inserted:,} inserted; {processed - inserted:,} existing. Resume: --after {last_committed}", flush=True)
    except BaseException:
        print(f"Stopped. Resume with --after {last_committed}; earlier committed batches remain imported.", file=sys.stderr)
        raise
    print(f"Finished: {inserted:,} records added to whatsapp-lead-db; {processed - inserted:,} existing records skipped.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", default=DEFAULT_SOURCE)
    selection = parser.add_mutually_exclusive_group()
    selection.add_argument("--limit", type=int, default=1000)
    selection.add_argument("--all", action="store_true")
    parser.add_argument("--after", type=int, default=0)
    parser.add_argument("--batch-size", type=int, default=1000)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--db-host")
    parser.add_argument("--db-user")
    parser.add_argument("--db-port", type=int, default=5432)
    parser.add_argument("--admin-email", default="admin@theadamant.com")
    args = parser.parse_args()
    if args.after < 0 or args.limit <= 0 or not 1 <= args.batch_size <= 10000:
        parser.error("--after must be nonnegative; --limit positive; --batch-size between 1 and 10000.")
    path = Path(args.source).expanduser().resolve()
    if not path.is_file():
        parser.error(f"SQLite file not found: {path}")
    try:
        with sqlite3.connect(path.as_uri() + "?mode=ro", uri=True) as database:
            database.row_factory = sqlite3.Row
            metadata = dict(database.execute("select key, value from database_meta"))
            dataset = metadata.get("created_utc")
            if not dataset:
                raise RuntimeError("The source is missing its created_utc dataset identifier.")
            expected = int(metadata.get("records", 0))
            print(f"Source: {path.name}; expected records: {expected:,}; dataset: {dataset}.")
            if args.apply:
                apply(database, dataset, expected, args)
            else:
                preview(database, dataset, args)
    except KeyboardInterrupt:
        return 130
    except Exception as error:
        print(f"Import failed ({type(error).__name__}). Check connection settings, the whatsapp-lead-db migration, and available disk space.", file=sys.stderr)
        if isinstance(error, RuntimeError):
            print(str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
