import {describe, expect, it} from "vitest";
import {parseProject} from "@/lib/projects";

const project = {
    name: " Example Website ", category: "Websites", label: " Client project ",
    description: " A responsive website for a local business. ", href: "https://example.com",
    image: "", imageAlt: "", highlights: ["Responsive design", "Responsive design"],
    theme: "teal", status: "draft", sort_order: 2,
};

describe("project validation", () => {
    it("normalizes project details and strips fields that admins cannot set", () => {
        expect(parseProject({...project, created_by: "someone-else"})).toEqual({
            name: "Example Website", category: "Websites", label: "Client project",
            description: "A responsive website for a local business.", href: "https://example.com",
            image: "", image_alt: "", highlights: ["Responsive design"], theme: "teal", status: "draft", sort_order: 2,
        });
    });
    it("accepts screenshots with alternative descriptions", () => {
        expect(parseProject({...project, image: "https://cdn.example.com/image.png", imageAlt: "Website homepage"}).image_alt).toBe("Website homepage");
    });
    it("requires a real screenshot when publishing while allowing image-free drafts", () => {
        expect(() => parseProject({...project, status: "published"})).toThrow("Add a real project screenshot before publishing.");
        expect(parseProject(project).status).toBe("draft");
        expect(parseProject({...project, status: "published", image: "/images/work/bakery-shop.png", imageAlt: "Bakery homepage"}).status).toBe("published");
    });
    it.each([
        {href: "javascript:alert(1)"}, {href: "http://example.com"}, {href: "https://user:secret@example.com"},
        {image: "//example.com/image.png"}, {image: "https://example.com/image.png", imageAlt: ""},
        {category: "Unknown"}, {theme: "Unknown"}, {status: "Unknown"}, {sort_order: -1}, {sort_order: 1.5},
        {highlights: [123]}, {highlights: Array(9).fill("feature")}, {highlights: ["a".repeat(61)]},
        {name: "a"}, {description: "Too short"},
    ])("rejects invalid project data: %j", (changes) => {
        expect(() => parseProject({...project, ...changes})).toThrow();
    });
});
