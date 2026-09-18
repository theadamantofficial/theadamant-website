import ServiceLandingPage from "@/views/service-landing-page";
import {buildServiceLandingMetadata, getServiceLandingPage} from "@/lib/service-landing-pages";

const page = getServiceLandingPage("seo-company-noida")!;
export const metadata = buildServiceLandingMetadata(page);
export default function SeoCompanyNoidaPage() { return <ServiceLandingPage page={page}/>; }
