import Link from "next/link";
import {ArrowRight, ExternalLink, PenSquare} from "lucide-react";
import {Navbar} from "@/components/layouts/navbar";
import Footer from "@/components/layouts/footer";
import {MEDIUM_URL} from "@/lib/blog-config";
import {InternalBlogPost} from "@/lib/internal-blog";
import {SiteCopy} from "@/lib/site-copy";
import {getLocalizedPagePath, getLocalizedPath, localeToHtmlLang, SiteLocale} from "@/lib/site-locale";
import {MediumPost} from "@/lib/medium";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

const BLOG_COPY: Record<SiteLocale, {
    kicker: string;
    title: string;
    description: string;
    latestLabel: string;
    emptyTitle: string;
    emptyDescription: string;
    visitMedium: string;
    startProject: string;
    freshness: string;
}> = {
    en: {
        kicker: "Blog hub",
        title: "Insights from The Adamant, published on-site and distributed through Medium.",
        description: "This blog keeps your content discoverable on your own domain while still letting Medium support wider reach. Read internal articles and linked insights on web design, UX, SEO, and digital product strategy.",
        latestLabel: "Latest articles",
        emptyTitle: "New articles will appear here as soon as they are published on Medium.",
        emptyDescription: "This page is ready to become your on-site blog hub. Publish on Medium, and the latest posts can be surfaced here for better internal linking and content discovery.",
        visitMedium: "Visit Medium profile",
        startProject: "Need help fixing what your content uncovers?",
        freshness: "Updated from Medium",
    },
    hi: {
        kicker: "ब्लॉग हब",
        title: "The Adamant के लेख, Medium पर प्रकाशित।",
        description: "यह पेज आपके content को आपकी अपनी domain पर discoverable रखता है, जबकि publishing workflow Medium पर बना रहता है। web design, UX, SEO और digital product strategy पर latest insights पढ़ें।",
        latestLabel: "नवीनतम लेख",
        emptyTitle: "जैसे ही Medium पर नए लेख प्रकाशित होंगे, वे यहाँ दिखाई देंगे।",
        emptyDescription: "यह पेज आपके on-site blog hub के रूप में तैयार है। Medium पर publish करें और latest posts यहाँ दिखाएँ ताकि internal linking और content discovery बेहतर हो।",
        visitMedium: "Medium प्रोफ़ाइल देखें",
        startProject: "क्या आपके content से निकली issues को ठीक करना है?",
        freshness: "Medium से अपडेटेड",
    },
    gu: {
        kicker: "બ્લોગ હબ",
        title: "The Adamant ના લેખો, Medium પર પ્રકાશિત.",
        description: "આ પેજ તમારા content ને તમારા પોતાના domain પર discoverable રાખે છે, જ્યારે publishing workflow Medium પર જ રહે છે. web design, UX, SEO અને digital product strategy વિષયક latest insights વાંચો.",
        latestLabel: "તાજેતરના લેખો",
        emptyTitle: "Medium પર નવા લેખો પ્રકાશિત થતા જ તેઓ અહીં દેખાશે.",
        emptyDescription: "આ પેજ તમારા on-site blog hub તરીકે તૈયાર છે. Medium પર publish કરો અને latest posts અહીં બતાવો જેથી internal linking અને content discovery વધુ સારા બને.",
        visitMedium: "Medium પ્રોફાઇલ જુઓ",
        startProject: "તમારા content દ્વારા મળેલા issues સુધારવા છે?",
        freshness: "Mediumમાંથી અપડેટેડ",
    },
    mr: {
        kicker: "ब्लॉग हब",
        title: "The Adamant चे लेख, Medium वर प्रकाशित.",
        description: "हे पेज तुमचे content तुमच्या स्वतःच्या domain वर discoverable ठेवते, तर publishing workflow Medium वरच राहते. web design, UX, SEO आणि digital product strategy वरील latest insights वाचा.",
        latestLabel: "नवीन लेख",
        emptyTitle: "Medium वर नवीन लेख प्रकाशित होताच ते इथे दिसतील.",
        emptyDescription: "हे पेज तुमच्या on-site blog hub म्हणून तयार आहे. Medium वर publish करा आणि latest posts इथे दाखवा, जेणेकरून internal linking आणि content discovery अधिक चांगले होईल.",
        visitMedium: "Medium प्रोफाइल पहा",
        startProject: "तुमच्या content मधून दिसलेले issues fix करायचे आहेत?",
        freshness: "Medium वरून अपडेटेड",
    },
    bn: {
        kicker: "ব্লগ হাব",
        title: "The Adamant-এর আর্টিকেল, Medium-এ প্রকাশিত।",
        description: "এই পেজ আপনার content-কে আপনার নিজের domain-এ discoverable রাখে, যখন publishing workflow Medium-এ থাকে। web design, UX, SEO এবং digital product strategy নিয়ে latest insights পড়ুন।",
        latestLabel: "সর্বশেষ আর্টিকেল",
        emptyTitle: "Medium-এ নতুন আর্টিকেল প্রকাশ হলেই সেগুলো এখানে দেখাবে।",
        emptyDescription: "এই পেজটি আপনার on-site blog hub হিসেবে প্রস্তুত। Medium-এ publish করুন এবং latest posts এখানে দেখান, যাতে internal linking এবং content discovery আরও ভালো হয়।",
        visitMedium: "Medium প্রোফাইল দেখুন",
        startProject: "আপনার content যে issues দেখাচ্ছে, সেগুলো ঠিক করতে চান?",
        freshness: "Medium থেকে আপডেটেড",
    },
    ta: {
        kicker: "ப்ளாக் ஹப்",
        title: "The Adamant கட்டுரைகள், Medium-ல் வெளியிடப்பட்டவை.",
        description: "இந்த பக்கம் உங்கள் content-ஐ உங்கள் சொந்த domain-ல் discoverable ஆக வைத்திருக்கிறது, publishing workflow மட்டும் Medium-ல் இருக்கும். web design, UX, SEO மற்றும் digital product strategy குறித்த latest insights-ஐ படிக்கலாம்.",
        latestLabel: "சமீபத்திய கட்டுரைகள்",
        emptyTitle: "Medium-ல் புதிய கட்டுரைகள் வெளியாகும் போது அவை இங்கே தோன்றும்.",
        emptyDescription: "இந்த பக்கம் உங்கள் on-site blog hub ஆக தயாராக உள்ளது. Medium-ல் publish செய்து, latest posts-ஐ இங்கே காட்டலாம்; அதனால் internal linking மற்றும் content discovery மேம்படும்.",
        visitMedium: "Medium ப்ரொஃபைலை பார்க்கவும்",
        startProject: "உங்கள் content காட்டும் issues-ஐ சரி செய்ய வேண்டுமா?",
        freshness: "Medium-இலிருந்து புதுப்பிக்கப்பட்டது",
    },
    es: {
        kicker: "Blog hub",
        title: "Articulos de The Adamant publicados en Medium.",
        description: "Esta pagina mantiene tu contenido visible en tu propio dominio mientras tu flujo de publicacion sigue en Medium. Lee ideas sobre web design, UX, SEO y estrategia digital.",
        latestLabel: "Ultimos articulos",
        emptyTitle: "Los nuevos articulos apareceran aqui en cuanto se publiquen en Medium.",
        emptyDescription: "Esta pagina ya funciona como tu blog hub dentro del sitio. Publica en Medium y muestra aqui las entradas mas recientes para mejorar el linking interno y el descubrimiento.",
        visitMedium: "Visitar perfil de Medium",
        startProject: "Quieres corregir los problemas que revela tu contenido?",
        freshness: "Actualizado desde Medium",
    },
    fr: {
        kicker: "Blog hub",
        title: "Articles de The Adamant publies sur Medium.",
        description: "Cette page rend votre contenu visible sur votre propre domaine tout en gardant votre flux de publication sur Medium. Lisez nos contenus sur le design web, l'UX, le SEO et la strategie digitale.",
        latestLabel: "Derniers articles",
        emptyTitle: "Les nouveaux articles apparaitront ici des qu'ils seront publies sur Medium.",
        emptyDescription: "Cette page est deja prete a servir de hub de blog sur votre site. Publiez sur Medium puis affichez ici les derniers posts pour renforcer le maillage interne et la decouverte.",
        visitMedium: "Voir le profil Medium",
        startProject: "Vous voulez corriger les problemes que votre contenu revele ?",
        freshness: "Mis a jour depuis Medium",
    },
    de: {
        kicker: "Blog hub",
        title: "Artikel von The Adamant, veroffentlicht auf Medium.",
        description: "Diese Seite macht Ihre Inhalte auf Ihrer eigenen Domain auffindbar, wahrend Ihr Publishing-Workflow auf Medium bleibt. Lesen Sie Insights zu Webdesign, UX, SEO und digitaler Strategie.",
        latestLabel: "Neueste Artikel",
        emptyTitle: "Neue Artikel erscheinen hier, sobald sie auf Medium veroffentlicht werden.",
        emptyDescription: "Diese Seite ist bereits als Blog-Hub auf Ihrer Website vorbereitet. Veroffentlichen Sie auf Medium und zeigen Sie die neuesten Posts hier an, um interne Verlinkung und Auffindbarkeit zu verbessern.",
        visitMedium: "Medium-Profil besuchen",
        startProject: "Mochten Sie die Probleme beheben, die Ihre Inhalte aufdecken?",
        freshness: "Von Medium aktualisiert",
    },
    pt: {
        kicker: "Blog hub",
        title: "Artigos da The Adamant publicados no Medium.",
        description: "Esta pagina mantem seu conteudo descobrivel no seu proprio dominio enquanto seu fluxo de publicacao continua no Medium. Leia insights sobre web design, UX, SEO e estrategia digital.",
        latestLabel: "Artigos recentes",
        emptyTitle: "Novos artigos aparecerao aqui assim que forem publicados no Medium.",
        emptyDescription: "Esta pagina ja funciona como o hub do seu blog no site. Publique no Medium e exiba aqui os posts mais recentes para melhorar links internos e descoberta de conteudo.",
        visitMedium: "Visitar perfil no Medium",
        startProject: "Quer corrigir os problemas que seu conteudo revela?",
        freshness: "Atualizado do Medium",
    },
    ja: {
        kicker: "ブログハブ",
        title: "The Adamant の記事を Medium からまとめて読む。",
        description: "公開フローは Medium のままにしながら、このページでコンテンツを自社ドメイン上に見つけやすくします。Webデザイン、UX、SEO、デジタル戦略に関する記事をまとめて確認できます。",
        latestLabel: "最新記事",
        emptyTitle: "Medium に新しい記事が公開されると、ここに表示されます。",
        emptyDescription: "このページは自社サイト上のブログハブとして機能します。Medium に公開した記事をここで案内し、内部導線と発見性を高めます。",
        visitMedium: "Medium プロフィールを見る",
        startProject: "記事で見つかった課題を改善したいですか？",
        freshness: "Medium から更新",
    },
};

const INTERFACE_COPY = {
    sectionTitle: "Articles on The Adamant",
    sectionDescription: "Internal articles published on your site appear here first. Medium posts can still sit alongside them for discovery and internal linking.",
    adminAccess: "Company member login",
    internalTitle: "Published on The Adamant",
    internalEmptyTitle: "No internal blog posts yet.",
    internalEmptyDescription: "Use the company member login to publish your first on-site article. It will appear in this section immediately.",
    mediumTitle: "From Medium",
    mediumEmptyTitle: "No Medium posts available right now.",
    mediumEmptyDescription: "The Medium feed is still connected here, so published posts can continue to strengthen discovery from your own domain.",
    readArticle: "Read article",
    readOnMedium: "Read on Medium",
    mediumSourceLabel: "Medium",
    internalSourceLabel: "The Adamant",
};

export default function BlogPage({
    copy,
    locale,
    mediumPosts,
    internalPosts,
}: {
    copy: SiteCopy;
    locale: SiteLocale;
    mediumPosts: MediumPost[];
    internalPosts: InternalBlogPost[];
}) {
    const blogCopy = BLOG_COPY[locale];
    const formattedLocale = localeToHtmlLang(locale);
    const pathname = getLocalizedPagePath(locale, "blog");

    const schemas = [
        {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "The Adamant Blog",
            url: siteUrl ? `${siteUrl}${pathname}` : pathname,
            inLanguage: locale,
            description: blogCopy.description,
            publisher: {
                "@type": "Organization",
                name: "The Adamant",
                sameAs: [MEDIUM_URL],
            },
            blogPost: [
                ...internalPosts.map((post) => ({
                    "@type": "BlogPosting",
                    headline: post.title,
                    url: siteUrl
                        ? `${siteUrl}${getLocalizedPagePath(locale, `blog/${post.slug}`)}`
                        : getLocalizedPagePath(locale, `blog/${post.slug}`),
                    datePublished: post.publishedAt,
                    description: post.excerpt,
                    author: {
                        "@type": "Person",
                        name: post.authorName,
                    },
                })),
                ...mediumPosts.map((post) => ({
                    "@type": "BlogPosting",
                    headline: post.title,
                    url: post.link,
                    datePublished: post.publishedAt,
                    description: post.excerpt,
                })),
            ],
        },
    ];

    return (
        <main className="relative min-h-screen overflow-hidden">
            {schemas.map((schema, index) => (
                <script
                    key={index}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}}
                />
            ))}

            <Navbar copy={copy.navbar} locale={locale}/>

            <section className="relative px-6 pb-16 pt-28 sm:px-8 lg:px-12">
                <div className="section-shell">
                    <p className="section-kicker">
                        <PenSquare className="h-4 w-4"/>
                        {blogCopy.kicker}
                    </p>
                    <h1 className="section-title">{blogCopy.title}</h1>
                    <p className="section-copy max-w-3xl">{blogCopy.description}</p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <a href={MEDIUM_URL} target="_blank" rel="noreferrer" className="button-secondary">
                            {blogCopy.visitMedium}
                            <ExternalLink className="h-4 w-4"/>
                        </a>
                        <Link href={getLocalizedPagePath(locale, "blog/admin")} className="button-secondary">
                            {INTERFACE_COPY.adminAccess}
                            <ArrowRight className="h-4 w-4"/>
                        </Link>
                        <Link href={getLocalizedPath(locale, "contact")} className="button-primary">
                            {blogCopy.startProject}
                            <ArrowRight className="h-4 w-4"/>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="section-shell pb-16">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">{INTERFACE_COPY.sectionTitle}</h2>
                        <p className="mt-2 max-w-3xl text-sm leading-7 text-foreground/66">
                            {INTERFACE_COPY.sectionDescription}
                        </p>
                    </div>
                    <p className="text-sm text-foreground/58">{blogCopy.freshness}</p>
                </div>

                <div className="mt-8">
                    <SectionHeader title={INTERFACE_COPY.internalTitle} badge={INTERFACE_COPY.internalSourceLabel}/>
                    {internalPosts.length > 0 ? (
                        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {internalPosts.map((post) => (
                                <article key={post.id} className="glass-panel lift-card flex h-full flex-col overflow-hidden">
                                    {post.coverImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={post.coverImage}
                                            alt={post.title}
                                            className="h-52 w-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="h-52 bg-[radial-gradient(circle_at_top_left,rgba(13,92,99,0.18),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(234,223,206,0.7))] dark:bg-[radial-gradient(circle_at_top_left,rgba(88,183,179,0.18),transparent_45%),linear-gradient(180deg,rgba(24,28,31,0.92),rgba(14,17,19,0.94))]"/>
                                    )}

                                    <div className="flex flex-1 flex-col p-6">
                                        <div className="flex flex-wrap gap-2">
                                            {post.tags.slice(0, 3).map((tag) => (
                                                <span key={tag} className="feature-chip !px-3 !py-1 text-xs">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <h3 className="mt-4 text-xl font-semibold leading-8 text-foreground">
                                            {post.title}
                                        </h3>

                                        <p className="mt-3 text-sm leading-7 text-foreground/70">
                                            {post.excerpt}
                                        </p>

                                        <div className="mt-auto pt-6">
                                            <div className="text-sm text-foreground/55">
                                                {formatPublishedDate(post.publishedAt, formattedLocale)}
                                            </div>
                                            <Link
                                                href={getLocalizedPagePath(locale, `blog/${post.slug}`)}
                                                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition hover:text-primary"
                                            >
                                                {INTERFACE_COPY.readArticle}
                                                <ArrowRight className="h-4 w-4"/>
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <EmptySectionCard
                            title={INTERFACE_COPY.internalEmptyTitle}
                            description={INTERFACE_COPY.internalEmptyDescription}
                            actionHref={getLocalizedPagePath(locale, "blog/admin")}
                            actionLabel={INTERFACE_COPY.adminAccess}
                        />
                    )}
                </div>

                <div className="mt-12">
                    <SectionHeader title={INTERFACE_COPY.mediumTitle} badge={INTERFACE_COPY.mediumSourceLabel}/>
                    {mediumPosts.length > 0 ? (
                        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {mediumPosts.map((post) => (
                                <article key={post.guid} className="glass-panel lift-card flex h-full flex-col overflow-hidden">
                                    {post.thumbnailUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={post.thumbnailUrl}
                                            alt={post.title}
                                            className="h-52 w-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="h-52 bg-[radial-gradient(circle_at_top_left,rgba(13,92,99,0.18),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(234,223,206,0.7))] dark:bg-[radial-gradient(circle_at_top_left,rgba(88,183,179,0.18),transparent_45%),linear-gradient(180deg,rgba(24,28,31,0.92),rgba(14,17,19,0.94))]"/>
                                    )}

                                    <div className="flex flex-1 flex-col p-6">
                                        <div className="flex flex-wrap gap-2">
                                            {post.categories.slice(0, 3).map((category) => (
                                                <span key={category} className="feature-chip !px-3 !py-1 text-xs">
                                                    {category}
                                                </span>
                                            ))}
                                        </div>

                                        <h3 className="mt-4 text-xl font-semibold leading-8 text-foreground">
                                            {post.title}
                                        </h3>

                                        <p className="mt-3 text-sm leading-7 text-foreground/70">
                                            {post.excerpt}
                                        </p>

                                        <div className="mt-auto pt-6">
                                            <div className="text-sm text-foreground/55">
                                                {formatPublishedDate(post.publishedAt, formattedLocale)}
                                            </div>
                                            <a
                                                href={post.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition hover:text-primary"
                                            >
                                                {INTERFACE_COPY.readOnMedium}
                                                <ExternalLink className="h-4 w-4"/>
                                            </a>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <EmptySectionCard
                            title={INTERFACE_COPY.mediumEmptyTitle}
                            description={INTERFACE_COPY.mediumEmptyDescription}
                            actionHref={MEDIUM_URL}
                            actionLabel={blogCopy.visitMedium}
                            external
                        />
                    )}
                </div>
            </section>

            <Footer copy={copy.footer} locale={locale}/>
        </main>
    );
}

function SectionHeader({title, badge}: { title: string; badge: string }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-semibold text-foreground sm:text-2xl">{title}</h3>
            <span className="feature-chip !px-3 !py-1 text-xs">{badge}</span>
        </div>
    );
}

function EmptySectionCard({
    title,
    description,
    actionHref,
    actionLabel,
    external = false,
}: {
    title: string;
    description: string;
    actionHref: string;
    actionLabel: string;
    external?: boolean;
}) {
    return (
        <div className="glass-panel mt-5 grid gap-6 p-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
                <h3 className="text-2xl font-semibold text-foreground">{title}</h3>
                <p className="mt-4 max-w-2xl text-base leading-8 text-foreground/72">
                    {description}
                </p>
            </div>
            <div className="rounded-[1.75rem] border border-black/10 bg-white/68 p-6 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/52">
                    {external ? "Medium" : "Internal publisher"}
                </p>
                <p className="mt-3 text-sm leading-7 text-foreground/68">
                    {external
                        ? "This section stays ready for Medium distribution whenever new feed items are available."
                        : "The company admin page lets your team publish articles directly into the site blog with a cookie-based sign-in."}
                </p>
                {external ? (
                    <a href={actionHref} target="_blank" rel="noreferrer" className="button-secondary mt-5">
                        {actionLabel}
                        <ExternalLink className="h-4 w-4"/>
                    </a>
                ) : (
                    <Link href={actionHref} className="button-secondary mt-5">
                        {actionLabel}
                        <ArrowRight className="h-4 w-4"/>
                    </Link>
                )}
            </div>
        </div>
    );
}

function formatPublishedDate(value: string, locale: string) {
    return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}
