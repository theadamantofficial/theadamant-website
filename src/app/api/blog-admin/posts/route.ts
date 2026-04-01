import {NextRequest, NextResponse} from "next/server";
import {
    BLOG_ADMIN_COOKIE_NAME,
    createInternalBlogPost,
    listInternalBlogPosts,
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

function isAuthenticated(request: NextRequest) {
    return verifyBlogAdminSessionToken(request.cookies.get(BLOG_ADMIN_COOKIE_NAME)?.value);
}
