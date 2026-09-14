"use client";

import SiteError from "@/components/ui/site-error";

export default function GlobalError(props: {error: Error & {digest?: string}; reset: () => void}) {
    return <html lang="en"><body style={{margin: 0}}><SiteError {...props}/></body></html>;
}
