import {NextRequest, NextResponse} from "next/server";
import {revalidatePath} from "next/cache";
import {
    BLOG_ADMIN_COOKIE_NAME,
    createInternalBlogPost,
    deleteInternalBlogPost,
    listInternalBlogPosts,
    notifyManualBlogChange,
    updateInternalBlogPost,
    verifyBlogAdminSessionToken,
} from "@/lib/internal-blog";
import {isBlogStorageUnavailableError} from "@/lib/blog-storage-error";
import {SEO_SITE_LOCALES, getLocalizedPagePath} from "@/lib/site-locale";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({error: "Unauthorized."}, {status: 401});
    }

    try {
        const posts = await listInternalBlogPosts();
        return NextResponse.json({posts});
    } catch (error) {
        return blogErrorResponse(error, "Could not load blog posts.");
    }
}

export async function POST(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({error: "Unauthorized."}, {status: 401});
    }

    let payload: {
        title?: string;
        excerpt?: string;
        content?: string;
        coverImage?: string;
        tags?: string[] | string;
        authorName?: string;
    };

    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({error: "Invalid blog post payload."}, {status: 400});
    }

    try {
        const post = await createInternalBlogPost({
            title: payload.title || "",
            excerpt: payload.excerpt,
            content: payload.content || "",
            coverImage: payload.coverImage,
            tags: payload.tags,
            authorName: payload.authorName,
        });

        await notifyManualBlogChange("published", post);
        revalidateBlogPaths(post.slug);

        return NextResponse.json({post}, {status: 201});
    } catch (error) {
        return blogErrorResponse(error, "Could not save the blog post.");
    }
}

export async function PUT(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({error: "Unauthorized."}, {status: 401});
    }

    let payload: {
        id?: string;
        title?: string;
        excerpt?: string;
        content?: string;
        coverImage?: string;
        tags?: string[] | string;
        authorName?: string;
    };

    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({error: "Invalid blog post payload."}, {status: 400});
    }

    try {
        const post = await updateInternalBlogPost({
            id: payload.id || "",
            title: payload.title || "",
            excerpt: payload.excerpt,
            content: payload.content || "",
            coverImage: payload.coverImage,
            tags: payload.tags,
            authorName: payload.authorName,
        });

        await notifyManualBlogChange("updated", post);
        revalidateBlogPaths(post.slug);

        return NextResponse.json({post});
    } catch (error) {
        return blogErrorResponse(error, "Could not update the blog post.");
    }
}

export async function DELETE(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({error: "Unauthorized."}, {status: 401});
    }

    let payload: {
        id?: string;
    };

    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({error: "Invalid blog post payload."}, {status: 400});
    }

    try {
        const post = await deleteInternalBlogPost({
            id: payload.id || "",
        });

        await notifyManualBlogChange("deleted", post);
        revalidateBlogPaths(post.slug);

        return NextResponse.json({success: true});
    } catch (error) {
        return blogErrorResponse(error, "Could not delete the blog post.");
    }
}

function isAuthenticated(request: NextRequest) {
    return verifyBlogAdminSessionToken(request.cookies.get(BLOG_ADMIN_COOKIE_NAME)?.value);
}

function revalidateBlogPaths(slug: string) {
    for (const locale of SEO_SITE_LOCALES) {
        revalidatePath(getLocalizedPagePath(locale, "blog"));
        revalidatePath(getLocalizedPagePath(locale, `blog/${slug}`));
    }
}

function blogErrorResponse(error: unknown, fallbackMessage: string) {
    const message = error instanceof Error ? error.message : fallbackMessage;
    const status = isBlogStorageUnavailableError(error)
        ? 503
        : message === "Blog post not found."
            ? 404
            : 500;

    return NextResponse.json({error: message}, {status});
}
