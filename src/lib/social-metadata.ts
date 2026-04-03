import type {Metadata} from "next";
import {getSiteUrl} from "@/lib/site-url";

export const DEFAULT_SOCIAL_IMAGE_PATH = "/images/social-preview.png";
export const DEFAULT_SOCIAL_IMAGE_ALT = "The Adamant | Digital Product Design and Development";
const SITE_NAME = "The Adamant";
const TWITTER_HANDLE = "@theadamantofc";

function getAbsoluteImageUrl(imagePath: string) {
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }

    const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

    return `${getSiteUrl()}${normalizedPath}`;
}

function getAbsolutePageUrl(pagePath?: string | null) {
    if (!pagePath || pagePath === "/") {
        return getSiteUrl();
    }

    if (pagePath.startsWith("http://") || pagePath.startsWith("https://")) {
        return pagePath;
    }

    const normalizedPath = pagePath.startsWith("/") ? pagePath : `/${pagePath}`;

    return `${getSiteUrl()}${normalizedPath}`;
}

export function getOpenGraphImages(imagePath?: string | null, alt = DEFAULT_SOCIAL_IMAGE_ALT) {
    const resolvedImagePath = imagePath ?? DEFAULT_SOCIAL_IMAGE_PATH;
    const isDefaultImage = resolvedImagePath === DEFAULT_SOCIAL_IMAGE_PATH;

    return [{
        url: getAbsoluteImageUrl(resolvedImagePath),
        alt,
        type: isDefaultImage ? "image/png" : undefined,
        width: isDefaultImage ? 1200 : undefined,
        height: isDefaultImage ? 630 : undefined,
    }];
}

export function getTwitterImages(imagePath?: string | null) {
    return [getAbsoluteImageUrl(imagePath ?? DEFAULT_SOCIAL_IMAGE_PATH)];
}

export function buildOpenGraphMetadata({
    title,
    description,
    pagePath,
    imagePath,
    alt = DEFAULT_SOCIAL_IMAGE_ALT,
    type = "website",
    locale,
}: {
    title: string;
    description: string;
    pagePath?: string | null;
    imagePath?: string | null;
    alt?: string;
    type?: "website" | "article";
    locale?: string;
}): NonNullable<Metadata["openGraph"]> {
    return {
        title,
        description,
        type,
        url: getAbsolutePageUrl(pagePath),
        siteName: SITE_NAME,
        locale,
        images: getOpenGraphImages(imagePath, alt),
    };
}

export function buildTwitterMetadata({
    title,
    description,
    imagePath,
}: {
    title: string;
    description: string;
    imagePath?: string | null;
}): NonNullable<Metadata["twitter"]> {
    return {
        card: "summary_large_image",
        title,
        description,
        creator: TWITTER_HANDLE,
        site: TWITTER_HANDLE,
        images: getTwitterImages(imagePath),
    };
}
