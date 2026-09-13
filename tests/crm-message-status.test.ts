import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {describe, expect, it} from "vitest";
import {WhatsAppMessageStatus} from "@/features/crm/whatsapp/message-status";

describe("WhatsApp message delivery indicators", () => {
    it("shows a failed label and warning icon without a misleading sent checkmark", () => {
        const html = renderToStaticMarkup(createElement(WhatsAppMessageStatus, {status: "failed"}));
        expect(html).toContain("Failed");
        expect(html).toContain("lucide-circle-alert");
        expect(html).not.toContain("lucide-check");
        expect(html).not.toContain(">Sent<");
    });

    it("distinguishes accepted, delivered and read messages", () => {
        const sent = renderToStaticMarkup(createElement(WhatsAppMessageStatus, {status: "sent"}));
        const delivered = renderToStaticMarkup(createElement(WhatsAppMessageStatus, {status: "delivered"}));
        const read = renderToStaticMarkup(createElement(WhatsAppMessageStatus, {status: "read"}));
        expect(sent).toContain(">Sent</span>");
        expect(sent).not.toContain("lucide-check-check");
        expect(delivered).toContain("lucide-check-check");
        expect(delivered).toContain(">Delivered</span>");
        expect(read).toContain(">Read</span>");
        expect(read).toContain("text-sky-200");
    });
});
