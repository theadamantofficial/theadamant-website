import ServiceLandingPage from "@/views/service-landing-page";
import {buildServiceLandingMetadata, getServiceLandingPage} from "@/lib/service-landing-pages";

const page = getServiceLandingPage("app-development-india")!;
export const metadata = buildServiceLandingMetadata(page);
export default function AppDevelopmentIndiaPage() { return <ServiceLandingPage page={page}/>; }
