import type {InternalBlogPost} from "@/lib/internal-blog";

export interface BlogPostRow {
    id: string;
    slug: string;
    title: string;
    seo_title: string | null;
    excerpt: string;
    content: string;
    cover_image: string | null;
    tags: string[];
    author_name: string;
    created_at: string;
    updated_at: string;
    published_at: string;
}

export function internalBlogPostToRow(post: InternalBlogPost): BlogPostRow {
    return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        seo_title: post.seoTitle?.trim() || null,
        excerpt: post.excerpt,
        content: post.content,
        cover_image: post.coverImage?.trim() || null,
        tags: post.tags,
        author_name: post.authorName,
        created_at: post.createdAt,
        updated_at: post.updatedAt,
        published_at: post.publishedAt,
    };
}

export function blogPostRowToInternalBlogPost(row: BlogPostRow): InternalBlogPost {
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        seoTitle: row.seo_title?.trim() || undefined,
        excerpt: row.excerpt,
        content: row.content,
        coverImage: row.cover_image?.trim() || null,
        tags: Array.isArray(row.tags) ? row.tags.filter((tag) => typeof tag === "string" && Boolean(tag.trim())) : [],
        authorName: row.author_name,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        publishedAt: row.published_at,
    };
}

export function normalizeStoredBlogPost(value: unknown): InternalBlogPost | null {
    if (!value || typeof value !== "object") {
        return null;
    }

    const candidate = value as Partial<InternalBlogPost>;

    if (
        typeof candidate.id !== "string"
        || typeof candidate.slug !== "string"
        || typeof candidate.title !== "string"
        || typeof candidate.excerpt !== "string"
        || typeof candidate.content !== "string"
        || typeof candidate.authorName !== "string"
        || typeof candidate.createdAt !== "string"
        || typeof candidate.updatedAt !== "string"
        || typeof candidate.publishedAt !== "string"
        || !Array.isArray(candidate.tags)
    ) {
        return null;
    }

    return {
        id: candidate.id,
        slug: candidate.slug,
        title: candidate.title,
        seoTitle: typeof candidate.seoTitle === "string" ? candidate.seoTitle.trim() : undefined,
        excerpt: candidate.excerpt,
        content: candidate.content,
        coverImage: typeof candidate.coverImage === "string" ? candidate.coverImage.trim() || null : null,
        tags: candidate.tags.filter((tag): tag is string => typeof tag === "string" && Boolean(tag.trim())),
        authorName: candidate.authorName,
        createdAt: candidate.createdAt,
        updatedAt: candidate.updatedAt,
        publishedAt: candidate.publishedAt,
    };
}

export function parseStoredBlogPosts(raw: string) {
    try {
        const parsed = JSON.parse(raw) as unknown;

        if (!Array.isArray(parsed)) {
            return [] as InternalBlogPost[];
        }

        return parsed
            .map(normalizeStoredBlogPost)
            .filter((post): post is InternalBlogPost => Boolean(post));
    } catch {
        return [] as InternalBlogPost[];
    }
}
