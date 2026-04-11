import {LoadingState} from "@/components/ui/branded-loading";

export default function Loading() {
    return (
        <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-16">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(13,92,99,0.12),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(214,106,69,0.12),transparent_34%)] dark:bg-[radial-gradient(circle_at_top,rgba(88,183,179,0.12),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(238,141,108,0.12),transparent_34%)]"/>
            <div className="relative rounded-[2rem] border border-black/8 bg-white/62 px-7 py-10 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04] sm:px-10 sm:py-12">
                <p className="section-kicker mx-auto !px-3 !py-1.5">The Adamant</p>
                <LoadingState
                    className="mt-5"
                    size="lg"
                    title="Loading your next view"
                    description="Preparing the page with a lighter motion pass so the interface feels quick before the full content arrives."
                />
            </div>
        </main>
    );
}
