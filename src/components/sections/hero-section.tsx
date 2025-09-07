import {BackgroundRippleEffect} from "@/components/ui/background-ripple-effect";

export default function HeroSection() {
    return <section className="hero-section">
        <BackgroundRippleEffect/>

        <div className="mt-60 w-full">
            <h1 className="hero-heading">
                Turning Ideas into Digital Reality.
            </h1>

            <h2 className="hero-sub-heading">
                Firm in vision, bold in action.
            </h2>
        </div>
    </section>;
}
