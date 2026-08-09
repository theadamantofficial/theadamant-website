export async function crmFetch<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        ...init,
        headers: {
            ...(init?.body ? {"Content-Type": "application/json"} : {}),
            ...init?.headers,
        },
        cache: "no-store",
    });
    const data = await response.json().catch(() => ({})) as T & {error?: string};
    if (response.status === 401 && typeof window !== "undefined") {
        window.location.assign(`/admin/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        throw new Error("Your session has expired.");
    }
    if (!response.ok) throw new Error(data.error || "The request could not be completed.");
    return data;
}
