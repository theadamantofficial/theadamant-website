import ServiceLandingPage from "@/views/service-landing-page";
import {buildServiceLandingMetadata, getServiceLandingPage} from "@/lib/service-landing-pages";

const page = getServiceLandingPage("web-design-company-india")!;
export const metadata = buildServiceLandingMetadata(page);
export default function WebDesignCompanyIndiaPage() { return <ServiceLandingPage page={page}/>; }
