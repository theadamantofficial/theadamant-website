import {cn} from "@/lib/utils";
import {
    IconBrandFacebook,
    IconBrandFacebookFilled,
    IconBrandInstagram,
    IconBrandInstagramFilled,
    IconBrandLinkedin,
    IconBrandLinkedinFilled,
    IconBrandMedium,
    IconBrandX,
    IconBrandXFilled
} from "@tabler/icons-react";
import {AppLogo} from "@/components/ui/resizable-navbar";
import Link from "next/link";

export default function Footer() {
    // Quick Links data
    const quickLinks = [
        {
            title: "Quick Links",
            links: [
                // {name: "Home", href: "/"},
                {name: "Services", href: "/#services"},
                {name: "Contact Us", href: "/#contact-us"},
            ],
        },
        {
            title: "Legal",
            links: [
                {name: "Privacy Policy", href: "/privacy-policy"},
                {name: "Terms of Service", href: "/terms"},
                {name: "Cookie Policy", href: "/cookies"},
            ],
        },
    ];

    return <footer className="">
        <div
            className="relative flex w-full items-center justify-center pt-20 pb-10 border-t-2 rounded-t-4xl max-sm:rounded-t-2xl overflow-hidden border-foreground/25 bg-white dark:bg-background">
            <div
                // className={cn(
                //     "absolute inset-0",
                //     "[background-size:20px_20px]",
                //     "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
                //     "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
                // )}
            />
            {/* Radial gradient for the container to give a faded look */}
            <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>

            {/* Footer content */}
            <div className="relative z-20 w-full h-full flex flex-col gap-10 justify-around px-12">
                <div className="flex flex-col max-sm:gap-12 sm:flex-row justify-around">
                    {/* About */}
                    <div>
                        <div className="flex flex-col gap-4">
                            <AppLogo includeText={false}/>
                            <h1 className="font-bold text-≈lg">The Adamant</h1>
                        </div>

                        {/* socials */}
                        <div className="flex gap-4 mt-4">
                            {/* Instagram */}
                            <a href="https://www.instagram.com/theadamantofficial"
                               className="social-link group" target="_blank">
                                <IconBrandInstagram className="social-icon group-hover:hidden"/>
                                <IconBrandInstagramFilled
                                    className="social-icon hidden group-hover:block text-[#FF0069]"/>
                            </a>

                            {/* Facebook */}
                            <a href="/" className="social-link group" target="_blank">
                                <IconBrandFacebook className="social-icon group-hover:hidden"/>
                                <IconBrandFacebookFilled
                                    className="social-icon hidden group-hover:block text-[#0866FF]"/>
                            </a>

                            {/* LinkedIn */}
                            <a href="https://www.linkedin.com/company/the-adamant"
                               className="social-link group" target="_blank">
                                <IconBrandLinkedin className="social-icon group-hover:hidden"/>
                                <IconBrandLinkedinFilled
                                    className="social-icon hidden group-hover:block text-[#0A66C2]"/>
                            </a>

                            {/* X (Twitter) */}
                            <a href="https://x.com/theadamantofc" className="social-link group" target="_blank">
                                <IconBrandX className="social-icon group-hover:hidden"/>
                                <IconBrandXFilled
                                    className="social-icon hidden group-hover:block text-black dark:text-white"/>
                            </a>

                            {/* Medium */}
                            <a href="https://medium.com/@theadamant" className="social-link group" target="_blank">
                                <IconBrandMedium className="social-icon text-black dark:text-white"/>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="flex gap-12">
                        {quickLinks.map((section) => (
                            <div key={section.title} className="flex flex-col gap-4">
                                <h1 className="font-medium">{section.title}</h1>

                                <ul>
                                    {section.links.map((link) => (
                                        <li key={link.name} className="py-1">
                                            <Link href={link.href} className="hover:underline max-sm:text-sm">
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                </div>

                <p className="text-center max-sm:text-sm">
                    &copy; {new Date().getFullYear()} The Adamant. All rights reserved.
                </p>
            </div>
        </div>
    </footer>
        ;
}
