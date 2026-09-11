import {redirect} from "next/navigation";
import {getCrmPageActor} from "@/lib/crm/auth";
import {canAccessDevelopment} from "@/features/crm/permissions";
import {DevelopmentScreen} from "@/features/crm/development/development-screen";

export const metadata = {title: "Development pipeline"};
export default async function DevelopmentPage() {
    const actor = await getCrmPageActor();
    if (!actor) redirect("/admin/login");
    if (!canAccessDevelopment(actor.role)) redirect("/admin/pipeline");
    return <DevelopmentScreen/>;
}
