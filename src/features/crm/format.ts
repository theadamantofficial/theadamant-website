export function formatInr(value: number | string | null | undefined) {
    return new Intl.NumberFormat("en-IN", {style: "currency", currency: "INR", maximumFractionDigits: 0}).format(Number(value || 0));
}

export function formatCrmDate(value: string | null | undefined, includeTime = false) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("en-IN", includeTime
        ? {day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit"}
        : {day: "numeric", month: "short", year: "numeric"},
    ).format(new Date(value));
}

export function formatRelativeDate(value: string | null | undefined) {
    if (!value) return "Not scheduled";
    const target = new Date(value);
    const now = new Date();
    const dayMs = 86_400_000;
    const targetDay = new Date(target); targetDay.setHours(0, 0, 0, 0);
    const currentDay = new Date(now); currentDay.setHours(0, 0, 0, 0);
    const days = Math.round((targetDay.getTime() - currentDay.getTime()) / dayMs);
    const time = new Intl.DateTimeFormat("en-IN", {hour: "numeric", minute: "2-digit"}).format(target);
    if (days === 0) return `Today, ${time}`;
    if (days === 1) return `Tomorrow, ${time}`;
    if (days === -1) return `Yesterday, ${time}`;
    if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
    return formatCrmDate(value, true);
}

export function toDateTimeLocal(value: string | null | undefined) {
    if (!value) return "";
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
