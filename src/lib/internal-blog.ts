import {createHmac, randomUUID, timingSafeEqual} from "node:crypto";
import {mkdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {parseStoredBlogPosts} from "@/lib/blog-post-record";
import {BlogSlugConflictError, isBlogSlugConflictError} from "@/lib/blog-storage-error";
import {extractJsonObject, getGroqChatModel, requestGroqChatCompletion} from "@/lib/groq";
import {getSiteUrl} from "@/lib/site-url";
import {
    deleteSupabaseBlogPost,
    getSupabaseBlogPostBySlug,
    insertSupabaseBlogPost,
    isSupabaseBlogConfigured,
    listSupabaseBlogPosts,
    updateSupabaseBlogPost,
} from "@/lib/supabase-blog";
import {removeSupabaseBlogCoverByUrl} from "@/lib/supabase-blog-covers";

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
    coverImage?: string | null;
    tags?: string[] | string;
    authorName?: string;
}

export interface UpdateInternalBlogPostInput {
    id: string;
    title: string;
    excerpt?: string;
    content: string;
    coverImage?: string | null;
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

export type BlogStorageMode = "supabase" | "filesystem";

const BLOG_POSTS_FILE = path.join(process.cwd(), "src/content/internal-blog-posts.json");
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
    const requestedMode = process.env.BLOG_STORAGE_MODE?.trim().toLowerCase();

    if (requestedMode === "supabase") {
        return "supabase";
    }

    if (requestedMode === "filesystem") {
        return "filesystem";
    }

    const hasSupabaseEnvironment = Boolean(
        process.env.SUPABASE_URL?.trim()
        || process.env.SUPABASE_SECRET_KEY?.trim(),
    );

    return isSupabaseBlogConfigured() || hasSupabaseEnvironment ? "supabase" : "filesystem";
}

export function getBlogDeployWebhookUrl() {
    const rawUrl = process.env.BLOG_DEPLOY_WEBHOOK_URL?.trim();

    if (!rawUrl) {
        return "";
    }

    return rawUrl.replace(/^['"]|['"]$/g, "");
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
    if (getBlogStorageMode() === "supabase") {
        return getSupabaseBlogPostBySlug(slug);
    }

    const posts = await readLocalInternalBlogPosts();
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
    let slug = createUniqueSlug(resolvedDraft.title, posts);
    const excerpt = resolvedDraft.excerpt || buildExcerptFromContent(content);
    const id = randomUUID();

    for (let attempt = 0; attempt < 5; attempt += 1) {
        const post: InternalBlogPost = {
            id,
            slug,
            title: resolvedDraft.title,
            seoTitle: resolvedDraft.seoTitle || getEnhancedBlogSeoTitle(resolvedDraft.title, tags),
            excerpt,
            content: resolvedDraft.content,
            coverImage: normalizeCoverImage(input.coverImage),
            tags,
            authorName: input.authorName?.trim() || "The Adamant Team",
            createdAt: now,
            updatedAt: now,
            publishedAt: now,
        };

        try {
            return await insertInternalBlogPost(post);
        } catch (error) {
            if (!isBlogSlugConflictError(error)) {
                throw error;
            }

            posts.push(post);
            slug = createUniqueSlug(resolvedDraft.title, posts);
        }
    }

    throw new Error("Could not allocate a unique blog slug.");
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

    const nextPost: InternalBlogPost = {
        ...existingPost,
        title: resolvedDraft.title,
        seoTitle: resolvedDraft.seoTitle || getEnhancedBlogSeoTitle(resolvedDraft.title, tags),
        excerpt,
        content: resolvedDraft.content,
        coverImage: input.coverImage === undefined
            ? existingPost.coverImage
            : normalizeCoverImage(input.coverImage),
        tags,
        authorName: input.authorName?.trim() || existingPost.authorName,
        updatedAt: new Date().toISOString(),
    };

    const updatedPost = await replaceInternalBlogPost(nextPost);

    if (!updatedPost) {
        throw new Error("Blog post not found.");
    }

    if (existingPost.coverImage && existingPost.coverImage !== updatedPost.coverImage) {
        await removeManagedCoverWithoutFailingWrite(existingPost.coverImage);
    }

    return updatedPost;
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

    await removeInternalBlogPost(id, posts);
    await removeManagedCoverWithoutFailingWrite(deletedPost.coverImage);

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
    if (getBlogStorageMode() === "supabase") {
        return listSupabaseBlogPosts();
    }

    return readLocalInternalBlogPosts();
}

async function readLocalInternalBlogPosts() {
    await ensureInternalBlogStorage();

    const raw = await readFile(BLOG_POSTS_FILE, "utf8");
    return parseStoredBlogPosts(raw);
}

async function insertInternalBlogPost(post: InternalBlogPost) {
    if (getBlogStorageMode() === "supabase") {
        return insertSupabaseBlogPost(post);
    }

    const posts = await readLocalInternalBlogPosts();

    if (posts.some((candidate) => candidate.slug === post.slug)) {
        throw new BlogSlugConflictError(post.slug);
    }

    posts.unshift(post);
    await writeLocalInternalBlogPosts(posts);
    return post;
}

async function replaceInternalBlogPost(post: InternalBlogPost) {
    if (getBlogStorageMode() === "supabase") {
        return updateSupabaseBlogPost(post);
    }

    const posts = await readLocalInternalBlogPosts();
    const index = posts.findIndex((candidate) => candidate.id === post.id);

    if (index === -1) {
        return null;
    }

    posts.splice(index, 1, post);
    await writeLocalInternalBlogPosts(posts);
    return post;
}

async function removeInternalBlogPost(id: string, currentPosts?: InternalBlogPost[]) {
    if (getBlogStorageMode() === "supabase") {
        await deleteSupabaseBlogPost(id);
        return;
    }

    const posts = currentPosts || await readLocalInternalBlogPosts();
    await writeLocalInternalBlogPosts(posts.filter((post) => post.id !== id));
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

function normalizeCoverImage(value?: string | null) {
    return value?.trim() || null;
}

async function removeManagedCoverWithoutFailingWrite(coverImage?: string | null) {
    if (getBlogStorageMode() !== "supabase" || !coverImage) {
        return;
    }

    try {
        await removeSupabaseBlogCoverByUrl(coverImage);
    } catch (error) {
        console.error("Could not clean up the previous Supabase blog cover.", error);
    }
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
