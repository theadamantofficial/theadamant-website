import HeroSection from "@/components/sections/hero-section";
import {Navbar} from "@/components/layouts/navbar";
import Footer from "@/components/layouts/footer";
import ContactUsSection from "@/components/sections/contact-us-section";
import ServicesSection from "@/components/sections/services-section";

export default function HomePage() {
    return <main className="relative w-full">
        <Navbar/>

        <HeroSection/>

        <ServicesSection/>

        <ContactUsSection/>

        <Footer/>
    </main>;
}
