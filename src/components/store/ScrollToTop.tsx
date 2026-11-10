"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/** Always open routes at the top (product pages, shop filters, etc.). */
export default function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Hash links keep native jump behavior
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, searchParams]);

  return null;
}
