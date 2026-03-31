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
        <section id="services" className="section-shell py-24" aria-labelledby="services-heading">
            <div className="max-w-3xl">
                <p className="section-kicker">Services</p>
                <h2 id="services-heading" className="section-title">
                    Design and development services built to convert interest into action.
                </h2>

                <p className="section-copy">
                    From UI/UX design to SEO-friendly website development and mobile app delivery, each service is shaped to help you look credible quickly and keep momentum after launch.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                    <span className="feature-chip">Landing pages</span>
                    <span className="feature-chip">Marketing websites</span>
                    <span className="feature-chip">Product interfaces</span>
                    <span className="feature-chip">Cross-platform mobile apps</span>
                </div>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                    <ServiceCard
                        key={service.title}
                        title={service.title}
                        description={service.description}
                        image={service.image}
                        techStack={service.techStack}
                    />
                ))}
            </div>
        </section>
    );
}
