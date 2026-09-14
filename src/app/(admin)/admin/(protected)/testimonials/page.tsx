import {redirect} from "next/navigation";
import {getCrmPageActor} from "@/lib/crm/auth";
import {canManageLeads} from "@/features/crm/permissions";
import {TestimonialsScreen} from "@/features/crm/testimonials/testimonials-screen";

export const metadata = {title: "Testimonials"};

export default async function TestimonialsPage() {
    const actor = await getCrmPageActor();
    if (!actor) redirect("/admin/login");
    if (!canManageLeads(actor.role)) redirect("/admin");
    return <TestimonialsScreen/>;
}
