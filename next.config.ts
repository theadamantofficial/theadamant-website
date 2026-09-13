import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
    htmlLimitedBots: /.*/,
    productionBrowserSourceMaps: true,
    outputFileTracingIncludes: {
        "/api/admin/prospects/email": ["./private-assets/Adamant_Technologies_Client_Proposal.pdf"],
    },
    experimental: {
        optimizePackageImports: ["lucide-react", "@tabler/icons-react"],
    },
    images: {
        formats: ["image/avif", "image/webp"],
        qualities: [75, 90],
        // No homepage slot needs a 3840px source. Keeping the ladder bounded also
        // prevents broad `sizes` values from producing oversized derivatives.
        deviceSizes: [360, 480, 640, 768, 1024, 1280, 1600, 1920],
        imageSizes: [32, 40, 44, 64, 96, 128, 160, 220, 260, 320, 600],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "assets.aceternity.com",
            },
        ],
    },
};

export default nextConfig;
