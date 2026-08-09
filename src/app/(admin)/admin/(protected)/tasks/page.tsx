import {TasksScreen} from "@/features/crm/tasks/tasks-screen";

export const metadata = {title: "Tasks"};
export default async function TasksPage({searchParams}: {searchParams: Promise<{new?: string}>}) { const params = await searchParams; return <TasksScreen initialNew={params.new === "1"}/>; }
