"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { IconCheck, IconSearch } from "@/components/ui/icons";
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

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
] as const;

export default function ShopSidebar({ categories, sizeCounts, current }: ShopSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(current.q ?? "");

  useEffect(() => {
    setSearch(current.q ?? "");
  }, [current.q]);

  const hasFilters = useMemo(
    () =>
      Boolean(
        current.q ||
          current.category ||
          current.gender ||
          current.size ||
          (current.sort && current.sort !== "newest")
      ),
    [current]
  );

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

  const clearAll = () => {
    setSearch("");
    startTransition(() => router.push("/shop"));
  };

  return (
    <aside className={cn("shop-sidebar", isPending && "shop-sidebar--pending")} aria-label="Shop filters">
      <div className="shop-sidebar-panel">
        <header className="shop-sidebar-head">
          <div>
            <p className="shop-sidebar-kicker font-ui">Browse</p>
            <h2 className="shop-sidebar-title font-display">Filters</h2>
          </div>
          {hasFilters && (
            <button type="button" className="shop-sidebar-clear font-ui" onClick={clearAll}>
              Clear all
            </button>
          )}
        </header>

        <div className="shop-filter-section">
          <h3 className="shop-filter-heading font-ui">Search</h3>
          <form
            className="shop-filter-search"
            onSubmit={(e) => {
              e.preventDefault();
              const q = search.trim();
              updateParams({ q: q || undefined });
            }}
          >
            <span className="shop-filter-search-icon" aria-hidden="true">
              <IconSearch size={18} />
            </span>
            <input
              name="q"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pieces…"
              className="shop-search-input shop-filter-search-input"
              aria-label="Search products"
            />
          </form>
        </div>

        <div className="shop-filter-section">
          <h3 className="shop-filter-heading font-ui">Collection</h3>
          <nav className="shop-filter-nav" aria-label="Collections">
            <button
              type="button"
              className={cn("filter-link shop-filter-link", !current.category && "active")}
              onClick={() => updateParams({ category: undefined })}
            >
              <span>All Collections</span>
              {!current.category && <IconCheck size={14} className="shop-filter-check" />}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                className={cn(
                  "filter-link shop-filter-link",
                  current.category === cat.slug && "active"
                )}
                onClick={() => updateParams({ category: cat.slug })}
              >
                <span>{cat.name}</span>
                {current.category === cat.slug && (
                  <IconCheck size={14} className="shop-filter-check" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="shop-filter-section">
          <h3 className="shop-filter-heading font-ui">Gender</h3>
          <div className="shop-filter-pills" role="group" aria-label="Gender">
            <button
              type="button"
              className={cn("shop-filter-pill", !current.gender && "active")}
              onClick={() => updateParams({ gender: undefined })}
            >
              All
            </button>
            {GENDERS.map((g) => (
              <button
                key={g.value}
                type="button"
                className={cn("shop-filter-pill", current.gender === g.value && "active")}
                onClick={() => updateParams({ gender: g.value })}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="shop-filter-section">
          <h3 className="shop-filter-heading font-ui">Size</h3>
          <div className="shop-filter-sizes" role="group" aria-label="Size">
            <button
              type="button"
              className={cn("size-chip shop-size-chip", !current.size && "active")}
              onClick={() => updateParams({ size: undefined })}
            >
              All
            </button>
            {SIZES.map((size) => {
              const count = sizeCounts?.[size];
              const disabled = count === 0;
              return (
                <button
                  key={size}
                  type="button"
                  className={cn(
                    "size-chip shop-size-chip",
                    current.size === size && "active",
                    disabled && "is-disabled"
                  )}
                  disabled={disabled}
                  onClick={() => updateParams({ size: current.size === size ? undefined : size })}
                >
                  <span>{size}</span>
                  {count != null && count > 0 && (
                    <span className="shop-size-chip-count" aria-hidden="true">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="shop-filter-section shop-filter-section--last">
          <h3 className="shop-filter-heading font-ui">Sort by</h3>
          <div className="shop-filter-sort" role="radiogroup" aria-label="Sort products">
            {SORT_OPTIONS.map((opt) => {
              const active = (current.sort ?? "newest") === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={cn("shop-filter-sort-option", active && "active")}
                  onClick={() => updateParams({ sort: opt.value })}
                >
                  <span className="shop-filter-sort-dot" aria-hidden="true" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
