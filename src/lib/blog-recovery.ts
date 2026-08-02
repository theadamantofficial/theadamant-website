import type {InternalBlogPost} from "@/lib/internal-blog";
import {normalizeStoredBlogPost} from "@/lib/blog-post-record";

export interface BlogRecoveryReport {
    currentCount: number;
    recoveredCount: number;
    finalCount: number;
    insertedCount: number;
    updatedCount: number;
    renamedCurrentSlugs: Array<{ id: string; from: string; to: string }>;
}

export function reconcileRecoveredBlogPosts(
    currentPosts: InternalBlogPost[],
    recoveredPosts: InternalBlogPost[],
) {
    const normalizedCurrent = currentPosts
        .map(normalizeStoredBlogPost)
        .filter((post): post is InternalBlogPost => Boolean(post));
    const normalizedRecovered = recoveredPosts
        .map(normalizeStoredBlogPost)
        .filter((post): post is InternalBlogPost => Boolean(post));
    const currentById = new Map(normalizedCurrent.map((post) => [post.id, post]));
    const recoveredById = new Map(normalizedRecovered.map((post) => [post.id, post]));
    const mergedById = new Map<string, InternalBlogPost>();
    let insertedCount = 0;
    let updatedCount = 0;

    for (const recovered of recoveredById.values()) {
        const current = currentById.get(recovered.id);

        if (!current) {
            mergedById.set(recovered.id, {...recovered, coverImage: null});
            insertedCount += 1;
            continue;
        }

        const winner = timestamp(current.updatedAt) >= timestamp(recovered.updatedAt) ? current : recovered;
        mergedById.set(recovered.id, {...winner, coverImage: current.coverImage});

        if (winner.updatedAt !== current.updatedAt) {
            updatedCount += 1;
        }
    }

    for (const current of currentById.values()) {
        if (!mergedById.has(current.id)) {
            mergedById.set(current.id, current);
        }
    }

    const historicalSlugOwners = new Map<string, string>();
    for (const recovered of recoveredById.values()) {
        if (!historicalSlugOwners.has(recovered.slug)) {
            historicalSlugOwners.set(recovered.slug, recovered.id);
        }
    }

    const usedSlugs = new Set<string>();
    const renamedCurrentSlugs: BlogRecoveryReport["renamedCurrentSlugs"] = [];
    const prioritized = Array.from(mergedById.values()).sort((left, right) => {
        const leftHistorical = historicalSlugOwners.get(left.slug) === left.id ? 1 : 0;
        const rightHistorical = historicalSlugOwners.get(right.slug) === right.id ? 1 : 0;
        return rightHistorical - leftHistorical || timestamp(left.publishedAt) - timestamp(right.publishedAt);
    });

    const reconciled = prioritized.map((post) => {
        const historicalOwner = historicalSlugOwners.get(post.slug);

        if (!usedSlugs.has(post.slug) && (!historicalOwner || historicalOwner === post.id)) {
            usedSlugs.add(post.slug);
            return post;
        }

        const nextSlug = createAvailableSlug(post.slug, usedSlugs);
        usedSlugs.add(nextSlug);

        if (!recoveredById.has(post.id)) {
            renamedCurrentSlugs.push({id: post.id, from: post.slug, to: nextSlug});
        }

        return {...post, slug: nextSlug};
    }).sort((left, right) => timestamp(right.publishedAt) - timestamp(left.publishedAt));

    return {
        posts: reconciled,
        report: {
            currentCount: normalizedCurrent.length,
            recoveredCount: normalizedRecovered.length,
            finalCount: reconciled.length,
            insertedCount,
            updatedCount,
            renamedCurrentSlugs,
        } satisfies BlogRecoveryReport,
    };
}

function createAvailableSlug(slug: string, usedSlugs: Set<string>) {
    const baseSlug = slug.replace(/-\d+$/g, "") || "article";
    let suffix = 2;
    let candidate = `${baseSlug}-${suffix}`;

    while (usedSlugs.has(candidate)) {
        suffix += 1;
        candidate = `${baseSlug}-${suffix}`;
    }

    return candidate;
}

function timestamp(value: string) {
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
}
