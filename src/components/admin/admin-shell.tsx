"use client";

import {createContext, FormEvent, ReactNode, useContext, useEffect, useRef, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {Bell, BriefcaseBusiness, Building2, CheckSquare2, ChevronRight, LayoutDashboard, LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen, Plus, Search, Settings, Sun, Users, Workflow, X} from "lucide-react";
import type {CrmActor} from "@/features/crm/types";
import {ROLE_LABELS} from "@/features/crm/constants";
import {canManageLeads} from "@/features/crm/permissions";
import {AdminThemeProvider, useAdminTheme} from "@/components/admin/admin-theme-provider";
import {UserAvatar} from "@/components/admin/admin-ui";

const NAV_ITEMS = [
    {href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard},
    {href: "/admin/leads", label: "Leads", icon: BriefcaseBusiness},
    {href: "/admin/pipeline", label: "Pipeline", icon: Workflow},
    {href: "/admin/tasks", label: "Tasks", icon: CheckSquare2},
    {href: "/admin/customers", label: "Customers", icon: Building2},
    {href: "/admin/team", label: "Team", icon: Users},
] as const;

const AdminActorContext = createContext<CrmActor | null>(null);

export function AdminShell({actor, children}: {actor: CrmActor; children: ReactNode}) {
    return <AdminActorContext.Provider value={actor}><AdminThemeProvider><AdminShellInner actor={actor}>{children}</AdminShellInner></AdminThemeProvider></AdminActorContext.Provider>;
}

export function useAdminActor() {
    const actor = useContext(AdminActorContext);
    if (!actor) throw new Error("useAdminActor must be used inside AdminShell.");
    return actor;
}

function AdminShellInner({actor, children}: {actor: CrmActor; children: ReactNode}) {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [quickOpen, setQuickOpen] = useState(false);
    const quickRef = useRef<HTMLDivElement>(null);
    const {theme, setTheme} = useAdminTheme();
    const canCreate = canManageLeads(actor.role);
    const visibleNavItems = actor.role === "employee" ? NAV_ITEMS.filter((item) => item.href !== "/admin/team") : NAV_ITEMS;

    useEffect(() => {
        setCollapsed(window.localStorage.getItem("adamant-crm-sidebar") === "collapsed");
    }, []);

    useEffect(() => {
        function close(event: MouseEvent) {
            if (quickRef.current && !quickRef.current.contains(event.target as Node)) setQuickOpen(false);
        }
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    function toggleSidebar() {
        setCollapsed((current) => {
            window.localStorage.setItem("adamant-crm-sidebar", current ? "expanded" : "collapsed");
            return !current;
        });
    }

    async function logout() {
        await fetch("/api/admin/logout", {method: "POST"});
        window.location.assign("/admin/login");
    }

    function search(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const query = String(form.get("query") || "").trim();
        if (query) router.push(`/admin/leads?search=${encodeURIComponent(query)}`);
    }

    const currentTitle = getPageTitle(pathname);
    const sidebarWidth = collapsed ? "lg:pl-[4.5rem]" : "lg:pl-64";

    return <div className="crm-app min-h-screen bg-[var(--crm-bg)] text-[var(--crm-text)]">
        {mobileOpen ? <button aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/30 lg:hidden"/> : null}
        <aside className={`fixed inset-y-0 left-0 z-50 flex border-r border-[var(--crm-sidebar-border)] bg-[var(--crm-sidebar)] transition-[width,transform] duration-200 ${collapsed ? "w-[4.5rem]" : "w-64"} ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
            <div className="flex w-full flex-col p-3">
                <div className={`flex h-12 items-center ${collapsed ? "justify-center" : "justify-between px-1"}`}>
                    <Link href="/admin/dashboard" className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white"><Image src="/vectors/logo-the-adamant.svg" alt="The Adamant" width={25} height={25}/></span>
                        {!collapsed ? <span className="min-w-0"><span className="block truncate text-sm font-semibold text-white">Adamant</span><span className="block text-[9px] uppercase tracking-[.16em] text-white/38">Internal CRM</span></span> : null}
                    </Link>
                    {!collapsed ? <button aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/8 hover:text-white lg:hidden"><X className="h-4 w-4"/></button> : null}
                </div>

                <nav className="mt-5 space-y-1">
                    {visibleNavItems.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined} onClick={() => setMobileOpen(false)} className={`group flex h-10 items-center rounded-lg text-xs font-medium transition duration-150 ${collapsed ? "justify-center" : "gap-3 px-3"} ${active ? "bg-white/11 text-white" : "text-white/54 hover:bg-white/[.07] hover:text-white"}`}><Icon className="h-4 w-4 shrink-0"/>{!collapsed ? <span>{item.label}</span> : null}{active && !collapsed ? <ChevronRight className="ml-auto h-3.5 w-3.5 text-white/35"/> : null}</Link>;
                    })}
                </nav>

                <div className="mt-auto space-y-1 border-t border-white/8 pt-3">
                    <Link href="/admin/settings" title={collapsed ? "Settings" : undefined} className={`flex h-10 items-center rounded-lg text-xs font-medium text-white/54 transition hover:bg-white/[.07] hover:text-white ${collapsed ? "justify-center" : "gap-3 px-3"}`}><Settings className="h-4 w-4"/>{!collapsed ? "Settings" : null}</Link>
                    <div className={`mt-2 flex items-center rounded-lg bg-white/[.05] ${collapsed ? "justify-center p-1.5" : "gap-2.5 p-2"}`}>
                        <UserAvatar name={actor.fullName} imageUrl={actor.avatarUrl}/>
                        {!collapsed ? <div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold text-white">{actor.fullName}</p><p className="truncate text-[9px] text-white/38">{ROLE_LABELS[actor.role]}</p></div> : null}
                        {!collapsed ? <button aria-label="Log out" onClick={() => void logout()} className="flex h-7 w-7 items-center justify-center rounded-md text-white/35 hover:bg-white/8 hover:text-white"><LogOut className="h-3.5 w-3.5"/></button> : null}
                    </div>
                    <button onClick={toggleSidebar} className="hidden h-9 w-full items-center justify-center rounded-lg text-white/35 hover:bg-white/[.07] hover:text-white lg:flex" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <PanelLeftOpen className="h-4 w-4"/> : <span className="flex w-full items-center gap-3 px-3 text-[10px]"><PanelLeftClose className="h-4 w-4"/> Collapse sidebar</span>}</button>
                </div>
            </div>
        </aside>

        <div className={`min-h-screen transition-[padding] duration-200 ${sidebarWidth}`}>
            <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--crm-border)] bg-[color:var(--crm-header)] px-4 backdrop-blur-xl sm:px-6 lg:px-8">
                <button aria-label="Open navigation" onClick={() => setMobileOpen(true)} className="crm-icon-button lg:hidden"><Menu className="h-4 w-4"/></button>
                <div className="min-w-0"><p className="truncate text-sm font-semibold">{currentTitle}</p><p className="hidden text-[10px] text-[var(--crm-muted)] sm:block">Adamant CRM <ChevronRight className="mx-1 inline h-2.5 w-2.5"/> {currentTitle}</p></div>
                <form onSubmit={search} className="relative ml-auto hidden w-full max-w-xs md:block"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--crm-muted)]"/><input name="query" placeholder="Search CRM…" className="crm-control w-full pl-9"/></form>
                <button title="Notifications will be added in a later phase" aria-label="Notifications placeholder" className="crm-icon-button"><Bell className="h-4 w-4"/></button>
                <div className="relative" ref={quickRef}>
                    <button onClick={() => setQuickOpen((current) => !current)} className="crm-button-primary"><Plus className="h-3.5 w-3.5"/><span className="hidden sm:inline">{canCreate ? "New" : "Comment"}</span></button>
                    {quickOpen ? <div className="absolute right-0 top-11 w-52 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] p-1.5 shadow-xl">{canCreate ? <><Link onClick={() => setQuickOpen(false)} href="/admin/leads/new" className="crm-menu-item"><BriefcaseBusiness className="h-3.5 w-3.5"/> New lead</Link><Link onClick={() => setQuickOpen(false)} href="/admin/tasks?new=1" className="crm-menu-item"><CheckSquare2 className="h-3.5 w-3.5"/> New task</Link></> : null}<Link onClick={() => setQuickOpen(false)} href="/admin/leads" className="crm-menu-item"><Plus className="h-3.5 w-3.5"/> {canCreate ? "Comment on a lead" : "Comment on assigned lead"}</Link></div> : null}
                </div>
                <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle light and dark mode" className="crm-icon-button">{theme === "dark" ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}</button>
                <UserAvatar name={actor.fullName} imageUrl={actor.avatarUrl}/>
            </header>
            <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
    </div>;
}

function getPageTitle(pathname: string) {
    if (pathname.includes("/leads/new")) return "New lead";
    if (/\/leads\/[^/]+\/edit$/.test(pathname)) return "Edit lead";
    if (/\/leads\/[^/]+$/.test(pathname)) return "Lead details";
    return NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.label || (pathname.startsWith("/admin/settings") ? "Settings" : "Admin");
}
