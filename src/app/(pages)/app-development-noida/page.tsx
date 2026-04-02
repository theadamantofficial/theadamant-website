import ServiceLandingPage from "@/views/service-landing-page";
import {buildServiceLandingMetadata, getServiceLandingPage} from "@/lib/service-landing-pages";

const page = getServiceLandingPage("app-development-noida");

export const metadata = page ? buildServiceLandingMetadata(page) : {};

export default function AppDevelopmentNoidaPage() {
    if (!page) {
        return null;
    }

    return <ServiceLandingPage page={page}/>;
}
