import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const raw = process.env.AUTH_URL?.trim() || process.env.NEXT_PUBLIC_STORE_URL?.trim();
  let baseUrl = "https://localhost:3000";
  if (raw) {
    try {
      const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      baseUrl = new URL(withProtocol).origin;
    } catch {
      /* keep fallback */
    }
  }
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
