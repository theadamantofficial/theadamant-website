import {NextRequest, NextResponse} from "next/server";
import {
    BLOG_ADMIN_COOKIE_NAME,
    createInternalBlogPost,
    deleteInternalBlogPost,
    listInternalBlogPosts,
    notifyManualBlogChange,
    updateInternalBlogPost,
    verifyBlogAdminSessionToken,
} from "@/lib/internal-blog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({error: "Unauthorized."}, {status: 401});
    }

    const posts = await listInternalBlogPosts();
    return NextResponse.json({posts});
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

        return NextResponse.json({post}, {status: 201});
    } catch (error) {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Could not save the blog post.",
            },
            {status: 500},
        );
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

        return NextResponse.json({post});
    } catch (error) {
        const message = error instanceof Error ? error.message : "Could not update the blog post.";
        return NextResponse.json({error: message}, {status: message === "Blog post not found." ? 404 : 500});
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

        return NextResponse.json({success: true});
    } catch (error) {
        const message = error instanceof Error ? error.message : "Could not delete the blog post.";
        return NextResponse.json({error: message}, {status: message === "Blog post not found." ? 404 : 500});
    }
}

function isAuthenticated(request: NextRequest) {
    return verifyBlogAdminSessionToken(request.cookies.get(BLOG_ADMIN_COOKIE_NAME)?.value);
}
