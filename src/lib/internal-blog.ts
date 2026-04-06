import {createHmac, randomUUID, timingSafeEqual} from "node:crypto";
import {mkdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {get, put} from "@vercel/blob";
import type {BlobAccessType, GetBlobResult, PutBlobResult} from "@vercel/blob";
import {generateAiBlogCoverSvg} from "@/lib/ai-blog-cover";
import {extractJsonObject, getGroqChatModel, requestGroqChatCompletion} from "@/lib/groq";
import {getSiteUrl} from "@/lib/site-url";

export interface InternalBlogPost {
    id: string;
    slug: string;
    title: string;
    seoTitle?: string;
    excerpt: string;
    content: string;
    coverImage: string | null;
    tags: string[];
    authorName: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
}

export interface CreateInternalBlogPostInput {
    title: string;
    excerpt?: string;
    content: string;
    coverImage?: string;
    tags?: string[] | string;
    authorName?: string;
}

export interface UpdateInternalBlogPostInput {
    id: string;
    title: string;
    excerpt?: string;
    content: string;
    coverImage?: string;
    tags?: string[] | string;
    authorName?: string;
}

export interface DeleteInternalBlogPostInput {
    id: string;
}

export type ManualBlogChangeAction = "published" | "updated" | "deleted";

interface BlogAdminCredentials {
    emails: string[];
    password: string;
    configured: boolean;
    usesDefaults: boolean;
}

interface BlogAdminSession {
    authenticated: boolean;
    email: string | null;
}

export type BlogStorageMode = "blob" | "filesystem";
export interface GenerateMissingBlogCoversResult {
    updatedCount: number;
    failedCount: number;
    updatedSlugs: string[];
}

const BLOG_POSTS_FILE = path.join(process.cwd(), "src/content/internal-blog-posts.json");
const BLOG_POSTS_BLOB_PATH = "blog/internal-blog-posts.json";
const BLOG_COVER_UPLOAD_DIRECTORY = path.join(process.cwd(), "public/uploads/blog-covers");
const BLOG_ADMIN_EMAIL_FALLBACK = "team@theadamant.local";
const BLOG_ADMIN_PASSWORD_FALLBACK = "theadamant-admin";
const BLOG_ADMIN_SECRET_FALLBACK = "theadamant-blog-local-secret";
const BLOG_ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 14;
const DEFAULT_BLOG_SEO_FOCUS = "Website Design, UX & SEO";

export const BLOG_ADMIN_COOKIE_NAME = "theadamant-blog-admin";

export function getEnhancedBlogSeoTitle(title: string, tags: string[] = []) {
    const safeTitle = title.trim().replace(/\s+/g, " ");
    const focus = (tags[0]?.trim() || DEFAULT_BLOG_SEO_FOCUS).replace(/\s+/g, " ");

    const preferredTitle = safeTitle.length > 54 ? `${safeTitle.slice(0, 51).trim()}...` : safeTitle;

    return `${preferredTitle} | ${focus} | The Adamant`;
}

export function getBlogAdminCredentials(): BlogAdminCredentials {
    const envEmails = parseBlogAdminEmails(process.env.BLOG_ADMIN_EMAILS || process.env.BLOG_ADMIN_EMAIL);
    const envPassword = process.env.BLOG_ADMIN_PASSWORD?.trim();

    if (envEmails.length > 0 && envPassword) {
        return {
            emails: envEmails,
            password: envPassword,
            configured: true,
            usesDefaults: false,
        };
    }

    if (process.env.NODE_ENV !== "production") {
        return {
            emails: [BLOG_ADMIN_EMAIL_FALLBACK],
            password: BLOG_ADMIN_PASSWORD_FALLBACK,
            configured: true,
            usesDefaults: true,
        };
    }

    return {
        emails: [],
        password: "",
        configured: false,
        usesDefaults: false,
    };
}

export function getBlogAdminSessionCookieOptions() {
    return {
        httpOnly: true,
        maxAge: BLOG_ADMIN_SESSION_MAX_AGE,
        path: "/",
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
    };
}

export function getBlogStorageMode(): BlogStorageMode {
    return getBlobReadWriteToken() ? "blob" : "filesystem";
}

export function isBlobStorageConfigured() {
    return Boolean(getBlobReadWriteToken());
}

export function getBlobReadWriteToken() {
    const rawToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();

    if (!rawToken) {
        return "";
    }

    return rawToken.replace(/^['"]|['"]$/g, "");
}

export function getBlogDeployWebhookUrl() {
    const rawUrl = process.env.BLOG_DEPLOY_WEBHOOK_URL?.trim();

    if (!rawUrl) {
        return "";
    }

    return rawUrl.replace(/^['"]|['"]$/g, "");
}

export function buildBlogMediaProxyPath(blobPathname: string) {
    return `/api/blog-media/${blobPathname
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/")}`;
}

export function createBlogAdminSessionToken(email: string) {
    const expiresAt = Date.now() + BLOG_ADMIN_SESSION_MAX_AGE * 1000;
    const payload = JSON.stringify({
        email: email.trim().toLowerCase(),
        expiresAt,
    });
    const signature = signSessionPayload(payload);

    return Buffer.from(JSON.stringify({payload, signature}), "utf8").toString("base64url");
}

export function verifyBlogAdminSessionToken(token?: string | null) {
    return getBlogAdminSessionFromToken(token).authenticated;
}

export function getBlogAdminSessionFromToken(token?: string | null): BlogAdminSession {
    if (!token) {
        return {authenticated: false, email: null};
    }

    try {
        const decoded = Buffer.from(token, "base64url").toString("utf8");
        const parsed = JSON.parse(decoded) as { payload?: string; signature?: string };

        if (!parsed.payload || !parsed.signature) {
            return {authenticated: false, email: null};
        }

        const expectedSignature = signSessionPayload(parsed.payload);
        if (!safeEqual(parsed.signature, expectedSignature)) {
            return {authenticated: false, email: null};
        }

        const payload = JSON.parse(parsed.payload) as { email?: string; expiresAt?: number };
        const credentials = getBlogAdminCredentials();

        if (!payload.email || !payload.expiresAt || !credentials.configured) {
            return {authenticated: false, email: null};
        }

        if (Date.now() > payload.expiresAt) {
            return {authenticated: false, email: null};
        }

        if (!credentials.emails.includes(payload.email)) {
            return {authenticated: false, email: null};
        }

        return {
            authenticated: true,
            email: payload.email,
        };
    } catch {
        return {authenticated: false, email: null};
    }
}

export function isAllowedBlogAdminEmail(email: string, credentials = getBlogAdminCredentials()) {
    return credentials.emails.includes(email.trim().toLowerCase());
}

export async function listInternalBlogPosts() {
    const posts = await readInternalBlogPosts();
    return posts.sort((left, right) => (
        new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
    ));
}

export async function getInternalBlogPostBySlug(slug: string) {
    const posts = await readInternalBlogPosts();
    return posts.find((post) => post.slug === slug) ?? null;
}

export async function createInternalBlogPost(input: CreateInternalBlogPostInput) {
    const title = input.title.trim();
    const content = normalizeArticleContentForStorage(input.content).trim();

    if (!title || !content) {
        throw new Error("Title and content are required.");
    }

    const posts = await readInternalBlogPosts();
    const tags = normalizeTags(input.tags);
    const resolvedDraft = await resolveUniqueBlogDraft({
        title,
        excerpt: input.excerpt?.trim(),
        content,
        tags,
        posts,
    });
    const now = new Date().toISOString();
    const slug = createUniqueSlug(resolvedDraft.title, posts);
    const excerpt = resolvedDraft.excerpt || buildExcerptFromContent(content);
    const coverImage = await resolveBlogCoverImage(input.coverImage, {
        title: resolvedDraft.title,
        excerpt,
        tags,
        slug,
    });

    const post: InternalBlogPost = {
        id: randomUUID(),
        slug,
        title: resolvedDraft.title,
        seoTitle: resolvedDraft.seoTitle || getEnhancedBlogSeoTitle(resolvedDraft.title, tags),
        excerpt,
        content: resolvedDraft.content,
        coverImage,
        tags,
        authorName: input.authorName?.trim() || "The Adamant Team",
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
    };

    posts.unshift(post);
    await writeInternalBlogPosts(posts);

    return post;
}

export async function updateInternalBlogPost(input: UpdateInternalBlogPostInput) {
    const title = input.title.trim();
    const content = normalizeArticleContentForStorage(input.content).trim();

    if (!title || !content) {
        throw new Error("Title and content are required.");
    }

    const posts = await readInternalBlogPosts();
    const existingPostIndex = posts.findIndex((post) => post.id === input.id);

    if (existingPostIndex === -1) {
        throw new Error("Blog post not found.");
    }

    const existingPost = posts[existingPostIndex];
    const tags = normalizeTags(input.tags);
    const resolvedDraft = await resolveUniqueBlogDraft({
        title,
        excerpt: input.excerpt?.trim(),
        content,
        tags,
        posts,
        ignorePostId: existingPost.id,
    });
    const excerpt = resolvedDraft.excerpt || buildExcerptFromContent(content);

    const coverImage = await resolveBlogCoverImage(input.coverImage, {
        title: resolvedDraft.title,
        excerpt,
        tags,
        slug: existingPost.slug,
    });
    const nextPost: InternalBlogPost = {
        ...existingPost,
        title: resolvedDraft.title,
        seoTitle: resolvedDraft.seoTitle || getEnhancedBlogSeoTitle(resolvedDraft.title, tags),
        excerpt,
        content: resolvedDraft.content,
        coverImage,
        tags,
        authorName: input.authorName?.trim() || existingPost.authorName,
        updatedAt: new Date().toISOString(),
    };

    posts.splice(existingPostIndex, 1, nextPost);
    await writeInternalBlogPosts(posts);

    return nextPost;
}

export async function deleteInternalBlogPost(input: DeleteInternalBlogPostInput) {
    const id = input.id.trim();

    if (!id) {
        throw new Error("Blog post id is required.");
    }

    const posts = await readInternalBlogPosts();
    const deletedPost = posts.find((post) => post.id === id);

    if (!deletedPost) {
        throw new Error("Blog post not found.");
    }

    const nextPosts = posts.filter((post) => post.id !== id);
    await writeInternalBlogPosts(nextPosts);

    return deletedPost;
}

export async function notifyManualBlogChange(
    action: ManualBlogChangeAction,
    post: Pick<InternalBlogPost, "title" | "slug" | "authorName" | "publishedAt" | "updatedAt">,
) {
    const webhookUrl = getBlogDeployWebhookUrl();

    if (!webhookUrl) {
        return;
    }

    const postUrl = `${getSiteUrl()}/blog/${post.slug}`;
    const labels: Record<ManualBlogChangeAction, string> = {
        published: "Manual blog published on website",
        updated: "Manual blog updated on website",
        deleted: "Manual blog deleted on website",
    };
    const actionTimestamp = action === "published" ? post.publishedAt : post.updatedAt;

    try {
        await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: [
                    `**${labels[action]}**`,
                    `Action: ${action}`,
                    `Title: ${post.title}`,
                    `Author: ${post.authorName}`,
                    `When: ${actionTimestamp}`,
                    `URL: ${postUrl}`,
                ].join("\n"),
            }),
        });
    } catch (error) {
        console.error("Failed to notify blog deploy webhook.", error);
    }
}

export async function generateAiCoversForPostsMissingImages(): Promise<GenerateMissingBlogCoversResult> {
    const posts = await readInternalBlogPosts();
    let updatedCount = 0;
    let failedCount = 0;
    const updatedSlugs: string[] = [];

    const nextPosts = await Promise.all(posts.map(async (post) => {
        if (post.coverImage) {
            return post;
        }

        const coverImage = await generateAndStoreBlogCover({
            title: post.title,
            excerpt: post.excerpt,
            tags: post.tags,
            slug: post.slug,
        });

        if (!coverImage) {
            failedCount += 1;
            return post;
        }

        updatedCount += 1;
        updatedSlugs.push(post.slug);

        return {
            ...post,
            coverImage,
            updatedAt: new Date().toISOString(),
        };
    }));

    if (updatedCount > 0) {
        await writeInternalBlogPosts(nextPosts);
    }

    return {
        updatedCount,
        failedCount,
        updatedSlugs,
    };
}

function signSessionPayload(payload: string) {
    const secret = process.env.BLOG_ADMIN_SESSION_SECRET || BLOG_ADMIN_SECRET_FALLBACK;
    return createHmac("sha256", secret).update(payload).digest("hex");
}

function parseBlogAdminEmails(value?: string) {
    if (!value) {
        return [] as string[];
    }

    return value
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
}

function safeEqual(left: string, right: string) {
    const leftBuffer = Buffer.from(left, "utf8");
    const rightBuffer = Buffer.from(right, "utf8");

    if (leftBuffer.length !== rightBuffer.length) {
        return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
}

async function readInternalBlogPosts() {
    if (isBlobStorageConfigured()) {
        const blobPosts = await readBlobInternalBlogPosts();

        if (blobPosts !== null) {
            return blobPosts;
        }
    }

    return readLocalInternalBlogPosts();
}

async function readBlobInternalBlogPosts() {
    try {
        const {result} = await executeBlobOperation((access) => (
            get(BLOG_POSTS_BLOB_PATH, {
                access,
                token: getBlobReadWriteToken(),
            })
        ));

        if (!result || result.statusCode !== 200 || !result.stream) {
            return null as InternalBlogPost[] | null;
        }

        const raw = await new Response(result.stream).text();
        return parseInternalBlogPosts(raw);
    } catch {
        return null as InternalBlogPost[] | null;
    }
}

async function readLocalInternalBlogPosts() {
    await ensureInternalBlogStorage();

    const raw = await readFile(BLOG_POSTS_FILE, "utf8");
    return parseInternalBlogPosts(raw);
}

function parseInternalBlogPosts(raw: string) {
    try {
        const parsed = JSON.parse(raw) as unknown;

        if (!Array.isArray(parsed)) {
            return [] as InternalBlogPost[];
        }

        return parsed
            .map(normalizeStoredPost)
            .filter((post): post is InternalBlogPost => Boolean(post));
    } catch {
        return [] as InternalBlogPost[];
    }
}

async function writeInternalBlogPosts(posts: InternalBlogPost[]) {
    if (isBlobStorageConfigured()) {
        await writeBlobInternalBlogPosts(posts);
        return;
    }

    await writeLocalInternalBlogPosts(posts);
}

async function writeBlobInternalBlogPosts(posts: InternalBlogPost[]) {
    await executeBlobOperation((access) => (
        put(BLOG_POSTS_BLOB_PATH, `${JSON.stringify(posts, null, 2)}\n`, {
            access,
            addRandomSuffix: false,
            allowOverwrite: true,
            cacheControlMaxAge: 60,
            contentType: "application/json; charset=utf-8",
            token: getBlobReadWriteToken(),
        })
    ));
}

async function writeLocalInternalBlogPosts(posts: InternalBlogPost[]) {
    await ensureInternalBlogStorage();
    await writeFile(BLOG_POSTS_FILE, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
}

async function ensureInternalBlogStorage() {
    await mkdir(path.dirname(BLOG_POSTS_FILE), {recursive: true});

    try {
        await readFile(BLOG_POSTS_FILE, "utf8");
    } catch {
        await writeFile(BLOG_POSTS_FILE, "[]\n", "utf8");
    }
}

function normalizeStoredPost(value: unknown): InternalBlogPost | null {
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
        coverImage: typeof candidate.coverImage === "string" ? candidate.coverImage : null,
        tags: candidate.tags.filter((tag): tag is string => typeof tag === "string" && Boolean(tag.trim())),
        authorName: candidate.authorName,
        createdAt: candidate.createdAt,
        updatedAt: candidate.updatedAt,
        publishedAt: candidate.publishedAt,
    };
}

function createUniqueSlug(title: string, posts: InternalBlogPost[]) {
    const baseSlug = slugify(title);
    const slugs = new Set(posts.map((post) => post.slug));

    if (!slugs.has(baseSlug)) {
        return baseSlug;
    }

    let index = 2;
    let nextSlug = `${baseSlug}-${index}`;

    while (slugs.has(nextSlug)) {
        index += 1;
        nextSlug = `${baseSlug}-${index}`;
    }

    return nextSlug;
}

function slugify(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "article";
}

function buildExcerptFromContent(content: string) {
    const flattened = content
        .replace(/^#+\s+/gm, "")
        .replace(/^[-*]\s+/gm, "")
        .replace(/\s+/g, " ")
        .trim();

    if (flattened.length <= 180) {
        return flattened;
    }

    return `${flattened.slice(0, 177).trim()}...`;
}

function normalizeArticleContentForStorage(content: string) {
    const normalized = content
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

    return normalized
        .replace(/<\s*\/?\s*[^>]+>/gi, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function normalizeTitleForUniqueness(value: string) {
    return value
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9\s]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function titleCollides(value: string, posts: InternalBlogPost[], ignorePostId?: string) {
    const normalized = normalizeTitleForUniqueness(value);

    return posts.some((post) => (
        post.id !== (ignorePostId || "")
        && normalizeTitleForUniqueness(post.title) === normalized
    ));
}

function buildDuplicateCount(value: string, posts: InternalBlogPost[], ignorePostId?: string) {
    const normalized = normalizeTitleForUniqueness(value);

    return posts.filter((post) => (
        post.id !== (ignorePostId || "")
        && normalizeTitleForUniqueness(post.title) === normalized
    )).length;
}

async function resolveUniqueBlogDraft({
    title,
    excerpt,
    content,
    tags,
    posts,
    ignorePostId,
}: {
    title: string;
    excerpt?: string;
    content: string;
    tags: string[];
    posts: InternalBlogPost[];
    ignorePostId?: string;
}) {
    const candidateTitle = title.trim();
    const candidateExcerpt = excerpt?.trim() || "";

    if (!titleCollides(candidateTitle, posts, ignorePostId)) {
        return {
            title: candidateTitle,
            excerpt: candidateExcerpt,
            content,
            seoTitle: getEnhancedBlogSeoTitle(candidateTitle, tags),
        };
    }

    const rewritten = await rewriteDuplicateBlogDraft({
        title: candidateTitle,
        excerpt: candidateExcerpt,
        tags,
        posts,
        ignorePostId,
        content,
    });

    if (rewritten && !titleCollides(rewritten.title, posts, ignorePostId)) {
        return rewritten;
    }

    const duplicateCount = buildDuplicateCount(candidateTitle, posts, ignorePostId) + 1;
    const fallbackTitle = `${candidateTitle} (Edition ${duplicateCount})`;

    return {
        title: fallbackTitle,
        excerpt: candidateExcerpt,
        content,
        seoTitle: getEnhancedBlogSeoTitle(fallbackTitle, tags),
    };
}

async function rewriteDuplicateBlogDraft({
    title,
    excerpt,
    tags,
    posts,
    ignorePostId,
    content,
}: {
    title: string;
    excerpt: string;
    tags: string[];
    posts: InternalBlogPost[];
    ignorePostId?: string;
    content: string;
}) {
    const existingTitles = posts
        .filter((post) => post.id !== (ignorePostId || ""))
        .map((post) => post.title);

    try {
        const response = await requestGroqChatCompletion({
            model: getGroqChatModel(),
            temperature: 0.65,
            maxTokens: 260,
            messages: [
                {
                    role: "system",
                    content: [
                        "You are a senior SEO copy editor for a digital product website.",
                        "The provided title already exists in the blog library.",
                        "Return JSON only.",
                        `Use this exact schema: ${JSON.stringify({
                            title: "unique and SEO-ready title",
                            excerpt: "new excerpt with same meaning (under 180 chars)",
                            seoTitle: "maximally keyword-rich SEO title",
                        })}`,
                        "Rules:",
                        "- Do not duplicate existing titles.",
                        "- Keep the article intent and subject the same.",
                        "- Make title unique with a new angle or phrasing.",
                        "- Keep output concise and practical.",
                    ].join(" "),
                },
                {
                    role: "user",
                    content: JSON.stringify({
                        requestedTitle: title,
                        currentExcerpt: excerpt || "No excerpt provided.",
                        tags,
                        existingTitles,
                    }),
                },
            ],
        });

        const parsed = extractJsonObject<{
            title?: string;
            excerpt?: string;
            seoTitle?: string;
        }>(response);

        if (!parsed?.title) {
            return null;
        }

        const resolvedTitle = parsed.title.trim();
        if (!resolvedTitle || titleCollides(resolvedTitle, posts, ignorePostId)) {
            return null;
        }

        const resolvedExcerpt = parsed.excerpt?.trim() || excerpt;

        return {
            title: resolvedTitle,
            excerpt: resolvedExcerpt,
            content,
            seoTitle: parsed.seoTitle?.trim(),
        };
    } catch {
        return null;
    }
}

function normalizeTags(tags: CreateInternalBlogPostInput["tags"]) {
    const values = Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",") : [];

    return values
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 6);
}

function normalizeCoverImage(value?: string) {
    if (!value) {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    if (trimmed.startsWith("/")) {
        return trimmed;
    }

    try {
        const parsed = new URL(trimmed);
        return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : null;
    } catch {
        return null;
    }
}

async function resolveBlogCoverImage(
    value: string | undefined,
    post: Pick<InternalBlogPost, "title" | "excerpt" | "tags" | "slug">,
) {
    const normalized = normalizeCoverImage(value);

    if (normalized) {
        return normalized;
    }

    return await generateAndStoreBlogCover(post);
}

async function generateAndStoreBlogCover(post: Pick<InternalBlogPost, "title" | "excerpt" | "tags" | "slug">) {
    try {
        const svg = await generateAiBlogCoverSvg(post);
        const fileName = `ai-${post.slug}.svg`;

        if (isBlobStorageConfigured()) {
            const {result: blob, access} = await executeBlobOperation((blobAccess) => (
                put(`blog/covers/${fileName}`, svg, {
                    access: blobAccess,
                    addRandomSuffix: false,
                    allowOverwrite: true,
                    cacheControlMaxAge: 60 * 60 * 24 * 365,
                    contentType: "image/svg+xml; charset=utf-8",
                    token: getBlobReadWriteToken(),
                })
            ));

            return access === "private" ? buildBlogMediaProxyPath(blob.pathname) : blob.url;
        }

        await mkdir(BLOG_COVER_UPLOAD_DIRECTORY, {recursive: true});
        await writeFile(path.join(BLOG_COVER_UPLOAD_DIRECTORY, fileName), svg, "utf8");
        return `/uploads/blog-covers/${fileName}`;
    } catch (error) {
        console.error(`Failed to generate AI blog cover for "${post.title}".`, error);
        return null;
    }
}

export async function uploadBlogCoverToBlob(file: File, pathname: string) {
    return executeBlobOperation((access) => (
        put(pathname, file, {
            access,
            addRandomSuffix: false,
            allowOverwrite: true,
            cacheControlMaxAge: 60 * 60 * 24 * 365,
            contentType: file.type,
            token: getBlobReadWriteToken(),
        })
    ));
}

export async function getBlogBlob(pathname: string) {
    return executeBlobOperation((access) => (
        get(pathname, {
            access,
            token: getBlobReadWriteToken(),
        })
    ));
}

async function executeBlobOperation<T extends GetBlobResult | PutBlobResult | null>(
    operation: (access: BlobAccessType) => Promise<T>,
) {
    const preferredAccess = getPreferredBlobAccess();

    try {
        return {
            access: preferredAccess,
            result: await operation(preferredAccess),
        };
    } catch (error) {
        if (preferredAccess === "public" && isPrivateStoreAccessError(error)) {
            return {
                access: "private" as const,
                result: await operation("private"),
            };
        }

        throw error;
    }
}

function getPreferredBlobAccess(): BlobAccessType {
    const configuredAccess = process.env.BLOB_STORE_ACCESS?.trim().toLowerCase();
    return configuredAccess === "private" ? "private" : "public";
}

function isPrivateStoreAccessError(error: unknown) {
    return error instanceof Error && /private store/i.test(error.message);
}
