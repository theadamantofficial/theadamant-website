import {NextRequest, NextResponse} from "next/server";
import {
    BLOG_ADMIN_COOKIE_NAME,
    getBlogAdminCredentials,
    verifyBlogAdminSessionToken,
} from "@/lib/internal-blog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const credentials = getBlogAdminCredentials();
    const token = request.cookies.get(BLOG_ADMIN_COOKIE_NAME)?.value;

    return NextResponse.json({
        authenticated: verifyBlogAdminSessionToken(token),
        email: credentials.configured ? credentials.email : null,
        configured: credentials.configured,
        usesDefaults: credentials.usesDefaults,
    });
}
