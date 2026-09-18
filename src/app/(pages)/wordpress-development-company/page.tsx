import ServiceLandingPage from "@/views/service-landing-page";
import {buildServiceLandingMetadata, getServiceLandingPage} from "@/lib/service-landing-pages";

const page = getServiceLandingPage("wordpress-development-company")!;
export const metadata = buildServiceLandingMetadata(page);
export default function WordPressDevelopmentCompanyPage() { return <ServiceLandingPage page={page}/>; }
