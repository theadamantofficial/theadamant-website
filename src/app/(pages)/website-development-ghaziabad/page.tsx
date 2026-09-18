import ServiceLandingPage from "@/views/service-landing-page";
import {buildServiceLandingMetadata, getServiceLandingPage} from "@/lib/service-landing-pages";

const page = getServiceLandingPage("website-development-ghaziabad")!;
export const metadata = buildServiceLandingMetadata(page);
export default function WebsiteDevelopmentGhaziabadPage() { return <ServiceLandingPage page={page}/>; }
