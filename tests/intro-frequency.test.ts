import {describe, expect, it} from "vitest";
import {
    hasRecentIntroCompletion,
    INTRO_COMPLETION_STORAGE_KEY,
    INTRO_REPLAY_THRESHOLD_MS,
    recordIntroCompletion,
} from "@/lib/intro-frequency";

function memoryStorage(initialValue: string | null = null) {
    let value = initialValue;
    return {
        getItem: (key: string) => key === INTRO_COMPLETION_STORAGE_KEY ? value : null,
        setItem: (key: string, nextValue: string) => {
            if (key === INTRO_COMPLETION_STORAGE_KEY) value = nextValue;
        },
    };
}

describe("intro replay frequency", () => {
    it("keeps the intro hidden for 25 days after completion", () => {
        const now = Date.UTC(2026, 8, 15);
        const storage = memoryStorage();
        recordIntroCompletion(storage, now);

        expect(hasRecentIntroCompletion(storage, now + INTRO_REPLAY_THRESHOLD_MS - 1)).toBe(true);
    });

    it("allows the intro again once the 25-day threshold expires", () => {
        const now = Date.UTC(2026, 8, 15);
        const storage = memoryStorage(String(now));

        expect(hasRecentIntroCompletion(storage, now + INTRO_REPLAY_THRESHOLD_MS)).toBe(false);
    });

    it("shows the intro when completion storage is missing, invalid, or unavailable", () => {
        expect(hasRecentIntroCompletion(memoryStorage(), Date.now())).toBe(false);
        expect(hasRecentIntroCompletion(memoryStorage("not-a-date"), Date.now())).toBe(false);
        expect(hasRecentIntroCompletion({getItem: () => { throw new Error("blocked"); }}, Date.now())).toBe(false);
    });
});
