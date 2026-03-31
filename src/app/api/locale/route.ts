import {headers} from "next/headers";
import {NextResponse} from "next/server";
import {
    DEFAULT_LANGUAGE,
    detectLanguageFromCountry,
    parseAcceptLanguageHeader,
} from "@/lib/translation-config";

export async function GET() {
    const requestHeaders = await headers();
    const countryCode = requestHeaders.get("x-vercel-ip-country");
    const acceptLanguage = requestHeaders.get("accept-language");

    const detectedLanguage =
        detectLanguageFromCountry(countryCode)
        ?? parseAcceptLanguageHeader(acceptLanguage)
        ?? DEFAULT_LANGUAGE;

    return NextResponse.json({
        language: detectedLanguage,
        translationEnabled: Boolean(process.env.GOOGLE_TRANSLATE_API_KEY),
    });
}
