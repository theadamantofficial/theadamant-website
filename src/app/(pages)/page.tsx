import type {Metadata} from "next";
import HomePage from "@/views/home-page";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
    title: {
        absolute: "The Adamant",
    },
    description: "Explore The Adamant's approach to UI/UX design, website development, and mobile app delivery with a stronger first impression and SEO-friendly foundations.",
    openGraph: {
        title: "The Adamant",
        description: "Explore The Adamant's approach to UI/UX design, website development, and mobile app delivery with a stronger first impression and SEO-friendly foundations.",
    },
    twitter: {
        card: "summary_large_image",
        title: "The Adamant",
        description: "Explore The Adamant's approach to UI/UX design, website development, and mobile app delivery with a stronger first impression and SEO-friendly foundations.",
    },
    ...(siteUrl
        ? {
            alternates: {
                canonical: "/",
            },
        }
        : {}),
};

export default function Home() {
    return <HomePage/>;
}
