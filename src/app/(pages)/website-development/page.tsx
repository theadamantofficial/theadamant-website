import ServiceLandingPage from "@/views/service-landing-page";
import {buildServiceLandingMetadata, getServiceLandingPage} from "@/lib/service-landing-pages";

const page = getServiceLandingPage("website-development");

export const metadata = page ? buildServiceLandingMetadata(page) : {};

export default function WebsiteDevelopmentPage() {
    if (!page) {
        return null;
    }

    return <ServiceLandingPage page={page}/>;
}
