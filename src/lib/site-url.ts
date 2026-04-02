const DEFAULT_SITE_URL = "https://theadamant.com";

export function getSiteUrl() {
    return process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/g, "") || DEFAULT_SITE_URL;
}

export function getSiteMetadataBase() {
    return new URL(getSiteUrl());
}
