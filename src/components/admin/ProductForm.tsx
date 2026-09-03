"use client";

import { useMemo, useState } from "react";
import { formatPrice, slugify } from "@/lib/utils";
import { normalizeSizeStock, totalFromSizeStock, type SizeStockMap } from "@/lib/size-stock";
import SizeStockManager from "@/components/admin/SizeStockManager";
import type { Category } from "@prisma/client";

interface ImageRow {
  url: string;
  label: string;
}

interface VariantRow {
  colorName: string;
  colorSlug: string;
  colorHex: string;
  pricePkr: string;
  priceUsd: string;
  comparePkr: string;
  compareUsd: string;
  sizes: string[];
  sizeStock: SizeStockMap;
  images: ImageRow[];
}

interface ProductFormProps {
  categories: Category[];
  initial?: {
    id?: string;
    name: string;
    slug: string;
    tagline: string;
    description: string;
    material?: string | null;
    gender: string;
    categoryId?: string | null;
    badge?: string | null;
    featured: boolean;
    status: string;
    variants: Array<{
      colorName: string;
      colorSlug: string;
      colorHex?: string | null;
      priceCentsPkr: number;
      priceCentsUsd: number;
      compareAtCentsPkr?: number | null;
      compareAtCentsUsd?: number | null;
      sizes: string[];
      sizeStock?: SizeStockMap;
      stock: number;
      images: ImageRow[];
    }>;
  };
}

const BADGES = ["", "NEW", "BEST_SELLER", "SALE"];
const GENDERS = ["MEN", "WOMEN", "UNISEX"];

function toMajor(cents: number): string {
  return (cents / 100).toFixed(2);
}

function toCents(value: string): number | null {
  const n = Number(String(value).replace(/,/g, "").trim());
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

function emptyVariant(): VariantRow {
  return {
    colorName: "Black",
    colorSlug: "black",
    colorHex: "#111111",
    pricePkr: "",
    priceUsd: "",
    comparePkr: "",
    compareUsd: "",
    sizes: ["S", "M", "L", "XL"],
    sizeStock: { S: 5, M: 8, L: 8, XL: 5 },
    images: [{ url: "", label: "Front" }],
  };
}

function mapInitialVariant(v: NonNullable<ProductFormProps["initial"]>["variants"][0]): VariantRow {
  const sizeStock = normalizeSizeStock(v.sizeStock, v.sizes, v.stock);
  return {
    colorName: v.colorName,
    colorSlug: v.colorSlug,
    colorHex: v.colorHex ?? "#111111",
    pricePkr: toMajor(v.priceCentsPkr),
    priceUsd: toMajor(v.priceCentsUsd),
    comparePkr: v.compareAtCentsPkr ? toMajor(v.compareAtCentsPkr) : "",
    compareUsd: v.compareAtCentsUsd ? toMajor(v.compareAtCentsUsd) : "",
    sizes: v.sizes,
    sizeStock,
    images: v.images.length ? v.images : [{ url: "", label: "Front" }],
  };
}

export default function ProductForm({ categories, initial }: ProductFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [material, setMaterial] = useState(initial?.material ?? "");
  const [gender, setGender] = useState(initial?.gender ?? "UNISEX");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [badge, setBadge] = useState(initial?.badge ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [status, setStatus] = useState(initial?.status ?? "ACTIVE");
  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants?.length ? initial.variants.map(mapInitialVariant) : [emptyVariant()]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateVariant = (index: number, patch: Partial<VariantRow>) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const parsedVariants = variants.map((v, position) => {
      const priceCentsPkr = toCents(v.pricePkr);
      const priceCentsUsd = toCents(v.priceUsd);
      if (!priceCentsPkr || priceCentsPkr < 1 || !priceCentsUsd || priceCentsUsd < 1) {
        throw new Error(`Variant ${v.colorName}: enter valid PKR and USD prices`);
      }
      const images = v.images.filter((img) => img.url.trim());
      if (images.length < 1) throw new Error(`Variant ${v.colorName}: add at least one image`);
      return {
        colorName: v.colorName,
        colorSlug: v.colorSlug || slugify(v.colorName),
        colorHex: v.colorHex || null,
        priceCentsPkr,
        priceCentsUsd,
        compareAtCentsPkr: v.comparePkr.trim() ? toCents(v.comparePkr) : null,
        compareAtCentsUsd: v.compareUsd.trim() ? toCents(v.compareUsd) : null,
        sizes: v.sizes,
        sizeStock: Object.fromEntries(v.sizes.map((s) => [s, v.sizeStock[s] ?? 0])),
        position,
        images,
      };
    });

    try {
      const payload = {
        name,
        slug: slug || slugify(name),
        tagline,
        description,
        material: material || null,
        gender,
        categoryId: categoryId || null,
        badge: badge || null,
        featured,
        status,
        variants: parsedVariants,
      };

      const url = initial?.id ? `/api/admin/products/${initial.id}` : "/api/admin/products";
      const method = initial?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "Failed to save product");
        return;
      }

      window.location.href = "/admin/products";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="luxury-card p-6 space-y-6">
      <div className="admin-form-grid">
        <label>
          <span className="admin-label">Name</span>
          <input
            className="admin-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!initial?.id) setSlug(slugify(e.target.value));
            }}
            required
          />
        </label>
        <label>
          <span className="admin-label">Slug</span>
          <input className="admin-input" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </label>
        <label className="md:col-span-2">
          <span className="admin-label">Tagline</span>
          <input className="admin-input" value={tagline} onChange={(e) => setTagline(e.target.value)} required />
        </label>
        <label className="md:col-span-2">
          <span className="admin-label">Description</span>
          <textarea
            className="admin-input min-h-[100px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>
        <label>
          <span className="admin-label">Material</span>
          <input className="admin-input" value={material} onChange={(e) => setMaterial(e.target.value)} />
        </label>
        <label>
          <span className="admin-label">Gender</span>
          <select className="admin-input" value={gender} onChange={(e) => setGender(e.target.value)}>
            {GENDERS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="admin-label">Category</span>
          <select className="admin-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="admin-label">Badge</span>
          <select className="admin-input" value={badge} onChange={(e) => setBadge(e.target.value)}>
            {BADGES.map((b) => (
              <option key={b} value={b}>{b || "None"}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="admin-label">Status</span>
          <select className="admin-input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
        <span className="font-ui text-sm text-pearl">Featured on homepage</span>
      </label>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-pearl">Color Variants</h3>
          <button type="button" className="btn-outline text-xs py-2 px-3" onClick={() => setVariants((v) => [...v, emptyVariant()])}>
            Add Color
          </button>
        </div>

        {variants.map((variant, vi) => (
          <div key={vi} className="rounded-sm border border-[var(--divider)] p-4 space-y-4">
            <div className="admin-form-grid">
              <label>
                <span className="admin-label">Color Name</span>
                <input
                  className="admin-input"
                  value={variant.colorName}
                  onChange={(e) => updateVariant(vi, { colorName: e.target.value, colorSlug: slugify(e.target.value) })}
                />
              </label>
              <label>
                <span className="admin-label">Color Slug</span>
                <input className="admin-input" value={variant.colorSlug} onChange={(e) => updateVariant(vi, { colorSlug: e.target.value })} />
              </label>
              <label>
                <span className="admin-label">Hex</span>
                <input className="admin-input" value={variant.colorHex} onChange={(e) => updateVariant(vi, { colorHex: e.target.value })} />
              </label>
              <label>
                <span className="admin-label">Price PKR</span>
                <input className="admin-input" value={variant.pricePkr} onChange={(e) => updateVariant(vi, { pricePkr: e.target.value })} placeholder="2299.00" />
              </label>
              <label>
                <span className="admin-label">Price USD</span>
                <input className="admin-input" value={variant.priceUsd} onChange={(e) => updateVariant(vi, { priceUsd: e.target.value })} placeholder="24.99" />
              </label>
              <label>
                <span className="admin-label">Compare PKR</span>
                <input className="admin-input" value={variant.comparePkr} onChange={(e) => updateVariant(vi, { comparePkr: e.target.value })} />
              </label>
              <label>
                <span className="admin-label">Compare USD</span>
                <input className="admin-input" value={variant.compareUsd} onChange={(e) => updateVariant(vi, { compareUsd: e.target.value })} />
              </label>
            </div>

            <SizeStockManager
              sizes={variant.sizes}
              sizeStock={variant.sizeStock}
              onToggle={(s) => {
                const sizes = variant.sizes.includes(s)
                  ? variant.sizes.filter((x) => x !== s)
                  : [...variant.sizes, s];
                const sizeStock = { ...variant.sizeStock, [s]: variant.sizeStock[s] ?? 0 };
                updateVariant(vi, { sizes, sizeStock });
              }}
              onQty={(s, qty) => {
                updateVariant(vi, { sizeStock: { ...variant.sizeStock, [s]: qty } });
              }}
              onApply={(next) => updateVariant(vi, { sizes: next.sizes, sizeStock: next.sizeStock })}
            />

            <div>
              <span className="admin-label">Variant Images</span>
              {variant.images.map((img, ii) => (
                <div key={ii} className="flex gap-2 mt-2">
                  <input
                    className="admin-input flex-1"
                    placeholder="https://..."
                    value={img.url}
                    onChange={(e) => {
                      const images = [...variant.images];
                      images[ii] = { ...images[ii], url: e.target.value };
                      updateVariant(vi, { images });
                    }}
                  />
                  <input
                    className="admin-input w-32"
                    placeholder="Label"
                    value={img.label}
                    onChange={(e) => {
                      const images = [...variant.images];
                      images[ii] = { ...images[ii], label: e.target.value };
                      updateVariant(vi, { images });
                    }}
                  />
                </div>
              ))}
              <button
                type="button"
                className="btn-outline text-xs mt-2 py-1 px-2"
                onClick={() => updateVariant(vi, { images: [...variant.images, { url: "", label: "" }] })}
              >
                Add Image
              </button>
            </div>

            {variants.length > 1 && (
              <button type="button" className="text-xs text-red-400" onClick={() => setVariants((v) => v.filter((_, i) => i !== vi))}>
                Remove variant
              </button>
            )}
          </div>
        ))}
      </div>

      {error && <p className="font-ui text-xs text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" className="btn-copper" disabled={saving}>
          {saving ? "Saving…" : initial?.id ? "Update Product" : "Create Product"}
        </button>
        <a href="/admin/products" className="btn-outline">Cancel</a>
      </div>
    </form>
  );
}
