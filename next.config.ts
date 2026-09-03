import type { NextConfig } from "next";
import path from "path";

function resolveCdnHostname(): string {
  const raw = process.env.NEXT_PUBLIC_CDN_BASE_URL?.trim();
  if (!raw) return "images.unsplash.com";
  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(withProtocol).hostname;
  } catch {
    return "images.unsplash.com";
  }
}

const cdnHostname = resolveCdnHostname();

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: cdnHostname, pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn.shopify.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
