import {createClient, type SupabaseClient} from "@supabase/supabase-js";
import type {InternalBlogPost} from "@/lib/internal-blog";
import {
    blogPostRowToInternalBlogPost,
    internalBlogPostToRow,
    type BlogPostRow,
} from "@/lib/blog-post-record";
import {BlogSlugConflictError, BlogStorageUnavailableError} from "@/lib/blog-storage-error";

const BLOG_POST_COLUMNS = [
    "id",
    "slug",
    "title",
    "seo_title",
    "excerpt",
    "content",
    "cover_image",
    "tags",
    "author_name",
    "created_at",
    "updated_at",
    "published_at",
].join(",");

let cachedClient: SupabaseClient | null = null;
let cachedCredentials = "";

export function isSupabaseBlogConfigured() {
    return Boolean(getSupabaseUrl() && getSupabaseSecretKey());
}

export async function listSupabaseBlogPosts() {
    const {data, error} = await getSupabaseClient()
        .from("blog_posts")
        .select(BLOG_POST_COLUMNS)
        .order("published_at", {ascending: false});

    if (error) {
        throwStorageError("list", error);
    }

    return ((data || []) as unknown as BlogPostRow[]).map(blogPostRowToInternalBlogPost);
}

export async function getSupabaseBlogPostBySlug(slug: string) {
    const {data, error} = await getSupabaseClient()
        .from("blog_posts")
        .select(BLOG_POST_COLUMNS)
        .eq("slug", slug)
        .maybeSingle();

    if (error) {
        throwStorageError("read", error);
    }

    return data ? blogPostRowToInternalBlogPost(data as unknown as BlogPostRow) : null;
}

export async function insertSupabaseBlogPost(post: InternalBlogPost) {
    const {data, error} = await getSupabaseClient()
        .from("blog_posts")
        .insert(internalBlogPostToRow(post))
        .select(BLOG_POST_COLUMNS)
        .single();

    if (error) {
        if (error.code === "23505" && /slug/i.test(`${error.message} ${error.details || ""}`)) {
            throw new BlogSlugConflictError(post.slug, error);
        }

        throwStorageError("insert", error);
    }

    return blogPostRowToInternalBlogPost(data as unknown as BlogPostRow);
}

export async function updateSupabaseBlogPost(post: InternalBlogPost) {
    const {data, error} = await getSupabaseClient()
        .from("blog_posts")
        .update(internalBlogPostToRow(post))
        .eq("id", post.id)
        .select(BLOG_POST_COLUMNS)
        .maybeSingle();

    if (error) {
        if (error.code === "23505" && /slug/i.test(`${error.message} ${error.details || ""}`)) {
            throw new BlogSlugConflictError(post.slug, error);
        }

        throwStorageError("update", error);
    }

    return data ? blogPostRowToInternalBlogPost(data as unknown as BlogPostRow) : null;
}

export async function deleteSupabaseBlogPost(id: string) {
    const {error} = await getSupabaseClient()
        .from("blog_posts")
        .delete()
        .eq("id", id);

    if (error) {
        throwStorageError("delete", error);
    }
}

export async function upsertSupabaseBlogPosts(posts: InternalBlogPost[]) {
    if (posts.length === 0) {
        return [] as InternalBlogPost[];
    }

    const {data, error} = await getSupabaseClient()
        .from("blog_posts")
        .upsert(posts.map(internalBlogPostToRow), {onConflict: "id"})
        .select(BLOG_POST_COLUMNS);

    if (error) {
        throwStorageError("recovery import", error);
    }

    return ((data || []) as unknown as BlogPostRow[]).map(blogPostRowToInternalBlogPost);
}

function getSupabaseClient() {
    const url = getSupabaseUrl();
    const secretKey = getSupabaseSecretKey();

    if (!url || !secretKey) {
        throw new BlogStorageUnavailableError(new Error(
            "Set SUPABASE_URL and SUPABASE_SECRET_KEY for Supabase blog storage.",
        ));
    }

    const credentials = `${url}:${secretKey}`;

    if (!cachedClient || cachedCredentials !== credentials) {
        cachedClient = createClient(url, secretKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
        cachedCredentials = credentials;
    }

    return cachedClient;
}

function getSupabaseUrl() {
    return normalizeEnvironmentValue(process.env.SUPABASE_URL);
}

function getSupabaseSecretKey() {
    return normalizeEnvironmentValue(process.env.SUPABASE_SECRET_KEY);
}

function normalizeEnvironmentValue(value?: string) {
    return value?.trim().replace(/^['"]|['"]$/g, "") || "";
}

function throwStorageError(operation: string, error: unknown): never {
    console.error(`Supabase blog ${operation} failed.`, error);
    throw new BlogStorageUnavailableError(error);
}
