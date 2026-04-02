import {NextRequest, NextResponse} from "next/server";
import {revalidatePath} from "next/cache";
import {
    BLOG_ADMIN_COOKIE_NAME,
    generateAiCoversForPostsMissingImages,
    listInternalBlogPosts,
    verifyBlogAdminSessionToken,
} from "@/lib/internal-blog";
import {SEO_SITE_LOCALES, getLocalizedPagePath} from "@/lib/site-locale";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    if (!verifyBlogAdminSessionToken(request.cookies.get(BLOG_ADMIN_COOKIE_NAME)?.value)) {
        return NextResponse.json({error: "Unauthorized."}, {status: 401});
    }

    try {
        const result = await generateAiCoversForPostsMissingImages();

        for (const locale of SEO_SITE_LOCALES) {
            revalidatePath(getLocalizedPagePath(locale, "blog"));
        }

        for (const slug of result.updatedSlugs) {
            for (const locale of SEO_SITE_LOCALES) {
                revalidatePath(getLocalizedPagePath(locale, `blog/${slug}`));
            }
        }

        return NextResponse.json({
            ...result,
            posts: await listInternalBlogPosts(),
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Could not generate AI covers.",
            },
            {status: 500},
        );
    }
}
