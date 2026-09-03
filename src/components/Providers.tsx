"use client";

import { useEffect } from "react";

/** Root providers — SessionProvider lives only under /admin to avoid storefront auth fetch errors. */
export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const hideDevtoolsChrome = () => {
      // Only strip Next.js DevTools chrome on mobile viewports
      if (window.matchMedia("(min-width: 1024px)").matches) return;
      document.querySelectorAll("nextjs-portal").forEach((el) => {
        const node = el as HTMLElement;
        node.style.setProperty("display", "none", "important");
        node.style.setProperty("visibility", "hidden", "important");
        node.style.setProperty("pointer-events", "none", "important");
        node.setAttribute("hidden", "");
      });
    };

    hideDevtoolsChrome();
    const observer = new MutationObserver(hideDevtoolsChrome);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener("resize", hideDevtoolsChrome);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", hideDevtoolsChrome);
    };
  }, []);

  return <>{children}</>;
}
