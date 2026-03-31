import {NextRequest, NextResponse} from "next/server";
import {
    DEFAULT_LANGUAGE,
    normalizeLanguageCode,
} from "@/lib/translation-config";

const GOOGLE_TRANSLATE_ENDPOINT = "https://translation.googleapis.com/language/translate/v2";
const MAX_TRANSLATION_ITEMS = 200;

interface TranslationRequestBody {
    targetLanguage?: string;
    sourceLanguage?: string;
    texts?: string[];
}

export async function POST(request: NextRequest) {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            {error: "Google Translate is not configured on the server."},
            {status: 503},
        );
    }

    let body: TranslationRequestBody;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({error: "Invalid JSON body."}, {status: 400});
    }

    const targetLanguage = normalizeLanguageCode(body.targetLanguage);
    const sourceLanguage = normalizeLanguageCode(body.sourceLanguage) ?? DEFAULT_LANGUAGE;
    const texts = Array.isArray(body.texts)
        ? body.texts.filter((text): text is string => typeof text === "string")
        : [];

    if (!targetLanguage) {
        return NextResponse.json({error: "A supported target language is required."}, {status: 400});
    }

    if (!texts.length) {
        return NextResponse.json({translations: []});
    }

    if (texts.length > MAX_TRANSLATION_ITEMS) {
        return NextResponse.json(
            {error: `You can translate at most ${MAX_TRANSLATION_ITEMS} strings at once.`},
            {status: 400},
        );
    }

    try {
        const googleResponse = await fetch(`${GOOGLE_TRANSLATE_ENDPOINT}?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                q: texts,
                target: targetLanguage,
                source: sourceLanguage,
                format: "text",
            }),
            cache: "no-store",
        });

        if (!googleResponse.ok) {
            const errorText = await googleResponse.text();
            console.error("Google Translate request failed", errorText);

            return NextResponse.json(
                {error: "Google Translate could not process the request."},
                {status: 502},
            );
        }

        const payload = await googleResponse.json() as {
            data?: {
                translations?: Array<{ translatedText?: string }>;
            };
        };

        const translations = payload.data?.translations?.map((item) => item.translatedText ?? "") ?? [];
        return NextResponse.json({translations});
    } catch (error) {
        console.error("Translation route failed", error);
        return NextResponse.json({error: "Translation request failed."}, {status: 500});
    }
}
