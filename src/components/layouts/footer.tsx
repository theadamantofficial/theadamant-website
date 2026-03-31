import {
    IconBrandInstagram,
    IconBrandLinkedin,
    IconBrandMedium,
    IconBrandX,
} from "@tabler/icons-react";
import {AppLogo} from "@/components/ui/resizable-navbar";
import Link from "next/link";
import {SiteCopy} from "@/lib/site-copy";
import {getLocalizedPath, SiteLocale} from "@/lib/site-locale";

export default function Footer({
    copy,
    locale,
}: {
    copy: SiteCopy["footer"];
    locale: SiteLocale;
}) {
    return <footer className="section-shell pb-12 pt-6">
        <div className="glass-panel overflow-hidden px-6 py-10 sm:px-8">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
                <div>
                    <div className="flex flex-col gap-4">
                        <AppLogo includeText={false} href={getLocalizedPath(locale)}/>
                        <h2 className="text-2xl font-semibold tracking-tight text-foreground">The Adamant</h2>
                        <p className="max-w-md text-sm leading-7 text-foreground/68">
                            {copy.description}
                        </p>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <a href="https://www.instagram.com/theadamantofficial" className="social-link" target="_blank" rel="noreferrer" aria-label="The Adamant on Instagram">
                            <IconBrandInstagram className="social-icon"/>
                        </a>
                        <a href="https://www.linkedin.com/company/the-adamant" className="social-link" target="_blank" rel="noreferrer" aria-label="The Adamant on LinkedIn">
                            <IconBrandLinkedin className="social-icon"/>
                        </a>
                        <a href="https://x.com/theadamantofc" className="social-link" target="_blank" rel="noreferrer" aria-label="The Adamant on X">
                            <IconBrandX className="social-icon"/>
                        </a>
                        <a href="https://medium.com/@theadamant" className="social-link" target="_blank" rel="noreferrer" aria-label="The Adamant on Medium">
                            <IconBrandMedium className="social-icon"/>
                        </a>
                    </div>
                </div>

                {copy.sections.map((section) => (
                    <div key={section.title} className="flex flex-col gap-4">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground/55">{section.title}</h3>

                        <ul className="space-y-2">
                            {section.links.map((link) => (
                                <li key={link.name}>
                                    <Link href={getLocalizedPath(locale, link.anchor)} className="text-sm text-foreground/70 transition hover:text-foreground hover:underline">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 border-t border-black/10 pt-6 text-sm text-foreground/62 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                <p>&copy; {new Date().getFullYear()} {copy.copyright}</p>
                <p>{copy.tagline}</p>
            </div>
        </div>
    </footer>
}
