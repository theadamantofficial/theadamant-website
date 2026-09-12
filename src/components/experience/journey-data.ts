export type ChallengeKind = "website" | "seo" | "application" | "automation" | "crm" | "connected";

export interface JourneyChallenge {
    kind: ChallengeKind;
    title: string;
    problem: string;
    diagnosis: string;
    result: string;
    capabilities: string[];
    progress: number;
}

export const JOURNEY_CHALLENGES: JourneyChallenge[] = [
    {kind:"website",title:"Your first impression is costing you customers.",problem:"A slow, broken storefront turns customer signals away before the business can earn trust.",diagnosis:"Website experience: critical",result:"Digital experience rebuilt.",capabilities:["WEB","UI/UX","PERFORMANCE"],progress:25},
    {kind:"seo",title:"If people can't find you, they can't choose you.",problem:"Competitor signals pass by while the business remains buried at position 72.",diagnosis:"Search visibility: low",result:"Visibility unlocked.",capabilities:["SEO","CONTENT","PERFORMANCE"],progress:40},
    {kind:"application",title:"Bad experiences don't scale.",problem:"Slow screens, confused navigation and unstable systems push users away.",diagnosis:"Product experience: unstable",result:"Product experience upgraded.",capabilities:["APP DEVELOPMENT","UX","SCALABLE SYSTEMS"],progress:55},
    {kind:"automation",title:"Your manual workload is growing faster.",problem:"Messages, reporting, scheduling, support and follow-ups pile up around the business.",diagnosis:"Manual workload: critical",result:"Automation activated.",capabilities:["AI","WORKFLOWS","INTEGRATIONS"],progress:70},
    {kind:"crm",title:"Leads are coming in. But where are they going?",problem:"Website, WhatsApp, ads, calls and email signals scatter before anyone can follow up.",diagnosis:"Customer journey: fragmented",result:"Customer journey connected.",capabilities:["CRM","AUTOMATION","FOLLOW-UP"],progress:85},
    {kind:"connected",title:"Tools don't build a system. Connection does.",problem:"Website, app, CRM, marketing, AI and analytics work separately while data cannot move.",diagnosis:"System architecture: fragmented",result:"Your business. Connected.",capabilities:["SYSTEMS","INTEGRATIONS","GROWTH"],progress:100},
];
