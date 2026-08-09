import {redirect} from "next/navigation";
import {getCrmPageActor} from "@/lib/crm/auth";

export const dynamic = "force-dynamic";

export default async function AdminIndexPage() {
    const actor = await getCrmPageActor();
    redirect(actor ? "/admin/dashboard" : "/admin/login");
}
