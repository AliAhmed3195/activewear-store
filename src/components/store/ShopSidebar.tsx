"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { cn } from "@/lib/utils";

interface CategoryOption {
  slug: string;
  name: string;
}

interface ShopSidebarProps {
  categories: CategoryOption[];
  sizeCounts?: Record<string, number>;
  current: {
    q?: string;
    category?: string;
    gender?: string;
    size?: string;
    sort?: string;
  };
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const GENDERS = [
  { value: "MEN", label: "Men" },
  { value: "WOMEN", label: "Women" },
  { value: "UNISEX", label: "Unisex" },
];

export default function ShopSidebar({ categories, current }: ShopSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      params.delete("page");
      startTransition(() => router.push(`/shop?${params.toString()}`));
    },
    [router, searchParams]
  );

  return (
    <aside className={cn("shop-sidebar", isPending && "opacity-60")}>
      <div className="shop-sidebar-panel">
      <div className="filter-group">
        <h4>Search</h4>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            updateParams({ q: (fd.get("q") as string) || undefined });
          }}
        >
          <input
            name="q"
            type="search"
            defaultValue={current.q ?? ""}
            placeholder="Search pieces…"
            className="shop-search-input"
            aria-label="Search products"
          />
        </form>
      </div>

      <div className="filter-group">
        <h4>Collection</h4>
        <button
          type="button"
          className={cn("filter-link", !current.category && "active")}
          onClick={() => updateParams({ category: undefined })}
        >
          All Collections
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            className={cn("filter-link", current.category === cat.slug && "active")}
            onClick={() => updateParams({ category: cat.slug })}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="filter-group">
        <h4>Gender</h4>
        <button
          type="button"
          className={cn("filter-link", !current.gender && "active")}
          onClick={() => updateParams({ gender: undefined })}
        >
          All
        </button>
        {GENDERS.map((g) => (
          <button
            key={g.value}
            type="button"
            className={cn("filter-link", current.gender === g.value && "active")}
            onClick={() => updateParams({ gender: g.value })}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="filter-group">
        <h4>Size</h4>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={cn("size-chip", !current.size && "active")}
            onClick={() => updateParams({ size: undefined })}
          >
            All
          </button>
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              className={cn("size-chip", current.size === size && "active")}
              onClick={() => updateParams({ size: current.size === size ? undefined : size })}
            >
              <span>{size}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h4>Sort By</h4>
        {[
          { value: "newest", label: "Newest" },
          { value: "price-asc", label: "Price: Low to High" },
          { value: "price-desc", label: "Price: High to Low" },
          { value: "rating", label: "Top Rated" },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={cn(
              "filter-link",
              (current.sort ?? "newest") === opt.value && "active"
            )}
            onClick={() => updateParams({ sort: opt.value })}
          >
            {opt.label}
          </button>
        ))}
      </div>
      </div>
    </aside>
  );
}
