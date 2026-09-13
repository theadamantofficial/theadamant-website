import * as THREE from "three";

/** Repeat the brand intro and reactions; hold the final reaction during zoom. */
export function createStudioMonitorMedia(host: HTMLElement, anisotropy: number) {
    const fallback = document.createElement("canvas");
    fallback.width = 1280; fallback.height = 720;
    const context = fallback.getContext("2d");
    if (context) {
        context.fillStyle = "#0d5c63"; context.fillRect(0, 0, 1280, 720);
        context.fillStyle = "#fffaf2"; context.font = "600 100px Arial"; context.textAlign = "center";
        context.fillText("ADAMANT", 640, 380);
    }
    const textures: THREE.Texture[] = [];
    const configure = <T extends THREE.Texture>(texture: T) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = anisotropy;
        textures.push(texture); return texture;
    };
    const fallbackTexture = configure(new THREE.CanvasTexture(fallback));
    let disposed = false, active = false, held = false;
    let phase: "intro" | "reactions" = "intro";
    let introPosterReady = false, finalReady = false;
    const loader = new THREE.TextureLoader();
    const introPoster = configure(loader.load("/videos/adamant-logo-reveal-poster.png", () => {if (!disposed) introPosterReady = true;}));
    const finalReaction = configure(loader.load("/videos/adamant-mascot-reactions-final.png", () => {if (!disposed) finalReady = true;}));
    const video = (source: string, name: string) => {
        const element = document.createElement("video");
        element.src = source; element.muted = true; element.playsInline = true;
        element.preload = "auto"; element.hidden = true;
        element.dataset.monitorVideo = name; element.setAttribute("aria-hidden", "true");
        host.appendChild(element);
        return element;
    };
    const intro = video("/videos/adamant-logo-reveal.mp4", "intro");
    const reactions = video("/videos/adamant-mascot-reactions.mp4", "reactions");
    const introTexture = configure(new THREE.VideoTexture(intro));
    const reactionTexture = configure(new THREE.VideoTexture(reactions));
    const pending = new Set<HTMLVideoElement>();
    const syncPlayback = () => {
        const current = phase === "intro" ? intro : reactions;
        const other = phase === "intro" ? reactions : intro;
        other.pause();
        if (!active || held || disposed) {current.pause(); return;}
        if (current.paused && current.readyState >= 2 && !pending.has(current)) {
            pending.add(current);
            void current.play().catch(() => {}).finally(() => {
                pending.delete(current);
                if (disposed || !active || held) current.pause();
            });
        }
    };
    const finishIntro = () => {phase = "reactions"; reactions.currentTime = 0; syncPlayback();};
    const finishReactions = () => {phase = "intro"; intro.currentTime = 0; syncPlayback();};
    intro.addEventListener("ended", finishIntro);
    intro.addEventListener("error", finishIntro);
    reactions.addEventListener("ended", finishReactions);
    reactions.addEventListener("error", finishReactions);
    const setPlayback = (playing: boolean) => {active = playing; syncPlayback();};
    const update = (progress: number) => {
        // Zoom always lands on the supplied clip's final smiling reaction.
        held = progress > .05;
        host.dataset.monitorPhase = held ? "final-reaction" : phase;
        syncPlayback();
        if (held && finalReady) return finalReaction;
        if (phase === "reactions" && reactions.readyState >= 2) return reactionTexture;
        if (phase === "intro" && intro.readyState >= 2) return introTexture;
        return introPosterReady ? introPoster : fallbackTexture;
    };
    return {
        update, setPlayback,
        dispose: () => {
            disposed = true; active = false;
            intro.removeEventListener("ended", finishIntro); intro.removeEventListener("error", finishIntro);
            reactions.removeEventListener("ended", finishReactions); reactions.removeEventListener("error", finishReactions);
            [intro, reactions].forEach(element => {element.pause(); element.removeAttribute("src"); element.load(); element.remove();});
            textures.forEach(texture => texture.dispose()); delete host.dataset.monitorPhase;
        },
    };
}
