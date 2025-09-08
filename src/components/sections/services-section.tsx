"use client";

import {ServiceCard} from "@/components/ui/services-card";

export default function ServicesSection() {
    const services = [
        {
            title: "UI/UX Design",
            description: "Clean, modern, and user-friendly designs that engage and convert.",
            image: "/images/img-ui-ux-design.png",
            techStack: [
                {icon: "/vectors/logo-figma.svg", isBlackLogo: false, label: "Figma"},
            ],
        },
        {
            title: "Website Development",
            description: "Fast, scalable, and SEO-friendly websites tailored to your business.",
            image: "/images/img-web-dev.png",
            techStack: [
                {icon: "/vectors/logo-react.svg", isBlackLogo: false, label: "React.js"},
                {icon: "/vectors/logo-nextjs.svg", isBlackLogo: true, label: "Next.js"},
            ],
        },
        {
            title: "Mobile App Development",
            description: "High-performance apps with sleek design and seamless functionality.",
            image: "/images/img-app-dev.png",
            techStack: [
                {icon: "/vectors/logo-android.svg", isBlackLogo: false, label: "Android"},
                {icon: "/vectors/logo-apple.svg", isBlackLogo: true, label: "iOS"},
                {icon: "/vectors/logo-flutter.svg", isBlackLogo: false, label: "Flutter"},
            ],
        },
    ];

    return (
        <section id="services" className="py-20">
            <div className="mx-auto max-w-6xl px-6 text-center">
                {/* Section Heading */}
                <h2 className="text-3xl font-bold md:text-4xl">
                    Our Services
                </h2>

                <p className="mt-4 text-lg">
                    We craft solutions that transform ideas into impact.
                </p>

                {/* Services Grid */}
                <div className="grid md:gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {services.map((service, index) => (
                        <ServiceCard
                            key={index}
                            title={service.title}
                            description={service.description}
                            image={service.image}
                            techStack={service.techStack}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
