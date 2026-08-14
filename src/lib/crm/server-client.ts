import {createClient, type SupabaseClient} from "@supabase/supabase-js";
import {CrmApiError} from "@/lib/crm/errors";

let cachedClient: SupabaseClient | null = null;
let cachedCredentials = "";

export function getCrmServiceClient() {
    const url = normalize(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
    const secretKey = normalize(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (!url || !secretKey) {
        throw new CrmApiError("The server-side Supabase connection is not configured.", 503);
    }

    const credentials = `${url}:${secretKey}`;
    if (!cachedClient || cachedCredentials !== credentials) {
        cachedClient = createClient(url, secretKey, {
            auth: {autoRefreshToken: false, persistSession: false},
        });
        cachedCredentials = credentials;
    }
    return cachedClient;
}

function normalize(value?: string) {
    return value?.trim().replace(/^['"]|['"]$/g, "") || "";
}
