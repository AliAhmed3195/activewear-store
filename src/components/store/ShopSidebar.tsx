"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { IconClose } from "@/components/ui/icons";
import { FABRIC_OPTIONS } from "@/lib/fabric-catalog";
import { ACTIVITY_OPTIONS, FIT_OPTIONS } from "@/lib/product-attrs";
import type { ColorFacet } from "@/types";

interface CategoryOption {
  slug: string;
  name: string;
}

export type ShopCurrentFilters = {
  q?: string;
  category?: string;
  gender?: string;
  size?: string;
  color?: string;
  fabric?: string;
  fit?: string;
  activity?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  onSale?: string;
  inStock?: string;
};

interface ShopSidebarProps {
  categories: CategoryOption[];
  colors?: ColorFacet[];
  sizeCounts?: Record<string, number>;
  current: ShopCurrentFilters;
  /** Controlled mobile drawer */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  /** Hide sort group when toolbar owns sort */
  hideSort?: boolean;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const GENDERS = [
  { value: "MEN", label: "Men" },
  { value: "WOMEN", label: "Women" },
  { value: "KIDS", label: "Kids" },
  { value: "UNISEX", label: "Unisex" },
];

function hasAnyFilter(current: ShopCurrentFilters) {
  return Boolean(
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
      current.inStock ||
      (current.sort && current.sort !== "newest")
  );
}

export default function ShopSidebar({
  categories,
  colors = [],
  sizeCounts,
  current,
  mobileOpen = false,
  onMobileClose,
  hideSort = false,
}: ShopSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(mobileOpen);
  const [minPrice, setMinPrice] = useState(current.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(current.maxPrice ?? "");

  useEffect(() => {
    setOpen(mobileOpen);
  }, [mobileOpen]);

  useEffect(() => {
    setMinPrice(current.minPrice ?? "");
    setMaxPrice(current.maxPrice ?? "");
  }, [current.minPrice, current.maxPrice]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        onMobileClose?.();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onMobileClose]);

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

  const applyPrice = () => {
    updateParams({
      minPrice: minPrice.trim() || undefined,
      maxPrice: maxPrice.trim() || undefined,
    });
  };

  const clearAll = () => {
    startTransition(() => router.push("/shop"));
    setOpen(false);
    onMobileClose?.();
  };

  const closeMobile = () => {
    setOpen(false);
    onMobileClose?.();
  };

  const panel = (
    <div className={cn("shop-sidebar-panel", isPending && "opacity-60")}>
      <div className="shop-filter-head">
        <h3>Filters</h3>
        {hasAnyFilter(current) && (
          <button type="button" className="shop-clear-all" onClick={clearAll}>
            Clear all
          </button>
        )}
        <button
          type="button"
          className="shop-filter-close icon-btn"
          onClick={closeMobile}
          aria-label="Close filters"
        >
          <IconClose size={18} />
        </button>
      </div>

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
            placeholder="Search tees, sets, kits…"
            className="shop-search-input"
            aria-label="Search products"
          />
        </form>
      </div>

      <div className="filter-group">
        <h4>Availability</h4>
        <div className="filter-pill-row">
          <button
            type="button"
            className={cn("filter-pill", current.inStock === "1" && "active")}
            onClick={() =>
              updateParams({ inStock: current.inStock === "1" ? undefined : "1" })
            }
          >
            In stock
          </button>
          <button
            type="button"
            className={cn("filter-pill", current.onSale === "1" && "active")}
            onClick={() =>
              updateParams({ onSale: current.onSale === "1" ? undefined : "1" })
            }
          >
            On sale
          </button>
        </div>
      </div>

      <div className="filter-group">
        <h4>Shop for</h4>
        <div className="filter-pill-row">
          <button
            type="button"
            className={cn("filter-pill", !current.gender && "active")}
            onClick={() => updateParams({ gender: undefined })}
          >
            All
          </button>
          {GENDERS.map((g) => (
            <button
              key={g.value}
              type="button"
              className={cn("filter-pill", current.gender === g.value && "active")}
              onClick={() => updateParams({ gender: g.value })}
            >
              {g.label}
            </button>
          ))}
        </div>
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

      {colors.length > 0 && (
        <div className="filter-group">
          <h4>Color</h4>
          <div className="filter-pill-row filter-color-row">
            <button
              type="button"
              className={cn("filter-pill", !current.color && "active")}
              onClick={() => updateParams({ color: undefined })}
            >
              All
            </button>
            {colors.map((c) => (
              <button
                key={c.slug}
                type="button"
                className={cn("filter-pill filter-color-pill", current.color === c.slug && "active")}
                onClick={() =>
                  updateParams({ color: current.color === c.slug ? undefined : c.slug })
                }
                title={c.name}
              >
                <span
                  className="filter-color-swatch"
                  style={{ backgroundColor: c.hex || "#666" }}
                  aria-hidden
                />
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="filter-group">
        <h4>Price (PKR)</h4>
        <div className="filter-price-row">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Min"
            className="shop-search-input"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            aria-label="Minimum price"
          />
          <span aria-hidden>—</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Max"
            className="shop-search-input"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            aria-label="Maximum price"
          />
          <button type="button" className="filter-pill" onClick={applyPrice}>
            Apply
          </button>
        </div>
      </div>

      <div className="filter-group">
        <h4>Fabric</h4>
        <button
          type="button"
          className={cn("filter-link", !current.fabric && "active")}
          onClick={() => updateParams({ fabric: undefined })}
        >
          All fabrics
        </button>
        {FABRIC_OPTIONS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={cn("filter-link", current.fabric === f.id && "active")}
            onClick={() =>
              updateParams({ fabric: current.fabric === f.id ? undefined : f.id })
            }
          >
            {f.name}
          </button>
        ))}
      </div>

      <div className="filter-group">
        <h4>Fit</h4>
        <div className="filter-pill-row">
          <button
            type="button"
            className={cn("filter-pill", !current.fit && "active")}
            onClick={() => updateParams({ fit: undefined })}
          >
            All
          </button>
          {FIT_OPTIONS.map((f) => (
            <button
              key={f}
              type="button"
              className={cn("filter-pill", current.fit === f && "active")}
              onClick={() => updateParams({ fit: current.fit === f ? undefined : f })}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h4>Activity</h4>
        <div className="filter-pill-row">
          <button
            type="button"
            className={cn("filter-pill", !current.activity && "active")}
            onClick={() => updateParams({ activity: undefined })}
          >
            All
          </button>
          {ACTIVITY_OPTIONS.map((a) => (
            <button
              key={a}
              type="button"
              className={cn("filter-pill", current.activity === a && "active")}
              onClick={() =>
                updateParams({ activity: current.activity === a ? undefined : a })
              }
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h4>Size</h4>
        <div className="filter-pill-row">
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
              {sizeCounts?.[size] != null && (
                <span className="size-chip-count">{sizeCounts[size]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {!hideSort && (
        <div className="filter-group">
          <h4>Sort</h4>
          {[
            { value: "newest", label: "Newest" },
            { value: "price-asc", label: "Price: Low to High" },
            { value: "price-desc", label: "Price: High to Low" },
            { value: "rating", label: "Best Sellers" },
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
      )}
    </div>
  );

  return (
    <>
      <aside className="shop-sidebar shop-sidebar-premium shop-sidebar-desktop">{panel}</aside>

      {open && (
        <div className="shop-filter-drawer shop-filter-sheet" role="dialog" aria-modal="true" aria-label="Filters">
          <button
            type="button"
            className="shop-filter-backdrop"
            aria-label="Close filters"
            onClick={closeMobile}
          />
          <div className="shop-filter-drawer-panel">
            <div className="shop-filter-sheet-handle" aria-hidden="true" />
            {panel}
            <button type="button" className="shop-filter-sheet-apply btn-pill btn-pill-dark" onClick={closeMobile}>
              Show results
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function ShopToolbarControls({
  current,
  total,
  onOpenFilters,
}: {
  current: ShopCurrentFilters;
  total: number;
  onOpenFilters: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateSort = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sort === "newest") params.delete("sort");
    else params.set("sort", sort);
    params.delete("page");
    startTransition(() => router.push(`/shop?${params.toString()}`));
  };

  return (
    <div className={cn("shop-toolbar shop-toolbar-premium", isPending && "opacity-60")}>
      <div className="shop-toolbar-left">
        <button type="button" className="shop-filter-open" onClick={onOpenFilters}>
          Filters{hasAnyFilter(current) ? " ·" : ""}
        </button>
        <p className="shop-toolbar-count">
          {total} {total === 1 ? "Product" : "Products"}
        </p>
      </div>
      <label className="shop-sort-label">
        <span className="sr-only">Sort by</span>
        <select
          className="shop-sort-select"
          value={current.sort ?? "newest"}
          onChange={(e) => updateSort(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Best Sellers</option>
        </select>
      </label>
    </div>
  );
}
