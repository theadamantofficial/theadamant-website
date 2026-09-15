export const INTRO_COMPLETION_STORAGE_KEY = "adamant:intro-completed-at";
export const INTRO_REPLAY_THRESHOLD_DAYS = 25;
export const INTRO_REPLAY_THRESHOLD_MS = INTRO_REPLAY_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

export function hasRecentIntroCompletion(storage: ReadableStorage, now = Date.now()): boolean {
    try {
        const completedAt = Number(storage.getItem(INTRO_COMPLETION_STORAGE_KEY));
        const age = now - completedAt;
        return Number.isFinite(completedAt)
            && completedAt > 0
            && age >= 0
            && age < INTRO_REPLAY_THRESHOLD_MS;
    } catch {
        return false;
    }
}

export function recordIntroCompletion(storage: WritableStorage, completedAt = Date.now()): void {
    try {
        storage.setItem(INTRO_COMPLETION_STORAGE_KEY, String(completedAt));
    } catch {
        // Storage can be disabled without preventing access to the website.
    }
}
