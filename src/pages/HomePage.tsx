import HeroSection from "@/components/sections/HeroSection";
import {Navbar} from "@/components/layouts/NavBar";
import Footer from "@/components/layouts/Footer";

export default function HomePage() {
    return <main className="relative w-full">
        <Navbar/>

        <HeroSection/>

        <div className="h-[100vh]">

        </div>

        <Footer/>
    </main>;
}
