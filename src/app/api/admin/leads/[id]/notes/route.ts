import {NextRequest, NextResponse} from "next/server";
import {crmErrorResponse, CrmApiError, getCrmRequestContext} from "@/lib/crm/auth";
import {PROFILE_SUMMARY_COLUMNS} from "@/lib/crm/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, context: {params: Promise<{id: string}>}) {
    try {
        const {client, actor} = await getCrmRequestContext(request);
        const {id} = await context.params;
        const payload = await request.json() as {note?: string};
        const note = payload.note?.trim() || "";
        if (!note) throw new CrmApiError("Write a note before saving.");
        const {data, error} = await client.from("lead_notes").insert({lead_id: id, created_by: actor.id, note: note.slice(0, 10000)}).select(`id,lead_id,created_by,note,created_at,updated_at,author:profiles!lead_notes_created_by_fkey(${PROFILE_SUMMARY_COLUMNS})`).single();
        if (error) throw new CrmApiError(error.message, 400);
        return NextResponse.json({note: data}, {status: 201});
    } catch (error) {
        const {message, status} = crmErrorResponse(error);
        return NextResponse.json({error: message}, {status});
    }
}
