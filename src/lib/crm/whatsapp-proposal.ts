export const CLIENT_PROPOSAL_LINKS: Record<string, string> = {
    "1": "https://aetherseo.com/en",
    "2": "https://prep-vista-five.vercel.app/",
    "3": "https://prep-vista-five.vercel.app/",
};

export function isClientProposalTemplate(name: string) {
    return name.toLowerCase().replace(/[\s-]+/g, "_") === "client_proposal";
}
