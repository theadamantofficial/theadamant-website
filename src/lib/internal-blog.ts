import {createHmac, randomUUID, timingSafeEqual} from "node:crypto";
import {mkdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";

export interface InternalBlogPost {
    id: string;
    slug: string;
    title: string;
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

const BLOG_POSTS_FILE = path.join(process.cwd(), "src/content/internal-blog-posts.json");
const BLOG_ADMIN_EMAIL_FALLBACK = "team@theadamant.local";
const BLOG_ADMIN_PASSWORD_FALLBACK = "theadamant-admin";
const BLOG_ADMIN_SECRET_FALLBACK = "theadamant-blog-local-secret";
const BLOG_ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 14;

export const BLOG_ADMIN_COOKIE_NAME = "theadamant-blog-admin";

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
    const content = input.content.trim();

    if (!title || !content) {
        throw new Error("Title and content are required.");
    }

    const posts = await readInternalBlogPosts();
    const now = new Date().toISOString();
    const slug = createUniqueSlug(title, posts);
    const excerpt = input.excerpt?.trim() || buildExcerptFromContent(content);

    const post: InternalBlogPost = {
        id: randomUUID(),
        slug,
        title,
        excerpt,
        content,
        coverImage: normalizeCoverImage(input.coverImage),
        tags: normalizeTags(input.tags),
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
    const content = input.content.trim();

    if (!title || !content) {
        throw new Error("Title and content are required.");
    }

    const posts = await readInternalBlogPosts();
    const existingPostIndex = posts.findIndex((post) => post.id === input.id);

    if (existingPostIndex === -1) {
        throw new Error("Blog post not found.");
    }

    const existingPost = posts[existingPostIndex];
    const nextPost: InternalBlogPost = {
        ...existingPost,
        title,
        excerpt: input.excerpt?.trim() || buildExcerptFromContent(content),
        content,
        coverImage: normalizeCoverImage(input.coverImage),
        tags: normalizeTags(input.tags),
        authorName: input.authorName?.trim() || existingPost.authorName,
        updatedAt: new Date().toISOString(),
    };

    posts.splice(existingPostIndex, 1, nextPost);
    await writeInternalBlogPosts(posts);

    return nextPost;
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
    await ensureInternalBlogStorage();

    const raw = await readFile(BLOG_POSTS_FILE, "utf8");

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

    try {
        const parsed = new URL(trimmed);
        return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : null;
    } catch {
        return null;
    }
}
