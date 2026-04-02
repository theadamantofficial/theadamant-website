"use client";

import {type ButtonHTMLAttributes, type ReactNode} from "react";
import {cn} from "@/lib/utils";
import {OPEN_SEO_CHAT_EVENT, type OpenSeoChatEventDetail} from "@/lib/seo-chat-events";

interface OpenSeoChatButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    detail?: OpenSeoChatEventDetail;
}

export function OpenSeoChatButton({
    children,
    className,
    detail,
    onClick,
    ...props
}: OpenSeoChatButtonProps) {
    return (
        <button
            type="button"
            className={cn("button-secondary", className)}
            onClick={(event) => {
                window.dispatchEvent(new CustomEvent(OPEN_SEO_CHAT_EVENT, {detail}));
                onClick?.(event);
            }}
            {...props}
        >
            {children}
        </button>
    );
}
