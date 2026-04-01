import {NextRequest, NextResponse} from "next/server";
import {
    BLOG_ADMIN_COOKIE_NAME,
    getBlogAdminCredentials,
    getBlogAdminSessionFromToken,
} from "@/lib/internal-blog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const credentials = getBlogAdminCredentials();
    const token = request.cookies.get(BLOG_ADMIN_COOKIE_NAME)?.value;
    const session = getBlogAdminSessionFromToken(token);

    return NextResponse.json({
        authenticated: session.authenticated,
        email: session.email,
        configured: credentials.configured,
        usesDefaults: credentials.usesDefaults,
    });
}
