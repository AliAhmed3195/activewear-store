"use client";

import { useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/store/ProductCard";
import ShopSidebar, { ShopToolbarControls } from "@/components/store/ShopSidebar";
import Pagination from "@/components/store/Pagination";
import type { Product } from "@/types";

interface ShopClientProps {
  categories: Array<{ slug: string; name: string }>;
  sizeCounts: Record<string, number>;
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  current: {
    q?: string;
    category?: string;
    gender?: string;
    size?: string;
    sort?: string;
    onSale?: string;
    inStock?: string;
  };
  showRatings: boolean;
}

export default function ShopClient({
  categories,
  sizeCounts,
  products,
  total,
  page,
  totalPages,
  current,
  showRatings,
}: ShopClientProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const hasFilters = Boolean(
    current.q ||
      current.category ||
      current.gender ||
      current.size ||
      current.onSale ||
      current.inStock
  );

  return (
    <div className="shop-layout shop-layout-premium">
      <ShopSidebar
        categories={categories}
        sizeCounts={sizeCounts}
        current={current}
        mobileOpen={filtersOpen}
        onMobileClose={() => setFiltersOpen(false)}
        hideSort
      />

      <div className="shop-results">
        <ShopToolbarControls
          current={current}
          total={total}
          onOpenFilters={() => setFiltersOpen(true)}
        />

        {products.length === 0 ? (
          <div className="shop-empty">
            <p className="font-display text-2xl text-pearl">No products found</p>
            <p className="font-ui text-sm text-pearl-muted mt-2">
              {hasFilters
                ? "Try clearing filters or broadening your search."
                : "Nothing in this collection yet."}
            </p>
            <div className="shop-empty-actions">
              {hasFilters && (
                <Link href="/shop" className="btn-copper mt-6 inline-flex">
                  Clear all filters
                </Link>
              )}
              <Link href="/shop" className="btn-outline mt-6 inline-flex">
                View all
              </Link>
            </div>
          </div>
        ) : (
          <div className="product-row product-row-premium">
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={i < 4}
                showRatings={showRatings}
              />
            ))}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          searchParams={{
            q: current.q,
            category: current.category,
            gender: current.gender,
            size: current.size,
            sort: current.sort,
            onSale: current.onSale,
            inStock: current.inStock,
          }}
        />
      </div>
    </div>
  );
}
