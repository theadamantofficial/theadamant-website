import ServiceLandingPage from "@/views/service-landing-page";
import {buildServiceLandingMetadata, getServiceLandingPage} from "@/lib/service-landing-pages";

const page = getServiceLandingPage("crm-development-services")!;

export const metadata = buildServiceLandingMetadata(page);

export default function CrmDevelopmentServicesPage() {
    return <ServiceLandingPage page={page}/>;
}
