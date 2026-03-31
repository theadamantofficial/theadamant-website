"use client";

import {ServiceCard} from "@/components/ui/services-card";
import {Reveal, StaggerGroup, StaggerItem} from "@/components/ui/reveal";
import {SiteCopy} from "@/lib/site-copy";

export default function ServicesSection({copy}: { copy: SiteCopy["services"] }) {
    return (
        <section id="services" className="section-shell py-24" aria-labelledby="services-heading">
            <Reveal className="max-w-3xl">
                <p className="section-kicker">{copy.kicker}</p>
                <h2 id="services-heading" className="section-title">
                    {copy.title}
                </h2>

                <p className="section-copy">
                    {copy.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                    {copy.chips.map((chip) => (
                        <span key={chip} className="feature-chip feature-chip-animated">{chip}</span>
                    ))}
                </div>
            </Reveal>

            <StaggerGroup className="mt-10 grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
                {copy.items.map((service) => (
                    <StaggerItem key={service.title} className="h-full">
                        <ServiceCard
                            title={service.title}
                            description={service.description}
                            detail={service.detail}
                            image={service.image}
                        />
                    </StaggerItem>
                ))}
            </StaggerGroup>
        </section>
    );
}
