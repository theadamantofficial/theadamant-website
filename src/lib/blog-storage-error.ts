export class BlogStorageUnavailableError extends Error {
    readonly code = "BLOG_STORAGE_UNAVAILABLE";

    constructor(cause?: unknown) {
        super("Blog database unavailable.");
        this.name = "BlogStorageUnavailableError";

        if (cause !== undefined) {
            Object.defineProperty(this, "cause", {
                configurable: true,
                value: cause,
            });
        }
    }
}

export class BlogSlugConflictError extends Error {
    readonly code = "BLOG_SLUG_CONFLICT";

    constructor(slug: string, cause?: unknown) {
        super(`Blog slug already exists: ${slug}`);
        this.name = "BlogSlugConflictError";

        if (cause !== undefined) {
            Object.defineProperty(this, "cause", {
                configurable: true,
                value: cause,
            });
        }
    }
}

export function isBlogStorageUnavailableError(error: unknown): error is BlogStorageUnavailableError {
    return error instanceof BlogStorageUnavailableError
        || (error instanceof Error && "code" in error && error.code === "BLOG_STORAGE_UNAVAILABLE");
}

export function isBlogSlugConflictError(error: unknown): error is BlogSlugConflictError {
    return error instanceof BlogSlugConflictError
        || (error instanceof Error && "code" in error && error.code === "BLOG_SLUG_CONFLICT");
}
