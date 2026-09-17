import {NextRequest, NextResponse} from "next/server";
import {generateSeoRecommendations, saveSeoRecommendations} from "@/lib/seo-keyword-research";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const configuredSecret = process.env.CRON_SECRET?.trim();
    const providedSecret = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
    if (!configuredSecret || providedSecret !== configuredSecret) {
        return NextResponse.json({error: "Unauthorized."}, {status: 401});
    }

    try {
        const {recommendations, queryCount} = await generateSeoRecommendations();
        await saveSeoRecommendations(recommendations, queryCount);
        return NextResponse.json({saved: recommendations.length, queryCount});
    } catch (error) {
        console.error("Weekly SEO research failed.", error);
        return NextResponse.json({error: error instanceof Error ? error.message : "SEO research failed."}, {status: 502});
    }
}
