import {describe, expect, it} from "vitest";
import {parseTestimonial} from "@/lib/testimonials";

const input = {
    name: "  Alex Taylor  ", email: " Alex@Example.com ", company: " Example Ltd ",
    rating: 4, message: " Adamant helped us launch our new website. ", consent: true,
};

describe("testimonial validation", () => {
    it("normalizes submission details without accepting a client-supplied status", () => {
        expect(parseTestimonial({...input, status: "approved"})).toEqual({
            name: "Alex Taylor", email: "alex@example.com", company: "Example Ltd",
            rating: 4, message: "Adamant helped us launch our new website.",
        });
    });

    it("allows an optional company", () => {
        expect(parseTestimonial({...input, company: undefined}).company).toBe("");
    });

    it.each([null, [], "test", {...input, name: 123}, {...input, email: "invalid"},
        {...input, rating: 0}, {...input, rating: 6}, {...input, rating: 4.5}, {...input, rating: "5"},
        {...input, message: "Too short"}, {...input, message: "a".repeat(1501)},
        {...input, company: "a".repeat(101)}, {...input, consent: false}, {...input, consent: "true"},
        {...input, website: "spam.example"},
    ])("rejects invalid details or missing consent: %j", (payload) => {
        expect(() => parseTestimonial(payload)).toThrow();
    });
});
