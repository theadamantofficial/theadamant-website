import {NextRequest, NextResponse} from "next/server";
import {detectSiteLocaleFromCountry, SiteLocale} from "@/lib/site-locale";

const GOOGLE_GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json";

interface GoogleAddressComponent {
    long_name?: string;
    short_name?: string;
    types?: string[];
}

interface GoogleGeocodingResponse {
    status?: string;
    results?: Array<{
        address_components?: GoogleAddressComponent[];
    }>;
}

function getComponent(components: GoogleAddressComponent[], type: string) {
    return components.find((component) => component.types?.includes(type))?.long_name?.trim();
}

function getLocaleFromLocation(countryCode: string, region?: string): SiteLocale | null {
    if (countryCode === "IN") {
        const stateLocales: Record<string, SiteLocale> = {
            "Andhra Pradesh": "en",
            Assam: "bn",
            Bihar: "hi",
            Chhattisgarh: "hi",
            Gujarat: "gu",
            Haryana: "hi",
            "Himachal Pradesh": "hi",
            Jharkhand: "hi",
            Karnataka: "en",
            Kerala: "en",
            "Madhya Pradesh": "hi",
            Maharashtra: "mr",
            Odisha: "en",
            Punjab: "hi",
            Rajasthan: "hi",
            "Tamil Nadu": "ta",
            Telangana: "en",
            "Uttar Pradesh": "hi",
            Uttarakhand: "hi",
            "West Bengal": "bn",
        };

        return (region ? stateLocales[region] : undefined) ?? "en";
    }

    return detectSiteLocaleFromCountry(countryCode);
}

export async function POST(request: NextRequest) {
    const apiKey = process.env.GOOGLE_MAPS_GEOCODING_API_KEY?.trim();
    if (!apiKey) {
        return NextResponse.json({error: "Location language detection is not configured."}, {status: 503});
    }

    const body = await request.json().catch(() => null) as {latitude?: unknown; longitude?: unknown} | null;
    const latitude = typeof body?.latitude === "number" ? body.latitude : Number(body?.latitude);
    const longitude = typeof body?.longitude === "number" ? body.longitude : Number(body?.longitude);

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90
        || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        return NextResponse.json({error: "Valid latitude and longitude are required."}, {status: 400});
    }

    const url = new URL(GOOGLE_GEOCODING_URL);
    url.searchParams.set("latlng", `${latitude},${longitude}`);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("language", "en");

    const response = await fetch(url, {next: {revalidate: 86400}});
    if (!response.ok) {
        return NextResponse.json({error: "Location lookup failed."}, {status: 502});
    }

    const data = await response.json() as GoogleGeocodingResponse;
    if (data.status !== "OK" || !data.results?.[0]?.address_components) {
        return NextResponse.json({error: "Location could not be resolved."}, {status: 422});
    }

    const components = data.results[0].address_components;
    const country = components.find((component) => component.types?.includes("country"));
    const region = getComponent(components, "administrative_area_level_1");

    return NextResponse.json({
        locale: getLocaleFromLocation(
            country?.short_name ?? "",
            region,
        ),
    });
}
