"use client";

import {FormEvent, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {ArrowLeft, KeyRound, Loader2, LockKeyhole, Mail, ShieldCheck, UserPlus} from "lucide-react";

type AuthMode = "signin" | "signup" | "forgot";

type AuthResponse = {
    error?: string;
    requiresEmailConfirmation?: boolean;
};

export function LoginForm({nextPath}: {nextPath: string}) {
    const [mode, setMode] = useState<AuthMode>("signin");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    function selectMode(nextMode: AuthMode) {
        setMode(nextMode);
        setError("");
        setSuccess("");
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formElement = event.currentTarget;
        setSubmitting(true);
        setError("");
        setSuccess("");
        const form = new FormData(formElement);
        const isSignup = mode === "signup";
        const isForgot = mode === "forgot";

        try {
            const response = await fetch(isForgot ? "/api/admin/forgot-password" : isSignup ? "/api/admin/signup" : "/api/admin/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    fullName: isSignup ? form.get("fullName") : undefined,
                    email: form.get("email"),
                    password: isForgot ? undefined : form.get("password"),
                }),
            });
            const data = await response.json() as AuthResponse;
            if (!response.ok) throw new Error(data.error || (isForgot ? "Unable to send the reset link." : isSignup ? "Unable to create your account." : "Unable to sign in."));

            if (isForgot) {
                formElement.reset();
                setSuccess("If an active CRM account exists for that email, a password reset link has been sent.");
                return;
            }

            if (data.requiresEmailConfirmation) {
                formElement.reset();
                setMode("signin");
                setSuccess("Account created. Check your company inbox to confirm your email, then sign in.");
                return;
            }

            window.location.assign(nextPath);
        } catch (authError) {
            setError(authError instanceof Error ? authError.message : (isForgot ? "Unable to send the reset link." : isSignup ? "Unable to create your account." : "Unable to sign in."));
        } finally {
            setSubmitting(false);
        }
    }

    const isSignup = mode === "signup";
    const isForgot = mode === "forgot";

    return <main className="grid min-h-screen bg-[#f5f3ee] text-[#17201f] lg:grid-cols-[minmax(0,1fr)_31rem]">
        <section className="relative hidden overflow-hidden bg-[#0b3437] p-12 text-white lg:flex lg:flex-col xl:p-16">
            <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:56px_56px]"/>
            <Link href="/" className="relative flex w-fit items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white"><Image src="/vectors/logo-the-adamant.svg" alt="Adamant" width={28} height={28}/></span>
                <span className="font-semibold">Adamant</span>
            </Link>
            <div className="relative my-auto max-w-xl">
                <p className="mb-5 text-xs font-semibold uppercase tracking-[.18em] text-[#9fd8d4]">Internal CRM</p>
                <h1 className="font-[var(--font-display)] text-5xl font-semibold leading-[1.06] tracking-[-.04em]">A clear view of every opportunity.</h1>
                <p className="mt-5 max-w-lg text-base leading-7 text-white/58">Manage leads, follow-ups, tasks and pipeline movement from one focused workspace built for Adamant.</p>
            </div>
        </section>

        <section className="flex min-h-screen items-center px-6 py-10 sm:px-12">
            <div className="mx-auto w-full max-w-sm">
                <Link href="/" className="mb-12 inline-flex items-center gap-2 text-xs font-medium text-[#64706d] lg:hidden"><ArrowLeft className="h-3.5 w-3.5"/> Back to website</Link>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0d5c63] text-white">{isForgot ? <KeyRound className="h-4 w-4"/> : isSignup ? <UserPlus className="h-4 w-4"/> : <LockKeyhole className="h-4 w-4"/>}</span>
                <h2 className="mt-6 font-[var(--font-display)] text-3xl font-semibold tracking-[-.035em]">{isForgot ? "Reset your password" : isSignup ? "Create your CRM account" : "Sign in to Adamant CRM"}</h2>
                <p className="mt-2 text-sm text-[#6f7977]">{isForgot ? "Enter your company email and we'll send a secure reset link." : isSignup ? "Use your official Adamant company email." : "Use your approved company account."}</p>

                {!isForgot ? <div className="mt-6 grid grid-cols-2 rounded-lg bg-[#e8e5de] p-1" role="group" aria-label="Choose account action">
                    <button type="button" aria-pressed={!isSignup} onClick={() => selectMode("signin")} className={`h-9 rounded-md text-xs font-semibold transition ${!isSignup ? "bg-white text-[#17302f] shadow-sm" : "text-[#6f7977] hover:text-[#17302f]"}`}>Sign in</button>
                    <button type="button" aria-pressed={isSignup} onClick={() => selectMode("signup")} className={`h-9 rounded-md text-xs font-semibold transition ${isSignup ? "bg-white text-[#17302f] shadow-sm" : "text-[#6f7977] hover:text-[#17302f]"}`}>Sign up</button>
                </div> : <button type="button" onClick={() => selectMode("signin")} className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#0d5c63] hover:text-[#083f45]"><ArrowLeft className="h-3.5 w-3.5"/>Back to sign in</button>}

                <form onSubmit={submit} className="mt-6 space-y-4">
                    {isSignup ? <label className="block">
                        <span className="mb-1.5 block text-xs font-medium">Name</span>
                        <input name="fullName" type="text" autoComplete="name" required minLength={2} maxLength={100} placeholder="Your full name" className="h-11 w-full rounded-lg border border-[#d9d6cf] bg-white px-3.5 text-sm outline-none transition focus:border-[#0d5c63] focus:ring-4 focus:ring-[#0d5c63]/10"/>
                    </label> : null}
                    <label className="block">
                        <span className="mb-1.5 block text-xs font-medium">Email</span>
                        <input name="email" type="email" inputMode="email" autoComplete="email" required placeholder="you@theadamant.com" className="h-11 w-full rounded-lg border border-[#d9d6cf] bg-white px-3.5 text-sm outline-none transition focus:border-[#0d5c63] focus:ring-4 focus:ring-[#0d5c63]/10"/>
                    </label>
                    {!isForgot ? <div className="block">
                        <span className="mb-1.5 flex items-center justify-between gap-3 text-xs font-medium"><label htmlFor="crm-password">Password</label>{!isSignup ? <button type="button" onClick={() => selectMode("forgot")} className="font-semibold text-[#0d5c63] hover:text-[#083f45]">Forgot password?</button> : null}</span>
                        <input id="crm-password" name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} required minLength={isSignup ? 8 : undefined} maxLength={128} className="h-11 w-full rounded-lg border border-[#d9d6cf] bg-white px-3.5 text-sm outline-none transition focus:border-[#0d5c63] focus:ring-4 focus:ring-[#0d5c63]/10"/>
                        {isSignup ? <span className="mt-1.5 block text-[11px] text-[#858d8b]">Use at least 8 characters.</span> : null}
                    </div> : null}

                    {success ? <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs leading-5 text-emerald-800">{success}</p> : null}
                    {error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-xs text-red-700">{error}</p> : null}

                    <button disabled={submitting} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0d5c63] text-sm font-semibold text-white transition hover:bg-[#0a4e54] disabled:opacity-60">
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin"/> : isForgot ? <Mail className="h-4 w-4"/> : isSignup ? <UserPlus className="h-4 w-4"/> : <ShieldCheck className="h-4 w-4"/>}
                        {submitting ? (isForgot ? "Sending reset link…" : isSignup ? "Creating account…" : "Signing in…") : (isForgot ? "Send reset link" : isSignup ? "Create account" : "Sign in")}
                    </button>
                </form>

                <p className="mt-6 text-[11px] leading-5 text-[#858d8b]">CRM accounts are available only to team members using an @theadamant.com email address.</p>
            </div>
        </section>
    </main>;
}
