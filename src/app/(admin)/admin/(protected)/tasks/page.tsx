import {TasksScreen} from "@/features/crm/tasks/tasks-screen";
import {getCrmPageActor} from "@/lib/crm/auth";
import {canManageLeads} from "@/features/crm/permissions";

export const metadata = {title: "Tasks"};
export default async function TasksPage({searchParams}: {searchParams: Promise<{new?: string}>}) {
    const [params, actor] = await Promise.all([searchParams, getCrmPageActor()]);
    return <TasksScreen initialNew={Boolean(actor && canManageLeads(actor.role) && params.new === "1")}/>;
}
