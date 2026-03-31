"use client";

import {ServiceCard} from "@/components/ui/services-card";
import {Reveal, StaggerGroup, StaggerItem} from "@/components/ui/reveal";

export default function ServicesSection() {
    const services = [
        {
            title: "UI/UX Design",
            description: "Clean, modern, and user-friendly designs that engage and convert.",
            image: "/images/img-ui-ux-design.png",
        },
        {
            title: "Website Development",
            description: "Fast, scalable, and SEO-friendly websites tailored to your business.",
            image: "/images/img-web-dev.png",
        },
        {
            title: "Mobile App Development",
            description: "High-performance apps with sleek design and seamless functionality.",
            image: "/images/img-app-dev.png",
        },
    ];

    return (
        <section id="services" className="section-shell py-24" aria-labelledby="services-heading">
            <Reveal className="max-w-3xl">
                <p className="section-kicker">Services</p>
                <h2 id="services-heading" className="section-title">
                    Design and development services built to convert interest into action.
                </h2>

                <p className="section-copy">
                    From UI/UX design to SEO-friendly website development and mobile app delivery, each service is shaped to help you look credible quickly and keep momentum after launch.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                    <span className="feature-chip feature-chip-animated">Landing pages</span>
                    <span className="feature-chip feature-chip-animated">Marketing websites</span>
                    <span className="feature-chip feature-chip-animated">Product interfaces</span>
                    <span className="feature-chip feature-chip-animated">Cross-platform mobile apps</span>
                </div>
            </Reveal>

            <StaggerGroup className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                    <StaggerItem key={service.title}>
                        <ServiceCard
                            title={service.title}
                            description={service.description}
                            image={service.image}
                        />
                    </StaggerItem>
                ))}
            </StaggerGroup>
        </section>
    );
}
