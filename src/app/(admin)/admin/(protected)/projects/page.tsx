import {redirect} from "next/navigation";
import {getCrmPageActor} from "@/lib/crm/auth";
import {canManageLeads} from "@/features/crm/permissions";
import {ProjectsScreen} from "@/features/crm/projects/projects-screen";

export const metadata = {title: "Our projects"};

export default async function ProjectsPage() {
    const actor = await getCrmPageActor();
    if (!actor) redirect("/admin/login");
    if (!canManageLeads(actor.role)) redirect("/admin");
    return <ProjectsScreen/>;
}
