import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
    productionBrowserSourceMaps: true,
    experimental: {
        optimizePackageImports: ["lucide-react", "@tabler/icons-react"],
    },
    images: {
        formats: ["image/avif", "image/webp"],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "assets.aceternity.com",
            },
        ],
    },
};

export default nextConfig;
