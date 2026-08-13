import {existsSync} from "node:fs";
import {isAbsolute, resolve} from "node:path";
import {Worker} from "node:worker_threads";
import type {Prospect} from "@/features/crm/types";
import {CrmApiError} from "@/lib/crm/errors";

const DEFAULT_DATABASE_PATH = "/Volumes/Yashverma/Adamant/leads/USA_Leads_Combined.sqlite";
const PROSPECT_COLUMNS = [
    "l.record_id",
    "s.relative_path as source_file",
    "s.sheet_name as source_sheet",
    "l.external_id",
    "l.name",
    "l.first_name",
    "l.last_name",
    "l.job_title",
    "l.business_name",
    "l.company_name",
    "l.contact_person",
    "l.email",
    "l.corporate_email",
    "l.company_email",
    "l.phone",
    "l.company_phone",
    "l.phone_type",
    "l.website",
    "l.linkedin_url",
    "l.address",
    "l.city",
    "l.state",
    "l.postal_code",
    "l.country",
    "l.industry",
    "l.sub_industry",
    "l.employees",
    "l.revenue",
    "l.location",
].join(",");

type ProspectQuery = {
    after: number;
    pageSize: number;
    search?: string;
    state?: string;
    city?: string;
    industry?: string;
    hasPhone?: boolean;
};

type SqlInputValue = null | number | bigint | string | Uint8Array;
type WorkerStatement = {sql: string; params: SqlInputValue[]; method: "all" | "get"};
type WorkerResponse = {results?: unknown[]; error?: string};

const SQL_WORKER_SOURCE = `
const {parentPort, workerData} = require("node:worker_threads");
const {DatabaseSync} = require("node:sqlite");
try {
    const database = new DatabaseSync(workerData.databasePath, {readOnly: true});
    const results = workerData.statements.map((statement) => {
        const prepared = database.prepare(statement.sql);
        return statement.method === "get"
            ? prepared.get(...statement.params)
            : prepared.all(...statement.params);
    });
    database.close();
    parentPort.postMessage({results});
} catch (error) {
    parentPort.postMessage({error: error instanceof Error ? error.message : String(error)});
}
`;

export async function queryProspects(input: ProspectQuery) {
    const where = ["l.record_id > ?"];
    const params: SqlInputValue[] = [input.after];

    if (input.search) {
        const search = `%${escapeLike(input.search)}%`;
        where.push(`(
            coalesce(l.name, '') like ? escape '\\' collate nocase
            or coalesce(l.contact_person, '') like ? escape '\\' collate nocase
            or coalesce(l.business_name, '') like ? escape '\\' collate nocase
            or coalesce(l.company_name, '') like ? escape '\\' collate nocase
            or coalesce(l.email, '') like ? escape '\\' collate nocase
            or coalesce(l.corporate_email, '') like ? escape '\\' collate nocase
            or coalesce(l.company_email, '') like ? escape '\\' collate nocase
            or coalesce(l.phone, '') like ? escape '\\' collate nocase
            or coalesce(l.company_phone, '') like ? escape '\\' collate nocase
        )`);
        params.push(...Array.from({length: 9}, () => search));
    }

    addTextFilter(where, params, "l.state", input.state);
    addTextFilter(where, params, "l.city", input.city);
    addTextFilter(where, params, "l.industry", input.industry);
    if (input.hasPhone) where.push("(length(trim(coalesce(l.phone, ''))) > 0 or length(trim(coalesce(l.company_phone, ''))) > 0)");

    const [rowResult, metadataResult] = await runStatements([
        {
            sql: `
                select ${PROSPECT_COLUMNS}
                from leads l
                join sources s on s.source_id = l.source_id
                where ${where.join(" and ")}
                order by l.record_id
                limit ?
            `,
            params: [...params, input.pageSize + 1],
            method: "all",
        },
        {
            sql: "select key, value from database_meta where key in ('records', 'created_utc')",
            params: [],
            method: "all",
        },
    ]);

    const rows = rowResult as Record<string, unknown>[];
    const hasMore = rows.length > input.pageSize;
    const prospects = rows.slice(0, input.pageSize).map((row) => ({...row}) as Prospect);
    return {
        prospects,
        page: {
            hasMore,
            nextAfter: hasMore ? prospects.at(-1)?.record_id || null : null,
        },
        database: getProspectDatabaseMetadata(metadataResult as Record<string, unknown>[]),
    };
}

export async function getProspectById(recordId: number) {
    const [row] = await runStatements([{
        sql: `
            select ${PROSPECT_COLUMNS}
            from leads l
            join sources s on s.source_id = l.source_id
            where l.record_id = ?
        `,
        params: [recordId],
        method: "get",
    }]);
    return row ? ({...row} as Prospect) : null;
}

function getProspectDatabasePath() {
    const configuredPath = process.env.USA_LEADS_DATABASE_PATH?.trim() || DEFAULT_DATABASE_PATH;
    const databasePath = isAbsolute(configuredPath) ? configuredPath : resolve(process.cwd(), configuredPath);
    if (!existsSync(databasePath)) {
        throw new CrmApiError("The USA leads database is unavailable. Configure USA_LEADS_DATABASE_PATH on this server.", 503);
    }
    return databasePath;
}

function getProspectDatabaseMetadata(values: Record<string, unknown>[]) {
    const metadata = Object.fromEntries(values.map((row) => [String(row.key), String(row.value)]));
    return {
        total: Number.parseInt(metadata.records || "0", 10) || 0,
        createdAt: metadata.created_utc || null,
    };
}

function addTextFilter(where: string[], params: SqlInputValue[], column: string, value?: string) {
    const normalized = value?.trim().slice(0, 100);
    if (!normalized) return;
    where.push(`${column} = ? collate nocase`);
    params.push(normalized);
}

function escapeLike(value: string) {
    return value.trim().slice(0, 120).replace(/[\\%_]/g, (character) => `\\${character}`);
}

function runStatements(statements: WorkerStatement[]) {
    return new Promise<unknown[]>((resolvePromise, rejectPromise) => {
        const worker = new Worker(SQL_WORKER_SOURCE, {
            eval: true,
            execArgv: ["--no-warnings"],
            workerData: {databasePath: getProspectDatabasePath(), statements},
        });
        let settled = false;
        const finish = (callback: () => void) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            callback();
        };
        const timeout = setTimeout(() => {
            finish(() => {
                void worker.terminate();
                rejectPromise(new CrmApiError("This lead database search took too long. Try a narrower filter.", 408));
            });
        }, 15_000);

        worker.once("message", (response: WorkerResponse) => {
            finish(() => {
                if (response.error) rejectPromise(new CrmApiError("The USA leads database could not be queried.", 503));
                else resolvePromise(response.results || []);
            });
        });
        worker.once("error", () => finish(() => rejectPromise(new CrmApiError("The USA leads database could not be queried.", 503))));
        worker.once("exit", (code) => {
            if (code !== 0) finish(() => rejectPromise(new CrmApiError("The USA leads database query stopped unexpectedly.", 503)));
        });
    });
}
