import {createHmac} from "node:crypto";
import {NextRequest} from "next/server";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

const mocks = vi.hoisted(() => ({create: vi.fn(), fetch: vi.fn(), service: vi.fn()}));
vi.mock("razorpay", () => ({default: class {
    orders = {create: mocks.create};
    payments = {fetch: mocks.fetch};
}}));
vi.mock("@/lib/crm/server-client", () => ({getCrmServiceClient: mocks.service}));

import {POST as createOrder} from "@/app/api/create-order/route";
import {POST as verifyPayment} from "@/app/api/verify-payment/route";
import {verifyRazorpaySignature} from "@/lib/crm/razorpay";

const token = "a".repeat(64);
const secret = "checkout-test-secret";
const signature = (order = "order_saved", payment = "pay_success") => createHmac("sha256", secret).update(`${order}|${payment}`).digest("hex");
const paymentPayload = () => ({token, razorpay_order_id: "order_saved", razorpay_payment_id: "pay_success", razorpay_signature: signature()});
const request = (endpoint: string, payload: unknown) => new NextRequest(`http://localhost/api/${endpoint}`, {method: "POST", body: JSON.stringify(payload)});
let row: Record<string, unknown>;
let databaseError: boolean;
const mutations = vi.fn();

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("RAZORPAY_KEY_ID", "rzp_test_mock");
    vi.stubEnv("RAZORPAY_KEY_SECRET", secret);
    databaseError = false;
    row = {
        id: "crm-order", checkout_token: token, reference_id: "AD-TEST-1", body: "Please pay",
        total_paise: 125050, currency: "INR", status: "pending", sent_at: new Date().toISOString(),
        expires_in_minutes: 60, razorpay_order_id: null, razorpay_payment_id: null,
    };
    mocks.create.mockResolvedValue({id: "order_saved", amount: 125050, currency: "INR"});
    mocks.fetch.mockResolvedValue({id: "pay_success", order_id: "order_saved", amount: 125050, currency: "INR", status: "captured"});
    mocks.service.mockReturnValue({from: () => {
        const filters: Array<[string, unknown]> = [];
        let changes: Record<string, unknown> | null = null;
        const query = {
            select: () => query,
            eq: (field: string, value: unknown) => {filters.push([field, value]); return query;},
            is: (field: string, value: unknown) => {filters.push([field, value]); return query;},
            update: (values: Record<string, unknown>) => {changes = values; return query;},
            maybeSingle: async () => {
                if (databaseError) return {data: null, error: {code: "database-failure"}};
                if (!filters.every(([field, value]) => row[field] === value)) return {data: null, error: null};
                if (changes) {mutations(changes); row = {...row, ...changes};}
                return {data: {...row}, error: null};
            },
        };
        return query;
    }});
});
afterEach(() => vi.unstubAllEnvs());

describe("WhatsApp Razorpay create-order endpoint", () => {
    it("creates an order from the stored amount and ignores browser price overrides", async () => {
        const response = await createOrder(request("create-order", {token, amount: 100, currency: "USD"}));
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({order_id: "order_saved", amount: 125050, currency: "INR"});
        expect(mocks.create).toHaveBeenCalledWith({amount: 125050, currency: "INR", receipt: "AD-TEST-1"});
        expect(row.razorpay_order_id).toBe("order_saved");
    });

    it("reuses the stored provider order on repeat checkout attempts", async () => {
        row.razorpay_order_id = "order_saved";
        expect((await createOrder(request("create-order", {token}))).status).toBe(200);
        expect(mocks.create).not.toHaveBeenCalled();
    });

    it.each([0, 99, 100.5, Number.MAX_SAFE_INTEGER + 1])("rejects an invalid stored amount %s", async (amount) => {
        row.total_paise = amount;
        expect((await createOrder(request("create-order", {token}))).status).toBe(400);
        expect(mocks.create).not.toHaveBeenCalled();
    });

    it("accepts the 100-paise minimum", async () => {
        row.total_paise = 100;
        expect((await createOrder(request("create-order", {token}))).status).toBe(200);
        expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({amount: 100}));
    });

    it.each([{}, {token: "not-a-token"}, null, []])("rejects malformed or missing tokens: %j", async (payload) => {
        expect((await createOrder(request("create-order", payload))).status).toBe(400);
        expect(mocks.create).not.toHaveBeenCalled();
    });

    it("returns 404 for an unknown link without contacting Razorpay", async () => {
        expect((await createOrder(request("create-order", {token: "b".repeat(64)}))).status).toBe(404);
        expect(mocks.create).not.toHaveBeenCalled();
    });

    it.each(["draft", "sending", "processing", "completed", "canceled"])("does not charge a %s request", async (status) => {
        row.status = status;
        expect((await createOrder(request("create-order", {token}))).status).toBe(409);
        expect(mocks.create).not.toHaveBeenCalled();
    });

    it("rejects an expired request", async () => {
        row.sent_at = "2020-01-01T00:00:00Z";
        expect((await createOrder(request("create-order", {token}))).status).toBe(410);
        expect(mocks.create).not.toHaveBeenCalled();
    });

    it.each([[401, 401], [400, 500], [502, 500]])("maps provider status %s to %s without leaking provider details", async (statusCode, expected) => {
        mocks.create.mockRejectedValue({statusCode, error: {description: "private-provider-details"}});
        const response = await createOrder(request("create-order", {token}));
        expect(response.status).toBe(expected);
        expect(JSON.stringify(await response.json())).not.toContain("private-provider-details");
        expect(row.razorpay_order_id).toBeNull();
    });

    it("fails safely when the server is not configured", async () => {
        vi.stubEnv("RAZORPAY_KEY_SECRET", "");
        expect((await createOrder(request("create-order", {token}))).status).toBe(503);
        expect(mocks.create).not.toHaveBeenCalled();
    });
});

describe("WhatsApp Razorpay signature verification", () => {
    beforeEach(() => {row.razorpay_order_id = "order_saved";});

    it("matches HMAC-SHA256 and rejects malformed, forged and changed-payment signatures", () => {
        expect(verifyRazorpaySignature("order_saved", "pay_success", signature())).toBe(true);
        expect(verifyRazorpaySignature("order_saved", "pay_other", signature())).toBe(false);
        for (const forged of ["", "xyz", "a".repeat(64), "a".repeat(63)]) {
            expect(verifyRazorpaySignature("order_saved", "pay_success", forged)).toBe(false);
        }
    });

    it("records a captured, verified payment in existing CRM history", async () => {
        const response = await verifyPayment(request("verify-payment", paymentPayload()));
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({success: true});
        expect(mutations).toHaveBeenCalledWith(expect.objectContaining({status: "processing", razorpay_payment_id: "pay_success", payment_confirmed_at: expect.any(String)}));
    });

    it.each(["razorpay_payment_id", "razorpay_order_id", "razorpay_signature", "token"])("rejects a missing %s without marking paid", async (field) => {
        const payload: Record<string, unknown> = paymentPayload();
        delete payload[field];
        expect((await verifyPayment(request("verify-payment", payload))).status).toBe(400);
        expect(mutations).not.toHaveBeenCalled();
        expect(mocks.fetch).not.toHaveBeenCalled();
    });

    it("rejects a valid signature for a different server order", async () => {
        const payload = {...paymentPayload(), razorpay_order_id: "order_other", razorpay_signature: signature("order_other")};
        expect((await verifyPayment(request("verify-payment", payload))).status).toBe(400);
        expect(mutations).not.toHaveBeenCalled();
        expect(mocks.fetch).not.toHaveBeenCalled();
    });

    it("rejects a forged signature before contacting Razorpay", async () => {
        expect((await verifyPayment(request("verify-payment", {...paymentPayload(), razorpay_signature: "a".repeat(64)}))).status).toBe(400);
        expect(mutations).not.toHaveBeenCalled();
        expect(mocks.fetch).not.toHaveBeenCalled();
    });

    it.each([{order_id: "order_other"}, {amount: 100}, {currency: "USD"}])("rejects payment details that do not match the CRM order: %j", async (change) => {
        mocks.fetch.mockResolvedValue({order_id: "order_saved", amount: 125050, currency: "INR", status: "captured", ...change});
        expect((await verifyPayment(request("verify-payment", paymentPayload()))).status).toBe(400);
        expect(mutations).not.toHaveBeenCalled();
    });

    it.each(["authorized", "failed", "refunded"])("does not mark a %s payment paid", async (status) => {
        mocks.fetch.mockResolvedValue({order_id: "order_saved", amount: 125050, currency: "INR", status});
        expect((await verifyPayment(request("verify-payment", paymentPayload()))).status).toBe(409);
        expect(mutations).not.toHaveBeenCalled();
    });

    it("accepts callback retries without changing confirmation timestamps", async () => {
        await verifyPayment(request("verify-payment", paymentPayload()));
        const confirmedAt = row.payment_confirmed_at;
        expect((await verifyPayment(request("verify-payment", paymentPayload()))).status).toBe(200);
        expect(row.payment_confirmed_at).toBe(confirmedAt);
        expect(mutations).toHaveBeenCalledTimes(1);
        expect(mocks.fetch).toHaveBeenCalledTimes(1);
    });

    it("allows an already-made payment to be verified after link expiry", async () => {
        row.sent_at = "2020-01-01T00:00:00Z";
        expect((await verifyPayment(request("verify-payment", paymentPayload()))).status).toBe(200);
    });

    it("does not change a canceled order during payment verification", async () => {
        row.status = "canceled";
        expect((await verifyPayment(request("verify-payment", paymentPayload()))).status).toBe(409);
        expect(mutations).not.toHaveBeenCalled();
    });

    it("does not mark paid on provider authentication failure", async () => {
        mocks.fetch.mockRejectedValue({statusCode: 401});
        expect((await verifyPayment(request("verify-payment", paymentPayload()))).status).toBe(401);
        expect(mutations).not.toHaveBeenCalled();
    });

    it("does not report success when the database is unavailable", async () => {
        databaseError = true;
        expect((await verifyPayment(request("verify-payment", paymentPayload()))).status).toBe(500);
        expect(mutations).not.toHaveBeenCalled();
    });
});
