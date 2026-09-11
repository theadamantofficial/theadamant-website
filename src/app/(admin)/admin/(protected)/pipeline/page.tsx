import {PipelineBoard} from "@/features/crm/pipeline/pipeline-board";
import {PipelineSwitcher} from "@/features/crm/pipeline/pipeline-switcher";
import {getCrmPageActor} from "@/lib/crm/auth";
import {canAccessSales} from "@/features/crm/permissions";
import {redirect} from "next/navigation";

export const metadata = {title: "Pipeline"};
export default async function PipelinePage() {
    const actor = await getCrmPageActor();
    if (actor && !canAccessSales(actor.role)) redirect("/admin/development");
    return <><PipelineSwitcher value="sales"/><PipelineBoard/></>;
}
