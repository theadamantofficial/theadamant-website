export type AnalyticsDays = 7 | 30 | 90;

export interface AnalyticsConnection {
    authMode: "service-account" | "adc";
    configured: boolean;
    propertyId: string | null;
    serviceAccountEmail: string | null;
    streamId: string | null;
}

export interface WebsiteAnalytics {
    connection: AnalyticsConnection;
    report: null | {
        days: AnalyticsDays;
        startDate: string;
        endDate: string;
        timeZone: string;
        fetchedAt: string;
        limitedData: boolean;
        totals: {users: number; sessions: number; pageViews: number; engagementRate: number};
        daily: {date: string; users: number; sessions: number; pageViews: number}[];
        pages: {path: string; views: number; users: number}[];
        channels: {name: string; sessions: number}[];
        countries: {name: string; users: number}[];
        devices: {name: string; users: number}[];
        events: {name: string; count: number}[];
        realtime: {users: number; scope: "stream" | "property-web"} | null;
    };
}
