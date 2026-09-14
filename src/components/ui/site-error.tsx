"use client";

import {useEffect} from "react";
import {reportClientCrash} from "@/lib/telemetry/client";

export default function SiteError({error, reset}: {error: Error & {digest?: string}; reset: () => void}) {
    useEffect(() => { reportClientCrash(error, "react-boundary"); }, [error]);
    return <main style={{minHeight: "70vh", display: "grid", placeItems: "center", padding: "40px 24px", background: "#f8f5ef", color: "#242824", fontFamily: "system-ui, sans-serif"}}>
        <div style={{maxWidth: 440, textAlign: "center"}}>
            <h1 style={{fontSize: 30, marginBottom: 16}}>Something went wrong</h1>
            <p style={{lineHeight: 1.6}}>Please try again. If the problem continues, contact us at <a href="mailto:admin@theadamant.com">admin@theadamant.com</a>.</p>
            <button type="button" onClick={reset} style={{marginTop: 24, padding: "12px 24px", background: "#0d5c63", color: "white", border: 0, borderRadius: 8, cursor: "pointer", fontSize: 16}}>Try again</button>
        </div>
    </main>;
}
