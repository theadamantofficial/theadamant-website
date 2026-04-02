import Link from "next/link";
import dynamic from "next/dynamic";
import {ArrowLeft, ArrowRight, Clock3, PenSquare} from "lucide-react";
import {Navbar} from "@/components/layouts/navbar";
import Footer from "@/components/layouts/footer";
import {InternalBlogPost} from "@/lib/internal-blog";
import {SiteCopy} from "@/lib/site-copy";
import {getLocalizedPagePath, getLocalizedPath, localeToHtmlLang, SiteLocale} from "@/lib/site-locale";
import {getSiteUrl} from "@/lib/site-url";
import {OpenAuditButton} from "@/components/ui/open-audit-button";
import {buildFallbackBlogCoverDataUrl} from "@/lib/ai-blog-cover";

const WebsiteAuditFab = dynamic(
    () => import("@/components/ui/website-audit-fab").then((module) => module.WebsiteAuditFab),
);
const SeoChatFab = dynamic(
    () => import("@/components/ui/seo-chat-fab").then((module) => module.SeoChatFab),
);

export default function InternalBlogPostPage({
    copy,
    locale,
    post,
}: {
    copy: SiteCopy;
    locale: SiteLocale;
    post: InternalBlogPost;
}) {
    const formattedLocale = localeToHtmlLang(locale);
    const readTime = estimateReadTime(post.content);
    const formattedDate = new Intl.DateTimeFormat(formattedLocale, {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(post.publishedAt));
    const siteUrl = getSiteUrl();
    const articleUrl = `${siteUrl}${getLocalizedPagePath(locale, `blog/${post.slug}`)}`;
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        inLanguage: locale,
        keywords: post.tags,
        mainEntityOfPage: articleUrl,
        url: articleUrl,
        author: {
            "@type": "Person",
            name: post.authorName,
        },
        publisher: {
            "@type": "Organization",
            name: "The Adamant",
            url: siteUrl,
        },
        image: resolveOptionalUrl(post.coverImage, siteUrl),
    };

    return (
        <main className="relative min-h-screen overflow-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(articleSchema)}}
            />

            <Navbar copy={copy.navbar} locale={locale}/>
            {locale === "en" && <WebsiteAuditFab locale={locale}/>}
            {locale === "en" && <SeoChatFab/>}

            <section className="relative px-6 pb-12 pt-28 sm:px-8 lg:px-12">
                <div className="section-shell">
                    <Link href={getLocalizedPagePath(locale, "blog")} className="button-secondary">
                        <ArrowLeft className="h-4 w-4"/>
                        Back to blog
                    </Link>

                    <div className="mt-8 max-w-4xl">
                        <p className="section-kicker">
                            <PenSquare className="h-4 w-4"/>
                            The Adamant article
                        </p>
                        <h1 className="section-title max-w-4xl">{post.title}</h1>
                        <p className="section-copy max-w-3xl">{post.excerpt}</p>

                        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-foreground/62">
                            <span>{formattedDate}</span>
                            <span className="h-1.5 w-1.5 rounded-full bg-foreground/24"/>
                            <span>{post.authorName}</span>
                            <span className="h-1.5 w-1.5 rounded-full bg-foreground/24"/>
                            <span className="inline-flex items-center gap-2">
                                <Clock3 className="h-4 w-4"/>
                                {readTime}
                            </span>
                        </div>

                        {post.tags.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-2">
                                {post.tags.map((tag) => (
                                    <span key={tag} className="feature-chip !px-3 !py-1 text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="section-shell pb-20">
                <article className="glass-panel overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={post.coverImage || buildFallbackBlogCoverDataUrl(post)}
                        alt={post.title}
                        className="h-[18rem] w-full object-cover sm:h-[24rem]"
                    />

                    <div className="mx-auto max-w-3xl px-6 py-8 sm:px-8 sm:py-10">
                        <div className="space-y-6 text-base leading-8 text-foreground/78 sm:text-lg">
                            {renderArticleBlocks(post.content)}
                        </div>

                        <div className="mt-10 rounded-[1.7rem] border border-black/8 bg-black/[0.03] p-6 dark:border-white/10 dark:bg-white/[0.03]">
                            <p className="text-sm font-semibold text-foreground">
                                Need help applying these ideas to your own website?
                            </p>
                            <p className="mt-2 text-sm leading-7 text-foreground/66">
                                The same team that writes these strategy notes can help you fix performance issues,
                                tighten SEO fundamentals, and turn the site into a stronger conversion machine.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-3">
                                <Link href={getLocalizedPath(locale, "contact")} className="button-primary">
                                    Start a project
                                    <ArrowRight className="h-4 w-4"/>
                                </Link>
                                {locale === "en" && (
                                    <OpenAuditButton>
                                        Get free audit
                                    </OpenAuditButton>
                                )}
                            </div>
                        </div>
                    </div>
                </article>
            </section>

            <Footer copy={copy.footer} locale={locale}/>
        </main>
    );
}

function renderArticleBlocks(content: string) {
    const blocks = content
        .split(/\n{2,}/)
        .map((block) => block.trim())
        .filter(Boolean);

    return blocks.map((block, index) => {
        if (/^---+$/.test(block)) {
            return <hr key={index} className="border-black/10 dark:border-white/10"/>;
        }

        if (block.startsWith("### ")) {
            return (
                <h3 key={index} className="text-xl font-semibold text-foreground sm:text-2xl">
                    {renderInlineMarkdown(block.replace(/^###\s+/, ""))}
                </h3>
            );
        }

        if (block.startsWith("## ")) {
            return (
                <h2 key={index} className="text-2xl font-semibold text-foreground sm:text-3xl">
                    {renderInlineMarkdown(block.replace(/^##\s+/, ""))}
                </h2>
            );
        }

        if (block.startsWith("# ")) {
            return (
                <h2 key={index} className="text-2xl font-semibold text-foreground sm:text-3xl">
                    {renderInlineMarkdown(block.replace(/^#\s+/, ""))}
                </h2>
            );
        }

        const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);

        if (lines.every((line) => /^[-*]\s+/.test(line))) {
            return (
                <ul key={index} className="list-disc space-y-2 pl-5 text-foreground/78">
                    {lines.map((line) => (
                        <li key={line}>{renderInlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>
                    ))}
                </ul>
            );
        }

        return (
            <p key={index} className="whitespace-pre-wrap">
                {lines.map((line, lineIndex) => (
                    <span key={lineIndex}>
                        {lineIndex > 0 ? <br/> : null}
                        {renderInlineMarkdown(line)}
                    </span>
                ))}
            </p>
        );
    });
}

function renderInlineMarkdown(text: string) {
    const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);

    return tokens.map((token, index) => {
        if (/^\*\*[^*]+\*\*$/.test(token)) {
            return <strong key={index} className="font-semibold text-foreground">{token.slice(2, -2)}</strong>;
        }

        if (/^\*[^*]+\*$/.test(token)) {
            return <em key={index}>{token.slice(1, -1)}</em>;
        }

        return <span key={index}>{token}</span>;
    });
}

function estimateReadTime(content: string) {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 220));
    return `${minutes} min read`;
}

function resolveOptionalUrl(value: string | null, siteUrl: string) {
    if (!value) {
        return undefined;
    }

    if (/^https?:\/\//.test(value)) {
        return value;
    }

    return `${siteUrl}${value.startsWith("/") ? value : `/${value}`}`;
}
