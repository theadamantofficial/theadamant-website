import {getSiteUrl} from "@/lib/site-url";

export const DEFAULT_SOCIAL_IMAGE_PATH = "/opengraph-image";
export const DEFAULT_SOCIAL_IMAGE_ALT = "The Adamant | Digital Product Design and Development";

function getAbsoluteImageUrl(imagePath: string) {
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }

    const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

    return `${getSiteUrl()}${normalizedPath}`;
}

export function getOpenGraphImages(imagePath?: string | null, alt = DEFAULT_SOCIAL_IMAGE_ALT) {
    const resolvedImagePath = imagePath ?? DEFAULT_SOCIAL_IMAGE_PATH;
    const isDefaultImage = resolvedImagePath === DEFAULT_SOCIAL_IMAGE_PATH;

    return [{
        url: getAbsoluteImageUrl(resolvedImagePath),
        alt,
        width: isDefaultImage ? 1200 : undefined,
        height: isDefaultImage ? 630 : undefined,
    }];
}

export function getTwitterImages(imagePath?: string | null) {
    return [getAbsoluteImageUrl(imagePath ?? DEFAULT_SOCIAL_IMAGE_PATH)];
}
