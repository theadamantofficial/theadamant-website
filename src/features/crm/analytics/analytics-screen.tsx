"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {Activity, ArrowUpRight, BarChart3, CirclePercent, Eye, Globe2, RefreshCw, UsersRound} from "lucide-react";
import {DataError, MetricCard, PageHeader, Skeleton} from "@/components/admin/admin-ui";
import {crmFetch} from "@/features/crm/api";
import type {AnalyticsDays, WebsiteAnalytics} from "./types";

const EVENT_LABELS: Record<string, string> = {contact_click: "WhatsApp, email & phone clicks", generate_lead: "Successful contact forms", section_view: "Section navigation"};
const number = (value: number) => new Intl.NumberFormat("en-IN").format(value);
const dateLabel = (value: string) => new Date(`${value}T00:00:00Z`).toLocaleDateString("en", {month: "short", day: "numeric", timeZone: "UTC"});
type Report = NonNullable<WebsiteAnalytics["report"]>;

export function AnalyticsScreen() {
    const [days, setDays] = useState<AnalyticsDays>(30);
    const [data, setData] = useState<WebsiteAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const requestId = useRef(0);
    const load = useCallback(async (signal?: AbortSignal) => {
        const current = ++requestId.current;
        setLoading(true); setError(""); setData(null);
        try {
            const result = await crmFetch<WebsiteAnalytics>(`/api/admin/analytics?days=${days}`, {signal});
            if (requestId.current === current && !signal?.aborted) setData(result);
        } catch (failure) {
            if (requestId.current === current && !signal?.aborted) setError(failure instanceof Error ? failure.message : "Analytics could not be loaded.");
        } finally { if (requestId.current === current && !signal?.aborted) setLoading(false); }
    }, [days]);
    useEffect(() => {
        const controller = new AbortController();
        void load(controller.signal);
        return () => controller.abort();
    }, [load]);

    const report = data?.report;
    return <div className="space-y-5">
        <PageHeader title="Website Analytics" description="Visitors, traffic and contact activity across the Adamant website." actions={<>
            <label className="sr-only" htmlFor="analytics-period">Reporting period</label>
            <select id="analytics-period" value={days} onChange={(event) => setDays(Number(event.target.value) as AnalyticsDays)} className="crm-control">
                <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option>
            </select>
            <button disabled={loading} onClick={() => void load()} className="crm-button-secondary disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}/> Refresh</button>
        </>}/>
        {error ? <DataError message={error} onRetry={() => void load()}/> : null}
        {loading ? <><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({length: 4}, (_, index) => <div key={index} className="crm-card p-4"><Skeleton className="h-3 w-24"/><Skeleton className="mt-4 h-8 w-28"/><Skeleton className="mt-4 h-3 w-36"/></div>)}</div><div className="crm-card p-5"><Skeleton className="h-60"/></div></> : null}
        {data && !data.connection.configured ? <ConnectAnalytics email={data.connection.serviceAccountEmail} authMode={data.connection.authMode}/> : null}
        {report ? <>
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--crm-muted)]">
                <p>{dateLabel(report.startDate)} – {dateLabel(report.endDate)}, {report.endDate.slice(0, 4)} · {report.timeZone} · Complete days, excluding today</p>
                <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#0d5c63]">Open Google Analytics <ArrowUpRight className="h-3.5 w-3.5"/></a>
            </div>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Visitors" value={number(report.totals.users)} context="Distinct users during this period" icon={<UsersRound className="h-4 w-4"/>}/>
                <MetricCard label="Sessions" value={number(report.totals.sessions)} context="Visits to your website" icon={<Activity className="h-4 w-4"/>}/>
                <MetricCard label="Page views" value={number(report.totals.pageViews)} context="Includes repeat page visits" icon={<Eye className="h-4 w-4"/>}/>
                <MetricCard label="Engagement rate" value={`${(report.totals.engagementRate * 100).toFixed(1)}%`} context="Sessions Google counts as engaged" icon={<CirclePercent className="h-4 w-4"/>}/>
            </section>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
                <DailyChart key={report.days} daily={report.daily}/>
                <section className="crm-card p-5">
                    <h2 className="flex items-center gap-2 text-sm font-semibold"><span className="h-2 w-2 rounded-full bg-emerald-500"/> Recent visitors</h2>
                    {report.realtime ? <><p className="mt-5 text-4xl font-semibold tracking-tight">{number(report.realtime.users)}</p><p className="mt-2 text-xs leading-5 text-[var(--crm-muted)]">Active in the last 30 minutes{report.realtime.scope === "property-web" ? " across this GA4 property's web streams." : " in this website's stream."}</p></> : <p className="mt-5 text-xs text-[var(--crm-muted)]">Realtime data is temporarily unavailable.</p>}
                    <div className="mt-6 border-t border-[var(--crm-border)] pt-4"><h3 className="text-xs font-semibold">Contact & section activity</h3><div className="mt-3 space-y-3">
                        {["contact_click", "generate_lead", "section_view"].map((name) => <div key={name} className="flex items-center justify-between gap-3 text-[11px]"><span className="text-[var(--crm-muted)]">{EVENT_LABELS[name]}</span><span className="font-semibold">{number(report.events.find((event) => event.name === name)?.count || 0)}</span></div>)}
                    </div></div>
                </section>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
                <section className="crm-card overflow-hidden"><PanelTitle title="Top pages" description="Most viewed pages during this period"/><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-[var(--crm-subtle)] text-[10px] text-[var(--crm-muted)]"><tr><th className="px-5 py-3 font-medium">Page</th><th className="px-4 py-3 text-right font-medium">Views</th><th className="px-5 py-3 text-right font-medium">Visitors</th></tr></thead><tbody className="divide-y divide-[var(--crm-border)]">{report.pages.map((page, index) => <tr key={`${page.path}:${index}`}><td className="max-w-64 break-all px-5 py-3">{page.path}</td><td className="px-4 py-3 text-right font-semibold">{number(page.views)}</td><td className="px-5 py-3 text-right text-[var(--crm-muted)]">{number(page.users)}</td></tr>)}</tbody></table>{!report.pages.length ? <NoRows/> : null}</div></section>
                <Breakdown title="Traffic sources" description="How visitors arrived, measured by sessions" items={report.channels.map((row) => ({name: row.name, value: row.sessions}))} unit="sessions"/>
                <Breakdown title="Countries" description="Where your website's visitors are located" items={report.countries.map((row) => ({name: row.name, value: row.users}))} unit="visitors"/>
                <Breakdown title="Devices" description="Devices used to visit your website" items={report.devices.map((row) => ({name: row.name, value: row.users}))} unit="visitors"/>
            </div>
            {report.limitedData ? <p className="rounded-lg bg-[var(--crm-subtle)] p-3 text-xs text-[var(--crm-muted)]">Some Google reports may be sampled or subject to privacy thresholds.</p> : null}
            <p className="text-[11px] text-[var(--crm-muted)]">Fetched {new Date(report.fetchedAt).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}. Reports refresh at most once per minute and may change as Google finishes processing events.</p>
        </> : null}
    </div>;
}

function ConnectAnalytics({email, authMode}: {email: string | null; authMode: "service-account" | "adc"}) {
    return <section className="crm-card p-6 sm:p-8"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--crm-subtle)] text-[#0d5c63]"><Globe2 className="h-6 w-6"/></span><h2 className="mt-5 text-xl font-semibold">Connect Google Analytics</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--crm-muted)]">Website tracking is installed. To display reports here, connect the server to your Google Analytics property with read-only access.</p>
        <ol className="mt-6 max-w-3xl list-decimal space-y-4 pl-5 text-xs leading-6">
            <li>In Google Analytics, open <strong>Admin → Property details</strong> and copy the numeric Property ID. Set it as <code className="rounded bg-[var(--crm-subtle)] px-1.5 py-0.5">GOOGLE_ANALYTICS_PROPERTY_ID</code>. The tracking ID <code>G-GTL1BQJ71E</code> is a different identifier.</li>
            {authMode === "adc" ? <><li>Enable the <strong>Google Analytics Data API</strong> in Google Cloud. Sign in with a Google account that has at least <strong>Viewer</strong> access to this Analytics property.</li><li>Run <code>gcloud auth application-default login</code> with the <code>analytics.readonly</code> scope on the machine running the website, then restart the website. Local login credentials stay on this machine.</li></> : <><li>Enable the <strong>Google Analytics Data API</strong> in Google Cloud and create a service account. In Google Analytics <strong>Property access management</strong>, give {email ? <code className="break-all">{email}</code> : "the service account's email"} the <strong>Viewer</strong> role.</li><li>Set its JSON key as <code className="rounded bg-[var(--crm-subtle)] px-1.5 py-0.5">GOOGLE_ANALYTICS_SERVICE_ACCOUNT_JSON</code> in the server environment, then restart or redeploy the website.</li></>}
        </ol><a href="https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart" target="_blank" rel="noopener noreferrer" className="crm-button-secondary mt-6 inline-flex">Google setup guide <ArrowUpRight className="h-3.5 w-3.5"/></a>
    </section>;
}

function PanelTitle({title, description}: {title: string; description: string}) {
    return <div className="border-b border-[var(--crm-border)] px-5 py-4"><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-[11px] text-[var(--crm-muted)]">{description}</p></div>;
}
function NoRows() { return <p className="p-5 text-xs text-[var(--crm-muted)]">No data reported for this period.</p>; }

function Breakdown({title, description, items, unit}: {title: string; description: string; items: {name: string; value: number}[]; unit: string}) {
    const max = Math.max(1, ...items.map((row) => row.value));
    return <section className="crm-card overflow-hidden"><PanelTitle title={title} description={description}/>{items.length ? <div className="space-y-4 p-5">{items.map((item) => <div key={item.name}><div className="mb-2 flex items-center justify-between gap-3 text-xs"><span className="capitalize">{item.name}</span><span className="font-semibold">{number(item.value)} <span className="text-[10px] font-normal text-[var(--crm-muted)]">{unit}</span></span></div><div className="h-1.5 rounded-full bg-[var(--crm-subtle)]"><div className="h-full rounded-full bg-[#0d5c63]" style={{width: `${Math.max(0, item.value / max * 100)}%`}}/></div></div>)}</div> : <NoRows/>}</section>;
}

function DailyChart({daily}: {daily: Report["daily"]}) {
    const [metric, setMetric] = useState<"pageViews" | "users">("pageViews");
    const [selected, setSelected] = useState(daily.length - 1);
    const [showTable, setShowTable] = useState(false);
    const max = Math.ceil(Math.max(1, ...daily.map((row) => row[metric])) / 2) * 2;
    const width = 800, height = 220, left = 46, right = 16, top = 16, bottom = 30;
    const x = (index: number) => left + index / Math.max(1, daily.length - 1) * (width - left - right);
    const y = (value: number) => height - bottom - value / max * (height - top - bottom);
    const point = daily[selected];
    const path = daily.map((row, index) => `${index ? "L" : "M"}${x(index)},${y(row[metric])}`).join(" ");
    return <section className="crm-card overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--crm-border)] px-5 py-4"><div><h2 className="flex items-center gap-2 text-sm font-semibold"><BarChart3 className="h-4 w-4"/> Daily activity</h2><p className="mt-1 text-[11px] text-[var(--crm-muted)]">Move over the chart or use the arrow keys to inspect a day.</p></div><div className="flex gap-1 rounded-lg bg-[var(--crm-subtle)] p-1">{(["pageViews", "users"] as const).map((value) => <button key={value} type="button" aria-pressed={metric === value} onClick={() => setMetric(value)} className={`rounded-md px-3 py-1.5 text-[11px] ${metric === value ? "bg-[var(--crm-surface)] font-semibold shadow-sm" : "text-[var(--crm-muted)]"}`}>{value === "pageViews" ? "Page views" : "Visitors"}</button>)}</div></div>
        <div className="p-5"><p className="mb-3 text-xs" aria-live="polite">{point ? <><span className="text-[var(--crm-muted)]">{dateLabel(point.date)}</span><span className="ml-3 font-semibold">{number(point[metric])} {metric === "pageViews" ? "page views" : "visitors"}</span></> : "No daily data reported"}</p>
            <svg viewBox={`0 0 ${width} ${height}`} role="img" tabIndex={0} aria-label={`Daily ${metric === "pageViews" ? "page views" : "visitors"}. Use left and right arrow keys to inspect dates.`} className="w-full rounded-md outline-offset-4 focus-visible:outline-2 focus-visible:outline-[#0d5c63]" onMouseMove={(event) => {
                const bounds = event.currentTarget.getBoundingClientRect();
                const position = ((event.clientX - bounds.left) / bounds.width * width - left) / (width - left - right);
                setSelected(Math.max(0, Math.min(daily.length - 1, Math.round(position * (daily.length - 1)))));
            }} onKeyDown={(event) => {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                event.preventDefault();
                setSelected((current) => Math.max(0, Math.min(daily.length - 1, current + (event.key === "ArrowLeft" ? -1 : 1))));
            }}>
                {[0, .5, 1].map((ratio) => <g key={ratio}><line x1={left} x2={width - right} y1={y(max * ratio)} y2={y(max * ratio)} stroke="var(--crm-border)"/><text x={left - 9} y={y(max * ratio) + 4} textAnchor="end" fontSize="11" fill="var(--crm-muted)">{number(Math.round(max * ratio))}</text></g>)}
                <path d={path} fill="none" stroke="#0d5c63" strokeWidth="2.5" strokeLinejoin="round"/>
                {point ? <><line x1={x(selected)} x2={x(selected)} y1={top} y2={height - bottom} stroke="var(--crm-muted)" strokeDasharray="4 4"/><circle cx={x(selected)} cy={y(point[metric])} r="5" fill="#0d5c63" stroke="var(--crm-surface)" strokeWidth="2"/></> : null}
                {daily.length ? <><text x={left} y={height - 6} fontSize="11" fill="var(--crm-muted)">{dateLabel(daily[0].date)}</text><text x={width - right} y={height - 6} textAnchor="end" fontSize="11" fill="var(--crm-muted)">{dateLabel(daily[daily.length - 1].date)}</text></> : null}
            </svg>
            <button type="button" onClick={() => setShowTable((current) => !current)} aria-expanded={showTable} className="mt-3 text-[11px] font-semibold text-[#0d5c63]">{showTable ? "Hide" : "View"} daily data</button>
            {showTable ? <div className="mt-4 max-h-64 overflow-auto"><table className="w-full text-left text-[11px]"><thead><tr className="border-b border-[var(--crm-border)] text-[var(--crm-muted)]"><th className="py-2 font-medium">Date</th><th className="py-2 text-right font-medium">Visitors</th><th className="py-2 text-right font-medium">Sessions</th><th className="py-2 text-right font-medium">Views</th></tr></thead><tbody>{daily.map((row) => <tr key={row.date} className="border-b border-[var(--crm-border)]"><td className="py-2">{row.date}</td><td className="py-2 text-right">{number(row.users)}</td><td className="py-2 text-right">{number(row.sessions)}</td><td className="py-2 text-right">{number(row.pageViews)}</td></tr>)}</tbody></table></div> : null}
        </div>
    </section>;
}
