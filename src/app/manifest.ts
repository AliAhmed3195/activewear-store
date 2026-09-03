import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Elvene Noir",
    short_name: "Elvene Noir",
    description: "Luxury lingerie crafted for the midnight hour.",
    start_url: "/",
    display: "standalone",
    background_color: "#020100",
    theme_color: "#020100",
  };
}
