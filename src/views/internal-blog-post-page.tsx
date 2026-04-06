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
    const blocks = tokenizeArticleBlocks(content);

    return blocks.map((block, index) => {
        if (block.type === "hr") {
            return <hr key={index} className="border-black/10 dark:border-white/10"/>;
        }

        if (block.type === "heading") {
            if (block.level >= 3) {
                return (
                    <h3 key={index} className="text-xl font-semibold text-foreground sm:text-2xl">
                        {renderInlineMarkdown(block.text)}
                    </h3>
                );
            }

            return (
                <h2 key={index} className="text-2xl font-semibold text-foreground sm:text-3xl">
                    {renderInlineMarkdown(block.text)}
                </h2>
            );
        }

        if (block.type === "list") {
            const ListTag = block.ordered ? "ol" : "ul";

            return (
                <ListTag key={index} className={`pl-5 ${block.ordered ? "list-decimal" : "list-disc"} space-y-2`}>
                    {block.items.map((item) => (
                        <li key={item}>{renderInlineMarkdown(item)}</li>
                    ))}
                </ListTag>
            );
        }

        return (
            <p key={index} className="whitespace-pre-wrap">
                {block.text.split("\n").map((line, lineIndex) => (
                    <span key={`${index}-${lineIndex}`}>
                        {lineIndex > 0 ? <br/> : null}
                        {renderInlineMarkdown(line)}
                    </span>
                ))}
            </p>
        );
    });
}

function tokenizeArticleBlocks(content: string): Array<
    | {type: "hr"}
    | {type: "heading"; level: 1 | 2 | 3 | 4; text: string}
    | {type: "list"; ordered: boolean; items: string[]}
    | {type: "paragraph"; text: string}
> {
    const normalized = normalizeArticleContent(content);
    const lines = normalized.split("\n");
    const blocks: Array<
        | {type: "hr"}
        | {type: "heading"; level: 1 | 2 | 3 | 4; text: string}
        | {type: "list"; ordered: boolean; items: string[]}
        | {type: "paragraph"; text: string}
    > = [];
    let paragraphLines: string[] = [];
    let listLines: string[] = [];
    let isOrderedList = false;

    const flushParagraph = () => {
        if (!paragraphLines.length) {
            return;
        }

        const paragraphText = paragraphLines.join("\n").trim();
        if (paragraphText) {
            blocks.push({type: "paragraph", text: paragraphText});
        }
        paragraphLines = [];
    };

    const flushList = () => {
        if (!listLines.length) {
            return;
        }

        blocks.push({type: "list", ordered: isOrderedList, items: listLines});
        listLines = [];
        isOrderedList = false;
    };

    for (const rawLine of lines) {
        const line = rawLine.trim();
        const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
        const unorderedMatch = line.match(/^[-*+]\s+(.*)$/);
        const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/);

        if (headingMatch) {
            flushParagraph();
            flushList();
            blocks.push({
                type: "heading",
                level: Math.min(4, Math.max(1, headingMatch[1].length)) as 1 | 2 | 3 | 4,
                text: headingMatch[2].trim(),
            });
            continue;
        }

        if (/^---+$/.test(line)) {
            flushParagraph();
            flushList();
            blocks.push({type: "hr"});
            continue;
        }

        if (!line) {
            flushParagraph();
            flushList();
            continue;
        }

        if (orderedMatch) {
            flushParagraph();

            if (listLines.length > 0 && !isOrderedList) {
                flushList();
            }
            isOrderedList = true;
            listLines.push(orderedMatch[2].trim());
            continue;
        }

        if (unorderedMatch) {
            flushParagraph();

            if (listLines.length > 0 && isOrderedList) {
                flushList();
            }
            isOrderedList = false;
            listLines.push(unorderedMatch[1].trim());
            continue;
        }

        paragraphLines.push(line);
    }

    flushParagraph();
    flushList();
    return blocks;
}

function normalizeArticleContent(content: string) {
    let normalized = content
        .replace(/\r\n?/g, "\n")
        .replace(/<\s*\/?\s*br\s*\/?\s*>/gi, "\n")
        .replace(/<\s*\/?\s*hr\s*\/?\s*>/gi, "\n---\n")
        .replace(/<\s*\/?\s*p[^>]*>/gi, "\n")
        .replace(/<\s*\/?\s*ul[^>]*>/gi, "\n")
        .replace(/<\s*\/?\s*ol[^>]*>/gi, "\n")
        .replace(/<\s*li\b[^>]*>([\s\S]*?)<\s*\/\s*li>/gi, "- $1\n")
        .replace(/<\s*h1\b[^>]*>([\s\S]*?)<\s*\/\s*h1>/gi, "\n# $1\n")
        .replace(/<\s*h2\b[^>]*>([\s\S]*?)<\s*\/\s*h2>/gi, "\n## $1\n")
        .replace(/<\s*h3\b[^>]*>([\s\S]*?)<\s*\/\s*h3>/gi, "\n### $1\n")
        .replace(/<\s*h4\b[^>]*>([\s\S]*?)<\s*\/\s*h4>/gi, "\n### $1\n")
        .replace(/<\s*strong\b[^>]*>([\s\S]*?)<\s*\/\s*strong>/gi, "**$1**")
        .replace(/<\s*b\b[^>]*>([\s\S]*?)<\s*\/\s*b>/gi, "**$1**")
        .replace(/<\s*em\b[^>]*>([\s\S]*?)<\s*\/\s*em>/gi, "*$1*")
        .replace(/<\s*i\b[^>]*>([\s\S]*?)<\s*\/\s*i>/gi, "*$1*")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, "\"")
        .replace(/&#39;/gi, "'")
        .replace(/&apos;/gi, "'");

    normalized = normalized
        .replace(/<\s*\/?\s*[^>]+>/gi, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    return normalized;
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
