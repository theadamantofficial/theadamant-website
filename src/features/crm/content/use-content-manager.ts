"use client";

import {useCallback, useEffect, useState} from "react";

export function useContentManager<T extends {id: string}>(endpoint: string, plural: string, singular: string) {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const load = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(endpoint, {cache: "no-store", signal});
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Content could not be loaded.");
            setItems(data[plural]);
        } catch (error) {
            if (!signal?.aborted) setError(error instanceof Error ? error.message : "Please try again.");
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [endpoint, plural]);
    useEffect(() => {
        const controller = new AbortController();
        void load(controller.signal);
        return () => controller.abort();
    }, [load]);

    async function mutate(method: "POST" | "PATCH" | "DELETE", payload: Record<string, unknown>) {
        if (saving) return false;
        setSaving(true);
        setError("");
        setNotice("");
        try {
            const response = await fetch(endpoint, {method, headers: {"Content-Type": "application/json"}, body: JSON.stringify(payload)});
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Changes could not be saved.");
            if (method === "DELETE") setItems((current) => current.filter((item) => item.id !== payload.id));
            else {
                const item = data[singular] as T;
                setItems((current) => method === "POST" ? [item, ...current] : current.map((existing) => existing.id === item.id ? item : existing));
            }
            setNotice(method === "DELETE" ? "Deleted successfully." : "Saved successfully. Published content appears on the next homepage load.");
            return true;
        } catch (error) {
            setError(error instanceof Error ? error.message : "Please try again.");
            return false;
        } finally { setSaving(false); }
    }
    return {items, loading, saving, error, notice, load, mutate, setError};
}
