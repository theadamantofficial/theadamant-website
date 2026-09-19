import ServiceLandingPage from "@/views/service-landing-page";
import {buildServiceLandingMetadata, getServiceLandingPage} from "@/lib/service-landing-pages";

const page = getServiceLandingPage("ai-automation-services")!;

export const metadata = buildServiceLandingMetadata(page);

export default function AiAutomationServicesPage() {
    return <ServiceLandingPage page={page}/>;
}
