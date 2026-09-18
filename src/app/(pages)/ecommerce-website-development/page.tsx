import ServiceLandingPage from "@/views/service-landing-page";
import {buildServiceLandingMetadata, getServiceLandingPage} from "@/lib/service-landing-pages";

const page = getServiceLandingPage("ecommerce-website-development")!;
export const metadata = buildServiceLandingMetadata(page);
export default function EcommerceWebsiteDevelopmentPage() { return <ServiceLandingPage page={page}/>; }
