"use client";
import dynamic from "next/dynamic";
import {useState} from "react";
import {Globe2} from "lucide-react";
const Switcher = dynamic(() => import("./language-switcher").then(module => module.LanguageSwitcher), {ssr: false});
export function DeferredLanguageSwitcher({mobile = false}: {mobile?: boolean}) {
    const [enabled, setEnabled] = useState(false);
    if (enabled) return <Switcher mobile={mobile} autoFocus/>;
    return <button type="button" onClick={() => setEnabled(true)}
        className={"flex items-center gap-2 border border-black/10 bg-white/72 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 " + (mobile ? "w-full rounded-2xl" : "rounded-full")}
        aria-label="Choose website language"><Globe2 size={16}/>Language</button>;
}
