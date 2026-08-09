export const CRM_ACCESS_COOKIE = "adamant_crm_access";
export const CRM_REFRESH_COOKIE = "adamant_crm_refresh";

export const CRM_AUTH_COOKIE_OPTIONS = {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
};
