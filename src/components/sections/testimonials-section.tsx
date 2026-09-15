"use client";

import {useEffect, useState, type FormEvent} from "react";
import dynamic from "next/dynamic";
import {ArrowUpRight, CheckCircle2, LoaderCircle, MessageSquareQuote, Quote, Star} from "lucide-react";
import {Reveal} from "@/components/ui/reveal";
import {GOOGLE_REVIEW_URL, type Testimonial} from "@/lib/testimonials";
import {useMotionCapability} from "@/hooks/use-motion-capability";

const DotLottieReact = dynamic(
    () => import("@lottiefiles/dotlottie-react").then((module) => module.DotLottieReact),
    {ssr: false},
);

function GoogleReviewLink({className = "button-secondary"}: {className?: string}) {
    return <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer" className={className}>
        <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-base font-bold text-[#4285f4]">G</span>
        Write a Google review <ArrowUpRight className="h-4 w-4" aria-hidden="true"/>
    </a>;
}

export default function TestimonialsSection() {
    const {capability} = useMotionCapability();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [rating, setRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [visibleCount, setVisibleCount] = useState(6);
    const fieldClass = "mt-2 w-full rounded-xl border border-foreground/15 bg-background/70 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

    useEffect(() => {
        const controller = new AbortController();
        async function load() {
            try {
                const response = await fetch("/api/testimonials", {signal: controller.signal, cache: "no-store"});
                const data = await response.json();
                if (!response.ok) throw new Error(data.error);
                setTestimonials(data.testimonials);
            } catch {
                if (!controller.signal.aborted) setLoadError(true);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        void load();
        return () => controller.abort();
    }, []);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting) return;
        setError("");
        if (!rating) { setError("Choose a star rating before submitting."); return; }
        const form = event.currentTarget;
        const fields = new FormData(form);
        setSubmitting(true);
        try {
            const response = await fetch("/api/testimonials", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    name: fields.get("name"), email: fields.get("email"), company: fields.get("company"),
                    message: fields.get("message"), website: fields.get("website"),
                    rating, consent: fields.get("consent") === "on",
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Your testimonial could not be saved.");
            form.reset();
            setRating(0);
            setSubmitted(true);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Please try again shortly.");
        } finally {
            setSubmitting(false);
        }
    }

    return <section id="testimonials" className="section-shell scroll-mt-28 py-20 sm:py-24" aria-labelledby="testimonials-heading">
        <Reveal>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                    <p className="section-kicker"><MessageSquareQuote className="h-4 w-4" aria-hidden="true"/> Client testimonials</p>
                    <h2 id="testimonials-heading" className="section-title">Your experience.<br/><span className="text-primary">In your words.</span></h2>
                    <p className="section-copy">Good work starts with a conversation. Here’s what working with Adamant feels like, from the people who know us.</p>
                </div>
                <GoogleReviewLink/>
            </div>
        </Reveal>

        <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex min-w-0 flex-col">
                {loading ? <div role="status" className="glass-panel flex min-h-64 flex-1 items-center justify-center gap-3 rounded-[2rem] p-8 text-foreground/65"><LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true"/> Loading testimonials…</div>
                    : testimonials.length ? <>
                        <div className="grid flex-1 auto-rows-fr gap-4 sm:grid-cols-2">
                            {testimonials.slice(0, visibleCount).map((testimonial) => <article key={testimonial.id} className="glass-panel flex h-full min-w-0 flex-col rounded-[1.5rem] p-6">
                                <div className="flex items-center justify-between gap-3">
                                    <span role="img" aria-label={`${testimonial.rating} out of 5 stars`} className="flex gap-1 text-[#b87516] dark:text-amber-400">
                                        {[1, 2, 3, 4, 5].map((star) => <Star key={star} className="h-4 w-4" fill={star <= testimonial.rating ? "currentColor" : "none"} aria-hidden="true"/>)}
                                    </span>
                                    <Quote className="h-6 w-6 text-primary/25" aria-hidden="true"/>
                                </div>
                                <blockquote className="mt-5 flex-1 whitespace-pre-wrap break-words text-sm leading-7 text-foreground/80">“{testimonial.message}”</blockquote>
                                <div className="mt-6 flex items-center gap-3 border-t border-foreground/10 pt-5">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary" aria-hidden="true">{testimonial.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span>
                                    <div className="min-w-0"><p className="break-words text-sm font-semibold">{testimonial.name}</p>{testimonial.company && <p className="mt-1 break-words text-xs text-foreground/60">{testimonial.company}</p>}</div>
                                </div>
                            </article>)}
                        </div>
                        {visibleCount < testimonials.length && <button type="button" className="button-secondary mt-5 self-start" onClick={() => setVisibleCount((count) => count + 6)}>Show more testimonials</button>}
                    </> : <div className="relative flex flex-1 flex-col overflow-hidden rounded-[2rem] bg-[#0d363a] p-8 text-white sm:p-10">
                        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(88,183,179,0.25),transparent_65%)]"/>
                        <Quote className="relative h-12 w-12 text-white/25" aria-hidden="true"/>
                        <h3 className="relative mt-8 text-3xl font-semibold tracking-tight">Every project has a story.<br/>We’d love to hear yours.</h3>
                        <p className="relative mt-5 max-w-md text-sm leading-7 text-white/75">{loadError ? "We couldn’t load testimonials right now. You can still share your experience or visit our Google profile." : "Worked with us? Share what we built together, what stood out, and how it helped your business. Your words could help someone take their next step."}</p>
                        <div className="relative flex min-h-64 flex-1 items-center justify-center py-6 sm:min-h-80" aria-hidden="true">
                            <DotLottieReact
                                src="/animations/testimonial-story.lottie"
                                autoplay={capability !== "reduced"}
                                loop={capability !== "reduced"}
                                className="h-auto w-full max-w-[30rem]"
                            />
                        </div>
                        <a href="#write-testimonial" className="relative mt-auto inline-flex w-fit items-center gap-2 pt-8 text-sm font-semibold text-white underline underline-offset-4">Share your experience <ArrowUpRight className="h-4 w-4" aria-hidden="true"/></a>
                    </div>}
            </div>

            <Reveal className="glass-panel rounded-[2rem] p-6 sm:p-8">
                <div id="write-testimonial" className="scroll-mt-28">
                    {submitted ? <div role="status" className="py-8">
                        <CheckCircle2 className="h-12 w-12 text-primary" aria-hidden="true"/>
                        <h3 className="mt-5 text-2xl font-semibold tracking-tight">Thanks for sharing your story.</h3>
                        <p className="mt-4 text-sm leading-7 text-foreground/70">Your testimonial has been saved and will appear here once our team approves it.</p>
                        <p className="mt-5 text-sm leading-7 text-foreground/70">Want to share it on Google too? You can write a review using the button below.</p>
                        <div className="mt-6"><GoogleReviewLink className="button-primary"/></div>
                        <button type="button" className="mt-6 text-sm text-primary underline underline-offset-4" onClick={() => setSubmitted(false)}>Back to the form</button>
                    </div> : <>
                        <p className="section-kicker">Over to you</p>
                        <h3 className="mt-2 text-2xl font-semibold tracking-tight">Write a testimonial</h3>
                        <p className="mt-3 text-sm leading-6 text-foreground/65">Tell us about your experience. Your email stays private.</p>
                        <form onSubmit={submit} className="mt-6">
                            <fieldset disabled={submitting} className="space-y-5">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="text-sm font-medium" htmlFor="testimonial-name">Your name <span aria-hidden="true">*</span><input id="testimonial-name" name="name" required minLength={2} maxLength={80} autoComplete="name" placeholder="Your full name" className={fieldClass}/></label>
                                    <label className="text-sm font-medium" htmlFor="testimonial-company">Company <span className="font-normal text-foreground/55">(optional)</span><input id="testimonial-company" name="company" maxLength={100} autoComplete="organization" placeholder="Company or role" className={fieldClass}/></label>
                                </div>
                                <label className="block text-sm font-medium" htmlFor="testimonial-email">Email address <span aria-hidden="true">*</span><input id="testimonial-email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@company.com" className={fieldClass}/></label>
                                <fieldset>
                                    <legend className="text-sm font-medium">Your rating <span aria-hidden="true">*</span></legend>
                                    <div className="mt-3 flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => <label key={star} className="relative cursor-pointer rounded-lg p-1.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary">
                                            <input type="radio" name="rating" value={star} checked={rating === star} onChange={() => setRating(star)} required aria-label={`${star} ${star === 1 ? "star" : "stars"}`} className="sr-only"/>
                                            <Star className={`h-7 w-7 ${star <= rating ? "text-[#b87516] dark:text-amber-400" : "text-foreground/25"}`} fill={star <= rating ? "currentColor" : "none"} aria-hidden="true"/>
                                        </label>)}
                                        <span className="ml-2 text-xs text-foreground/60" aria-live="polite">{rating ? `${rating}/5` : "Select a rating"}</span>
                                    </div>
                                </fieldset>
                                <label className="block text-sm font-medium" htmlFor="testimonial-message">Your experience <span aria-hidden="true">*</span><textarea id="testimonial-message" name="message" required minLength={20} maxLength={1500} rows={5} placeholder="What did we work on together? What stood out?" className={`${fieldClass} resize-y`}/><span className="mt-1 block text-xs font-normal text-foreground/55">20–1,500 characters</span></label>
                                <div className="hidden" aria-hidden="true"><label htmlFor="testimonial-website">Website<input id="testimonial-website" name="website" tabIndex={-1} autoComplete="off"/></label></div>
                                <label className="flex items-start gap-3 text-xs leading-6 text-foreground/70"><input name="consent" type="checkbox" required className="mt-1.5 h-4 w-4 shrink-0 accent-primary"/>I agree that Adamant may publish my name, company, rating, and testimonial on this website.</label>
                                {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
                                <button type="submit" className="button-primary w-full disabled:cursor-wait disabled:opacity-60">{submitting ? <><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true"/> Saving testimonial…</> : <>Submit testimonial <ArrowUpRight className="h-4 w-4" aria-hidden="true"/></>}</button>
                            </fieldset>
                            <p className="mt-4 text-center text-xs leading-5 text-foreground/55">Testimonials are reviewed before they appear on the website.</p>
                        </form>
                    </>}
                </div>
            </Reveal>
        </div>
        <p className="mt-4 px-2 text-xs leading-5 text-foreground/60">These testimonials are submitted on our website. Google reviews are available on our Google profile.</p>
    </section>;
}
