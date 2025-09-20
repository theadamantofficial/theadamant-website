import {BackgroundRippleEffect} from "@/components/ui/background-ripple-effect";
import {TypewriterEffectSmooth} from "@/components/ui/typewriter-effect";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";

export default function HeroSection() {
    const subtextWords = [
        {
            text: "Firm",
        },
        {
            text: "in"
        },
        {
            text: "vision,"
        },
        {
            text: "bold"
        },
        {
            text: "in"
        },
        {
            text: "action."
        }
    ]

    return <section className="hero-section">
        <BackgroundRippleEffect/>

        <div className="flex flex-col gap-10 mt-60 w-full">
            <h1 className="hero-heading animate-fadeIn">
                Turning Ideas into Digital Reality.
            </h1>

            <TypewriterEffectSmooth
                words={subtextWords}
                className="hero-sub-heading"
            />
        </div>

        <DotLottieReact
            src="/animations/tech-sphere.lottie"
            loop
            autoplay
            style={{width: '100%', height: '100%'}}
            className="mt-10"
        />
    </section>;
}
