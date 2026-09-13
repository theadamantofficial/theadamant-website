import {afterEach, describe, expect, it, vi} from "vitest";
import {uploadProposalPdf} from "@/features/crm/whatsapp/upload-proposal-pdf";

afterEach(() => vi.unstubAllGlobals());
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {status, headers: {"Content-Type": "application/json"}});

describe("client proposal PDF upload", () => {
    it("uploads a small PDF directly to the CRM without requiring a storage bucket", async () => {
        const file = new File(["%PDF-1.7\nproposal"], "Client Proposal.pdf", {type: "application/pdf"});
        const fetcher = vi.fn().mockResolvedValue(json({mediaId: "media-1", filename: file.name}));
        vi.stubGlobal("fetch", fetcher);
        expect(await uploadProposalPdf(file)).toEqual({mediaId: "media-1", filename: file.name});
        expect(fetcher).toHaveBeenCalledOnce();
        const [url, options] = fetcher.mock.calls[0];
        expect(url).toBe("/api/admin/whatsapp/templates/media");
        expect(options.method).toBe("POST");
        expect(options.body.get("file").size).toBe(file.size);
        expect(options.headers["Content-Type"]).toBeUndefined();
    });

    it("uses PUT for large signed storage uploads and then completes the Meta upload", async () => {
        const file = new File([new Uint8Array(5 * 1024 * 1024)], "proposal.pdf", {type: "application/pdf"});
        const fetcher = vi.fn()
            .mockResolvedValueOnce(json({path: "actor/proposal.pdf", signedUrl: "https://storage.example/signed"}))
            .mockResolvedValueOnce(json({Key: "actor/proposal.pdf"}))
            .mockResolvedValueOnce(json({mediaId: "media-2", filename: file.name}));
        vi.stubGlobal("fetch", fetcher);
        expect((await uploadProposalPdf(file)).mediaId).toBe("media-2");
        expect(fetcher.mock.calls[1][0]).toBe("https://storage.example/signed");
        expect(fetcher.mock.calls[1][1].method).toBe("PUT");
        expect(fetcher.mock.calls[1][1].body.get("").size).toBe(file.size);
        expect(JSON.parse(fetcher.mock.calls[2][1].body)).toEqual({action: "complete", path: "actor/proposal.pdf", filename: file.name});
    });

    it("reports the actual storage error and does not complete a failed upload", async () => {
        const file = new File([new Uint8Array(5 * 1024 * 1024)], "proposal.pdf", {type: "application/pdf"});
        const fetcher = vi.fn()
            .mockResolvedValueOnce(json({path: "actor/proposal.pdf", signedUrl: "https://storage.example/signed"}))
            .mockResolvedValueOnce(json({message: "Bucket not found"}, 404));
        vi.stubGlobal("fetch", fetcher);
        await expect(uploadProposalPdf(file)).rejects.toThrow("PDF storage upload failed (404): Bucket not found");
        expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it("rejects oversized and empty PDFs before making an upload request", async () => {
        const fetcher = vi.fn();
        vi.stubGlobal("fetch", fetcher);
        for (const content of [new Uint8Array(), new Uint8Array(10 * 1024 * 1024 + 1)]) {
            await expect(uploadProposalPdf(new File([content], "proposal.pdf", {type: "application/pdf"}))).rejects.toThrow("up to 10 MB");
        }
        expect(fetcher).not.toHaveBeenCalled();
    });
});
