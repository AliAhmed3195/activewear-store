"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/store/ProductCard";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

type GenderTab = "WOMEN" | "MEN";

interface GenderProductTabsProps {
  title: string;
  kicker: string;
  subtitle: string;
  products: Product[];
  viewAllHref: string;
  viewAllLabel?: string;
}

export default function GenderProductTabs({
  title,
  kicker,
  subtitle,
  products,
  viewAllHref,
  viewAllLabel = "View all",
}: GenderProductTabsProps) {
  const [tab, setTab] = useState<GenderTab>("MEN");

  const filtered = useMemo(() => {
    const match = products.filter((p) => p.gender === tab);
    if (match.length > 0) return match.slice(0, 8);
    // Fallback: unisex + opposite if thin catalog
    const fallback = products.filter((p) => p.gender === "UNISEX" || p.gender === tab);
    return (fallback.length ? fallback : products).slice(0, 8);
  }, [products, tab]);

  return (
    <section className="section-pad peak-sec-gender-tabs">
      <div className="container-luxury">
        <div className="peak-section-head peak-section-head-center">
          <div>
            <p className="peak-section-kicker">{kicker}</p>
            <h2 className="peak-section-title section-title text-pearl">{title}</h2>
            <p className="peak-section-sub font-ui">{subtitle}</p>
            <div className="gender-toggle gender-toggle-premium" role="tablist" aria-label={`${title} gender filter`}>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "WOMEN"}
                className={cn("gender-toggle-btn", tab === "WOMEN" && "is-active")}
                onClick={() => setTab("WOMEN")}
              >
                Women
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "MEN"}
                className={cn("gender-toggle-btn", tab === "MEN" && "is-active")}
                onClick={() => setTab("MEN")}
              >
                Men
              </button>
            </div>
          </div>
        </div>

        <div className="product-grid product-grid-premium">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>

        <div className="gender-tabs-footer">
          <Link href={viewAllHref} className="peak-text-link">
            {viewAllLabel} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
