import type {Metadata} from "next";
import PeelReveal from "@/components/visuals/peel-reveal";

export const metadata: Metadata = {
    title: "Cloth intro preview",
    robots: {index: false, follow: false},
};

/** Isolates the intro from homepage widgets and the studio renderer for profiling. */
export default function TearPreview() {
    return <main style={{minHeight: "100svh", background: "#113b38", color: "#eae0ce", display: "grid", placeItems: "center", padding: "2rem"}}>
        <PeelReveal/>
        <div style={{textAlign: "center"}}>
            <p style={{font: "500 .8rem monospace", letterSpacing: ".2em"}}>THE PAGE UNDERNEATH</p>
            <h1 style={{fontSize: "clamp(2rem, 8vw, 6rem)", lineHeight: 1.1}}>Make an impression.</h1>
            <p style={{marginTop: "2rem"}}>Only the torn openings reveal this page. Reload to try again.</p>
        </div>
    </main>;
}
