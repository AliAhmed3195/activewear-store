"use client";

import { useState, useEffect } from "react";
import type { Product, ProductVariant } from "@/types";
import { useCart } from "@/lib/cart-context";
import {
  formatPrice,
  getVariantCompareAt,
  getVariantPrice,
  badgeLabel,
} from "@/lib/utils";
import { IconBag, IconMinus, IconPlus } from "@/components/ui/icons";

interface VariantProductActionsProps {
  product: Product;
  variant: ProductVariant;
  onVariantChange: (v: ProductVariant) => void;
}

export default function VariantProductActions({
  product,
  variant,
  onVariantChange,
}: VariantProductActionsProps) {
  const { addItem, openCart, currency } = useCart();
  const availableSizes = variant.sizes.filter((s) => (variant.sizeStock?.[s] ?? 0) > 0);
  const fallbackSize = availableSizes.find((s) => s === "M") ?? availableSizes[0] ?? variant.sizes[0];
  const [size, setSize] = useState(fallbackSize);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const sizes = variant.sizes.filter((s) => (variant.sizeStock?.[s] ?? 0) > 0);
    setSize(sizes.find((s) => s === "M") ?? sizes[0] ?? variant.sizes[0]);
    setQty(1);
  }, [variant.id, variant.sizes, variant.sizeStock]);

  const onSelectVariant = (v: ProductVariant) => onVariantChange(v);

  const sizeLeft = variant.sizeStock?.[size] ?? 0;
  const outOfStock = sizeLeft === 0;
  const maxQty = Math.max(1, Math.min(10, sizeLeft || 1));
  const price = getVariantPrice(variant, currency);
  const compareAt = getVariantCompareAt(variant, currency);
  const badge = badgeLabel(product.badge);

  const handleAdd = () => {
    if (outOfStock || qty > sizeLeft) return;
    addItem(product, variant, size, qty);
    openCart();
  };

  return (
    <div className="pdp-actions space-y-5 mt-5">
      <div className="pdp-price-row">
        <p className="pdp-price">{formatPrice(price, currency)}</p>
        {compareAt && (
          <p className="pdp-compare">{formatPrice(compareAt, currency)}</p>
        )}
        {badge && <span className="pdp-badge">{badge}</span>}
      </div>

      {!outOfStock && sizeLeft <= 5 && (
        <p className="pdp-low-stock">Please hurry — only {sizeLeft} left in {size}</p>
      )}

      {product.variants.length > 1 && (
        <div>
          <div className="pdp-label-row">
            <span className="pdp-label">Color</span>
            <span className="pdp-label-value">{variant.colorName}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelectVariant(v)}
                className={`size-chip ${variant.id === v.id ? "active" : ""}`}
                title={v.colorName}
              >
                <span
                  className="w-3 h-3 rounded-full inline-block mr-1.5 border border-black/10"
                  style={{ backgroundColor: v.colorHex ?? "#666" }}
                />
                {v.colorName}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="pdp-label-row">
          <span className="pdp-label">Size</span>
          <span className="pdp-label-value">True to size</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {variant.sizes.map((s) => {
            const left = variant.sizeStock?.[s] ?? 0;
            const soldOut = left <= 0;
            return (
              <button
                key={s}
                type="button"
                className={`size-chip ${size === s ? "active" : ""} ${soldOut ? "sold-out" : ""}`}
                onClick={() => {
                  if (soldOut) return;
                  setSize(s);
                  setQty(1);
                }}
                disabled={soldOut}
              >
                <span>{s}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="pdp-label">Qty</span>
        <div className="pdp-qty">
          <button
            type="button"
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={outOfStock}
            aria-label="Decrease quantity"
          >
            <IconMinus size={14} />
          </button>
          <span>{qty}</span>
          <button
            type="button"
            onClick={() => setQty(Math.min(maxQty, qty + 1))}
            disabled={outOfStock || qty >= maxQty}
            aria-label="Increase quantity"
          >
            <IconPlus size={14} />
          </button>
        </div>
      </div>

      <button
        type="button"
        className="btn-copper w-full pdp-add-btn"
        onClick={handleAdd}
        disabled={outOfStock}
      >
        <IconBag size={16} />
        {outOfStock ? "Sold Out" : "Add to Cart"}
      </button>

      {product.material && (
        <p className="font-ui text-xs text-pearl-muted">
          <span className="text-pearl font-medium">Material:</span> {product.material}
        </p>
      )}
    </div>
  );
}

export function ProductMeta({ product }: { product: Product }) {
  return (
    <>
      {product.category && (
        <p className="font-ui text-[11px] tracking-[0.16em] uppercase text-pearl-muted mt-2">
          {product.category.name}
        </p>
      )}
      <h1 className="font-display text-3xl md:text-[2.35rem] text-pearl mt-2 leading-[1.1]">
        {product.name}
      </h1>
      {product.tagline && (
        <p className="font-ui text-base text-pearl-muted mt-2">{product.tagline}</p>
      )}
      <div className="flex items-center gap-2 mt-3">
        <div className="flex text-[#111827] text-sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < Math.floor(product.rating) ? "opacity-100" : "opacity-25"}>
              ★
            </span>
          ))}
        </div>
        <span className="font-ui text-xs text-pearl-muted">
          {product.rating.toFixed(1)} ({product.reviewCount} reviews)
        </span>
      </div>
      <p className="font-ui text-sm text-pearl-muted mt-4 leading-relaxed">{product.description}</p>
    </>
  );
}
