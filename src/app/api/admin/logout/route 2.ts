import {NextResponse} from "next/server";
import {ADMIN_SESSION_COOKIE} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
    const response = NextResponse.json({authenticated: false});
    response.cookies.set(ADMIN_SESSION_COOKIE, "", {
        httpOnly: true,
        maxAge: 0,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });
    return response;
}
