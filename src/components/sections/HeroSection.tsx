import {BackgroundRippleEffect} from "@/components/ui/background-ripple-effect";

export default function HeroSection() {
    return <section className="relative flex min-h-screen w-full flex-col items-start justify-start overflow-hidden">
        <BackgroundRippleEffect/>

        <div className={`mt-60 w-full
        `}>
            {/*bg-red-400 sm:bg-orange-300 md:bg-yellow-200 lg:bg-green-300 xl:bg-blue-300  2xl:bg-violet-300*/}
            <h1 className="relative z-10 mx-auto max-w-6xl text-center font-bold text-neutral-800 text-xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl dark:text-neutral-100">
                Turning Ideas into Digital Reality.
            </h1>
            <h2 className="relative z-10 mx-auto mt-4 max-w-3xl text-center text-lg sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-neutral-800 dark:text-neutral-500">
                Firm in vision, bold in action.
            </h2>
        </div>
    </section>;
}
