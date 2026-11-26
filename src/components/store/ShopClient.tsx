"use client";

import { useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/store/ProductCard";
import ShopSidebar, {
  ShopToolbarControls,
  type ShopCurrentFilters,
} from "@/components/store/ShopSidebar";
import Pagination from "@/components/store/Pagination";
import type { ColorFacet, Product } from "@/types";

interface ShopClientProps {
  categories: Array<{ slug: string; name: string }>;
  colors: ColorFacet[];
  sizeCounts: Record<string, number>;
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  current: ShopCurrentFilters;
  showRatings: boolean;
}

export default function ShopClient({
  categories,
  colors,
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
      current.color ||
      current.fabric ||
      current.fit ||
      current.activity ||
      current.minPrice ||
      current.maxPrice ||
      current.onSale ||
      current.inStock
  );

  return (
    <div className="shop-layout shop-layout-premium">
      <ShopSidebar
        categories={categories}
        colors={colors}
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
            color: current.color,
            fabric: current.fabric,
            fit: current.fit,
            activity: current.activity,
            minPrice: current.minPrice,
            maxPrice: current.maxPrice,
            sort: current.sort,
            onSale: current.onSale,
            inStock: current.inStock,
          }}
        />
      </div>
    </div>
  );
}
