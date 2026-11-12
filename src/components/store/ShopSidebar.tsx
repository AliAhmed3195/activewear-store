"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { IconClose } from "@/components/ui/icons";

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
    onSale?: string;
    inStock?: string;
  };
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

export default function ShopSidebar({
  categories,
  current,
  mobileOpen = false,
  onMobileClose,
  hideSort = false,
}: ShopSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(mobileOpen);

  useEffect(() => {
    setOpen(mobileOpen);
  }, [mobileOpen]);

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

  const hasActiveFilters = Boolean(
    current.q ||
      current.category ||
      current.gender ||
      current.size ||
      current.onSale ||
      current.inStock ||
      (current.sort && current.sort !== "newest")
  );

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
        {hasActiveFilters && (
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
        <div className="shop-filter-drawer" role="dialog" aria-modal="true" aria-label="Filters">
          <button
            type="button"
            className="shop-filter-backdrop"
            aria-label="Close filters"
            onClick={closeMobile}
          />
          <div className="shop-filter-drawer-panel">{panel}</div>
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
  current: ShopSidebarProps["current"];
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

  const hasActive = Boolean(
    current.q || current.category || current.gender || current.size || current.onSale || current.inStock
  );

  return (
    <div className={cn("shop-toolbar shop-toolbar-premium", isPending && "opacity-60")}>
      <div className="shop-toolbar-left">
        <button type="button" className="shop-filter-open" onClick={onOpenFilters}>
          Filters{hasActive ? " ·" : ""}
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
