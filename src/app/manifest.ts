import type { MetadataRoute } from "next";
import { storeName, storeTagline } from "@/lib/utils";

export default function manifest(): MetadataRoute.Manifest {
  const name = storeName();
  return {
    name,
    short_name: name,
    description: storeTagline(),
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#111827",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
  };
}
