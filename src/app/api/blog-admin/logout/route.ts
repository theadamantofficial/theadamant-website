import {NextResponse} from "next/server";
import {BLOG_ADMIN_COOKIE_NAME} from "@/lib/internal-blog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
    const response = NextResponse.json({authenticated: false});
    response.cookies.set(BLOG_ADMIN_COOKIE_NAME, "", {
        httpOnly: true,
        maxAge: 0,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });

    return response;
}
