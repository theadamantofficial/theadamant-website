"use client";

import {FormEvent, useEffect, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {CheckCircle2, KeyRound, Loader2} from "lucide-react";

export function PasswordResetForm() {
    const [tokens, setTokens] = useState<{accessToken: string; refreshToken: string} | null>(null);
    const [linkError, setLinkError] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hash.get("access_token") || "";
        const refreshToken = hash.get("refresh_token") || "";
        const recoveryError = hash.get("error_description") || new URLSearchParams(window.location.search).get("error_description") || "";
        const cleanUrl = new URL(window.location.href);
        cleanUrl.hash = "";
        cleanUrl.searchParams.delete("error_description");
        cleanUrl.searchParams.delete("error");
        cleanUrl.searchParams.delete("error_code");
        window.history.replaceState(null, "", `${cleanUrl.pathname}${cleanUrl.search}`);
        if (recoveryError || !accessToken || !refreshToken) {
            setLinkError(recoveryError || "This password reset link is invalid or has expired.");
            return;
        }
        setTokens({accessToken, refreshToken});
    }, []);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!tokens) return;
        const form = new FormData(event.currentTarget);
        const password = String(form.get("password") || "");
        const confirmation = String(form.get("confirmation") || "");
        if (password !== confirmation) {
            setError("The passwords do not match.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            const response = await fetch("/api/admin/reset-password", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({...tokens, password}),
            });
            const data = await response.json() as {error?: string};
            if (!response.ok) throw new Error(data.error || "Your password could not be updated.");
            setTokens(null);
            setSuccess(true);
        } catch (resetError) {
            setError(resetError instanceof Error ? resetError.message : "Your password could not be updated.");
        } finally {
            setSubmitting(false);
        }
    }

    return <main className="flex min-h-screen items-center justify-center bg-[#f5f3ee] px-6 py-12 text-[#17201f]">
        <section className="w-full max-w-md rounded-2xl border border-[#dfdcd4] bg-white p-6 shadow-[0_28px_80px_-52px_rgba(15,23,42,.48)] sm:p-8">
            <Link href="/" className="flex w-fit items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0d5c63]"><Image src="/vectors/logo-the-adamant.svg" alt="Adamant" width={27} height={27} className="brightness-0 invert"/></span><span className="text-sm font-semibold">Adamant CRM</span></Link>
            <span className="mt-10 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0d5c63] text-white">{success ? <CheckCircle2 className="h-4 w-4"/> : <KeyRound className="h-4 w-4"/>}</span>
            <h1 className="mt-5 font-[var(--font-display)] text-3xl font-semibold tracking-[-.035em]">{success ? "Password updated" : "Choose a new password"}</h1>
            <p className="mt-2 text-sm leading-6 text-[#6f7977]">{success ? "Your new password is ready. You can now sign in to Adamant CRM." : "Use at least 8 characters and keep this password private."}</p>

            {success ? <Link href="/admin/login" className="mt-7 flex h-11 w-full items-center justify-center rounded-lg bg-[#0d5c63] text-sm font-semibold text-white transition hover:bg-[#0a4e54]">Back to sign in</Link> : linkError ? <div className="mt-7 space-y-4"><p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-xs leading-5 text-red-700">{linkError}</p><Link href="/admin/login" className="flex h-11 w-full items-center justify-center rounded-lg bg-[#0d5c63] text-sm font-semibold text-white">Request a new reset link</Link></div> : tokens ? <form onSubmit={submit} className="mt-7 space-y-4">
                <label className="block"><span className="mb-1.5 block text-xs font-medium">New password</span><input name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} className="h-11 w-full rounded-lg border border-[#d9d6cf] px-3.5 text-sm outline-none transition focus:border-[#0d5c63] focus:ring-4 focus:ring-[#0d5c63]/10"/></label>
                <label className="block"><span className="mb-1.5 block text-xs font-medium">Confirm new password</span><input name="confirmation" type="password" autoComplete="new-password" required minLength={8} maxLength={128} className="h-11 w-full rounded-lg border border-[#d9d6cf] px-3.5 text-sm outline-none transition focus:border-[#0d5c63] focus:ring-4 focus:ring-[#0d5c63]/10"/></label>
                {error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-xs leading-5 text-red-700">{error}</p> : null}
                <button disabled={submitting} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0d5c63] text-sm font-semibold text-white transition hover:bg-[#0a4e54] disabled:opacity-60">{submitting ? <Loader2 className="h-4 w-4 animate-spin"/> : <KeyRound className="h-4 w-4"/>}{submitting ? "Updating password…" : "Update password"}</button>
            </form> : <p role="status" className="mt-7 text-sm text-[#6f7977]">Checking your reset link…</p>}
        </section>
    </main>;
}
