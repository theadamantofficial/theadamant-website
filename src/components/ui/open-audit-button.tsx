"use client";

import {type ButtonHTMLAttributes, type ReactNode} from "react";
import {cn} from "@/lib/utils";
import {OPEN_WEBSITE_AUDIT_EVENT} from "@/lib/website-audit-events";

interface OpenAuditButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
}

export function OpenAuditButton({
    children,
    className,
    onClick,
    ...props
}: OpenAuditButtonProps) {
    return (
        <button
            type="button"
            className={cn("button-secondary", className)}
            onClick={(event) => {
                window.dispatchEvent(new Event(OPEN_WEBSITE_AUDIT_EVENT));
                onClick?.(event);
            }}
            {...props}
        >
            {children}
        </button>
    );
}
