"use client";

import Image from "next/image";
import Link from "next/link";
import {motion} from "motion/react";
import {Reveal} from "@/components/ui/reveal";
import {SiteCopy} from "@/lib/site-copy";
import {useMotionCapability} from "@/hooks/use-motion-capability";

type ProofStripCopy = NonNullable<SiteCopy["services"]["proofStrip"]>;
type ProofItem = SiteCopy["services"]["items"][number];

type BeltTile =
    | {kind: "logo"; item: ProofItem}
    | {kind: "badge"; item: ProofItem; label: string}
    | {kind: "highlight"; item: ProofItem; label: string}
    | {kind: "summary"; item: ProofItem; label: string};

export default function PartnerProofStrip({
    copy,
    items,
}: {
    copy?: ProofStripCopy;
    items: ProofItem[];
}) {
    const {capability, isReady} = useMotionCapability();
    const hasRichMotion = isReady && capability === "full";

    if (!copy || items.length === 0) {
        return null;
    }

    const primaryItem = items[0];
    const shouldScroll = items.length > 1;
    const highlightTiles = items.flatMap((item) => {
        const highlights = item.proofHighlights ?? [];

        return [
            {kind: "logo" as const, item},
            {kind: "badge" as const, item, label: item.badge ?? "Selected work"},
            ...highlights.map((label) => ({kind: "highlight" as const, item, label})),
        ];
    });
    const summaryTiles = items.flatMap((item) => [
        {kind: "summary" as const, item, label: item.description},
        ...(item.proofHighlights ?? []).map((label) => ({kind: "highlight" as const, item, label})),
    ]);

    return (
        <section
            className={`section-shell py-6 sm:py-10 ${hasRichMotion ? "" : "motion-effects-paused"}`}
            aria-labelledby="partner-proof-heading"
        >
            <Reveal className="relative overflow-hidden rounded-[2.25rem] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(242,234,223,0.74))] p-6 shadow-[0_40px_100px_-60px_rgba(15,23,42,0.55)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(18,21,23,0.96),rgba(12,16,18,0.9))] sm:p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(13,92,99,0.14),transparent_34%),radial-gradient(circle_at_86%_14%,rgba(214,106,69,0.12),transparent_28%)]"/>
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent"/>
                <div className="relative space-y-8">
                    <div className="max-w-4xl">
                        <p className="section-kicker">{copy.kicker}</p>
                        <h2 id="partner-proof-heading" className="section-title">
                            {copy.title}
                        </h2>
                        <p className="section-copy max-w-xl">
                            {copy.description}
                        </p>
                    </div>

                    {shouldScroll
                        ? (
                            <div className="space-y-4">
                                <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
                                    <div className="proof-marquee flex w-max gap-4 py-1">
                                        {[...highlightTiles, ...highlightTiles].map((tile, index) => (
                                            <BeltTileCard key={`proof-primary-${tile.item.title}-${tile.kind}-${index}`} tile={tile}/>
                                        ))}
                                    </div>
                                </div>

                                <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
                                    <div className="proof-marquee proof-marquee-reverse flex w-max gap-4 py-1">
                                        {[...summaryTiles, ...summaryTiles].map((tile, index) => (
                                            <BeltTileCard key={`proof-secondary-${tile.item.title}-${tile.kind}-${index}`} tile={tile}/>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                        : <StaticProofShowcase item={primaryItem} hasRichMotion={hasRichMotion}/>}
                </div>
            </Reveal>
        </section>
    );
}

function BeltTileCard({tile}: {tile: BeltTile}) {
    const websiteLabel = getWebsiteLabel(tile.item.href);

    if (tile.kind === "logo") {
        return (
            <div className="flex min-w-[18rem] items-center gap-4 rounded-[1.5rem] border border-black/10 bg-white/78 px-5 py-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.06]">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-black/8 bg-[#0d1114] p-2 shadow-inner dark:border-white/10">
                    <Image
                        src={tile.item.image}
                        alt={getProofImageAlt(tile.item)}
                        width={40}
                        height={40}
                        className="h-auto w-auto max-w-full object-contain"
                    />
                </div>
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <p className="text-lg font-semibold tracking-tight text-foreground">{tile.item.title}</p>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-foreground/45">
                            {tile.item.badge ?? "Selected work"}
                        </p>
                    </div>
                    {websiteLabel && (
                        <p className="mt-1 text-sm text-foreground/56">
                            {websiteLabel}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    if (tile.kind === "summary") {
        return (
            <div className="flex min-w-[21rem] max-w-[21rem] items-center rounded-[1.5rem] border border-black/10 bg-black/[0.04] px-5 py-4 text-sm leading-6 text-foreground/72 dark:border-white/10 dark:bg-white/[0.05]">
                {tile.label}
            </div>
        );
    }

    return (
        <div className={`flex min-w-fit items-center rounded-full border px-4 py-3 text-sm font-medium shadow-sm backdrop-blur-sm ${
            tile.kind === "badge"
                ? "border-transparent bg-foreground text-background"
                : "border-black/10 bg-white/78 text-foreground dark:border-white/10 dark:bg-white/[0.06]"
        }`}
        >
            {tile.label}
        </div>
    );
}

function StaticProofShowcase({
    item,
    hasRichMotion,
}: {
    item: ProofItem;
    hasRichMotion: boolean;
}) {
    const websiteLabel = getWebsiteLabel(item.href);
    const highlights = item.proofHighlights ?? [];
    const previewMetrics = [
        {label: "Content lanes", value: "12"},
        {label: "Audit checks", value: "38"},
        {label: "Workflow stage", value: "Active"},
    ];

    return (
        <article className="overflow-hidden rounded-[2rem] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(244,236,226,0.8))] shadow-[0_35px_90px_-60px_rgba(15,23,42,0.5)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(18,21,23,0.96),rgba(12,16,18,0.92))]">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 px-5 py-5 dark:border-white/10 sm:px-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] border border-black/8 bg-[#0d1114] p-3 shadow-inner dark:border-white/10">
                        <Image
                            src={item.image}
                            alt={getProofImageAlt(item)}
                            width={44}
                            height={44}
                            className="h-auto w-auto max-w-full object-contain"
                        />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                            <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                                {item.title}
                            </h3>
                            {item.badge && (
                                <span className="rounded-full border border-black/10 bg-black/[0.04] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-foreground/60 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/72">
                                    {item.badge}
                                </span>
                            )}
                        </div>
                        {websiteLabel && (
                            <Link
                                href={item.href ?? "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex text-sm font-medium text-foreground/58 underline decoration-black/20 underline-offset-4 transition hover:text-foreground dark:decoration-white/20"
                            >
                                {websiteLabel}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
                <div className="relative overflow-hidden rounded-[1.75rem] border border-black/10 bg-[linear-gradient(180deg,rgba(16,19,22,0.98),rgba(10,13,15,0.98))] p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:border-white/10 sm:p-5">
                    <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-5 top-[18%] z-10 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent shadow-[0_0_18px_rgba(88,183,179,0.45)]"
                        animate={hasRichMotion
                            ? {top: ["18%", "82%", "18%"], opacity: [0, 0.72, 0]}
                            : {opacity: 0}}
                        transition={hasRichMotion
                            ? {duration: 6.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2}
                            : undefined}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/42">
                                Dashboard preview
                            </p>
                            <p className="mt-1 text-lg font-semibold text-white">
                                Multilingual SEO workspace
                            </p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/72">
                            Live product system
                        </span>
                    </div>

                    <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.05] p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/42">
                                        Workflow board
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-white/76">
                                        {item.detail}
                                    </p>
                                </div>
                                <motion.div
                                    className="hidden h-10 w-10 shrink-0 rounded-full bg-[radial-gradient(circle,rgba(88,183,179,0.92),rgba(88,183,179,0.18))] lg:block"
                                    animate={hasRichMotion
                                        ? {scale: [1, 1.14, 1], opacity: [0.72, 1, 0.72]}
                                        : undefined}
                                    transition={hasRichMotion
                                        ? {duration: 2.8, repeat: Infinity, ease: "easeInOut"}
                                        : undefined}
                                />
                            </div>

                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                {highlights.map((highlight, index) => (
                                    <motion.div
                                        key={highlight}
                                        className="rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-3 text-sm text-white/80"
                                        initial={{opacity: 0, y: 12}}
                                        whileInView={{opacity: 1, y: 0}}
                                        viewport={{once: true, amount: 0.6}}
                                        whileHover={hasRichMotion ? {y: -3, backgroundColor: "rgba(255,255,255,0.08)"} : undefined}
                                        transition={{duration: 0.42, delay: index * 0.08, ease: [0.22, 1, 0.36, 1]}}
                                    >
                                        {highlight}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-3">
                            {previewMetrics.map((metric, index) => (
                                <motion.div
                                    key={metric.label}
                                    className="rounded-[1.2rem] border border-white/8 bg-white/[0.04] p-4"
                                    initial={{opacity: 0, x: 14}}
                                    whileInView={{opacity: 1, x: 0}}
                                    viewport={{once: true, amount: 0.6}}
                                    whileHover={hasRichMotion ? {x: -4, backgroundColor: "rgba(255,255,255,0.08)"} : undefined}
                                    transition={{duration: 0.42, delay: index * 0.09, ease: [0.22, 1, 0.36, 1]}}
                                >
                                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/42">
                                        {metric.label}
                                    </p>
                                    <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
                                        {metric.value}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="text-sm leading-7 text-foreground/68">
                    {item.description}
                </p>
            </div>
        </article>
    );
}

function getWebsiteLabel(href?: string) {
    if (!href) {
        return "";
    }

    try {
        return new URL(href).hostname.replace(/^www\./, "");
    } catch {
        return href;
    }
}

function getProofImageAlt(item: ProofItem) {
    return item.imageAlt ?? (item.href ? `${item.title} logo` : `${item.title} illustration`);
}
