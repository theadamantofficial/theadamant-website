import ServiceLandingPage from "@/views/service-landing-page";
import {buildServiceLandingMetadata, getServiceLandingPage} from "@/lib/service-landing-pages";

const page = getServiceLandingPage("saas-development-company")!;
export const metadata = buildServiceLandingMetadata(page);
export default function SaasDevelopmentCompanyPage() { return <ServiceLandingPage page={page}/>; }
