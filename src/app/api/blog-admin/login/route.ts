import {NextRequest, NextResponse} from "next/server";
import {
    BLOG_ADMIN_COOKIE_NAME,
    createBlogAdminSessionToken,
    getBlogAdminCredentials,
    getBlogAdminSessionCookieOptions,
} from "@/lib/internal-blog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    let payload: { email?: string; password?: string };

    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({error: "Invalid login request."}, {status: 400});
    }

    const credentials = getBlogAdminCredentials();

    if (!credentials.configured) {
        return NextResponse.json(
            {error: "Blog admin credentials are not configured yet."},
            {status: 503},
        );
    }

    const email = payload.email?.trim().toLowerCase() || "";
    const password = payload.password?.trim() || "";

    if (email !== credentials.email || password !== credentials.password) {
        return NextResponse.json({error: "Incorrect email or password."}, {status: 401});
    }

    const response = NextResponse.json({
        authenticated: true,
        email: credentials.email,
        usesDefaults: credentials.usesDefaults,
    });

    response.cookies.set(
        BLOG_ADMIN_COOKIE_NAME,
        createBlogAdminSessionToken(credentials.email),
        getBlogAdminSessionCookieOptions(),
    );

    return response;
}
