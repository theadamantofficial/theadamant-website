type Subscriber = {element: HTMLElement; write: (progress: number) => void};
const subscribers = new Set<Subscriber>();
let frame = 0;
function schedule() {
    if (frame || document.hidden) return;
    frame = requestAnimationFrame(() => {
        frame = 0;
        // Read every section first, then write to avoid forced layout between writes.
        const updates = Array.from(subscribers, subscriber => {
            const rect = subscriber.element.getBoundingClientRect();
            return {subscriber, progress: Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)))};
        });
        updates.forEach(({subscriber, progress}) => subscriber.write(progress));
    });
}
function visibility() {if (document.hidden) {cancelAnimationFrame(frame); frame = 0;} else schedule();}
/** One RAF per scroll, registered only while an observed section is visible. */
export function registerViewportMotion(subscriber: Subscriber) {
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
        window.addEventListener("scroll", schedule, {passive: true});
        window.addEventListener("resize", schedule);
        document.addEventListener("visibilitychange", visibility);
    }
    schedule();
    return () => {
        subscribers.delete(subscriber);
        if (!subscribers.size) {
            cancelAnimationFrame(frame); frame = 0;
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
            document.removeEventListener("visibilitychange", visibility);
        }
    };
}
