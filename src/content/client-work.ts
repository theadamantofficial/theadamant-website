export const WORK_CATEGORIES = ["Websites", "Web apps", "Mobile apps", "UI/UX design"] as const;
export type WorkCategory = typeof WORK_CATEGORIES[number];

export type ClientWorkProject = {
    id: string;
    name: string;
    category: WorkCategory;
    label: string;
    description: string;
    href?: string;
    image?: string;
    imageAlt?: string;
    highlights: string[];
    theme: "teal" | "clay";
};

