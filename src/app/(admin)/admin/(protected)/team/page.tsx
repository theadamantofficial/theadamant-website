import {TeamScreen} from "@/features/crm/team/team-screen";
import {redirect} from "next/navigation";
import {getCrmPageActor} from "@/lib/crm/auth";

export const metadata = {title: "Team"};
export default async function TeamPage() {
    const actor = await getCrmPageActor();
    if (!actor || actor.role === "employee") redirect("/admin/dashboard");
    return <TeamScreen/>;
}
