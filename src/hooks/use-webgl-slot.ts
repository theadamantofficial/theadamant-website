"use client";
import {useCallback, useId, useSyncExternalStore} from "react";
let owner: string | null = null;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {listeners.add(listener); return () => {listeners.delete(listener);};};
/** Scenes wait for the previous renderer to be disposed before claiming the slot. */
export function useWebGLSlot() {
    const id = useId();
    const available = useSyncExternalStore(subscribe, () => owner === null || owner === id, () => true);
    const claim = useCallback(() => {
        if (owner !== null) return null;
        owner = id; listeners.forEach(notify => notify());
        let released = false;
        return () => {
            if (released) return;
            released = true;
            if (owner === id) {owner = null; listeners.forEach(notify => notify());}
        };
    }, [id]);
    return {available, claim};
}
