export class CrmApiError extends Error {
    constructor(message: string, public readonly status = 400) {
        super(message);
        this.name = "CrmApiError";
    }
}

export function crmErrorResponse(error: unknown) {
    if (error instanceof CrmApiError) return {message: error.message, status: error.status};
    console.error("CRM request failed.", error);
    return {message: "Something went wrong. Please try again.", status: 500};
}
