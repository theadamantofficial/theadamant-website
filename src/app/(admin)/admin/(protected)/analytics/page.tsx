import {redirect} from "next/navigation";
import {getCrmPageActor} from "@/lib/crm/auth";
import {canViewWebsiteAnalytics} from "@/features/crm/permissions";
import {AnalyticsScreen} from "@/features/crm/analytics/analytics-screen";

export const metadata = {title: "Website Analytics"};

export default async function AdminAnalyticsPage() {
    const actor = await getCrmPageActor();
    if (!actor) redirect("/admin/login?next=%2Fadmin%2Fanalytics");
    if (!canViewWebsiteAnalytics(actor.role)) redirect(actor.role === "employee" ? "/admin/dashboard" : "/admin/development");
    return <AnalyticsScreen/>;
}
