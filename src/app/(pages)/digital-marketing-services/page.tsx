import ServiceLandingPage from "@/views/service-landing-page";
import {buildServiceLandingMetadata, getServiceLandingPage} from "@/lib/service-landing-pages";

const page = getServiceLandingPage("digital-marketing-services");

export const metadata = page ? buildServiceLandingMetadata(page) : {};

export default function DigitalMarketingServicesPage() {
    if (!page) {
        return null;
    }

    return <ServiceLandingPage page={page}/>;
}
