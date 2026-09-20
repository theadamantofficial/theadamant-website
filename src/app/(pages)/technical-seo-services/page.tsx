import ServiceLandingPage from "@/views/service-landing-page";
import {buildServiceLandingMetadata, getServiceLandingPage} from "@/lib/service-landing-pages";

const page = getServiceLandingPage("technical-seo-services")!;

export const metadata = buildServiceLandingMetadata(page);

export default function TechnicalSeoServicesPage() {
    return <ServiceLandingPage page={page}/>;
}
