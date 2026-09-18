import ServiceLandingPage from "@/views/service-landing-page";
import {buildServiceLandingMetadata, getServiceLandingPage} from "@/lib/service-landing-pages";

const page = getServiceLandingPage("website-development-delhi-ncr")!;
export const metadata = buildServiceLandingMetadata(page);
export default function WebsiteDevelopmentDelhiNcrPage() { return <ServiceLandingPage page={page}/>; }
