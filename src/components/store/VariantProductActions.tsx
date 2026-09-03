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
import { IconBag, IconArrowRight, IconMinus, IconPlus } from "@/components/ui/icons";

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
  };

  const handleBuyNow = () => {
    if (outOfStock || qty > sizeLeft) return;
    addItem(product, variant, size, qty);
    openCart();
  };

  return (
    <div className="space-y-5">
      <div>
        <span className="font-ui text-xs tracking-[0.2em] capitalize text-pearl-muted">Color</span>
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
                className="w-3 h-3 rounded-full inline-block mr-1.5 border border-white/20"
                style={{ backgroundColor: v.colorHex ?? "#666" }}
              />
              {v.colorName}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="font-ui text-xs tracking-[0.2em] capitalize text-pearl-muted">Size</span>
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

      {!outOfStock && sizeLeft <= 5 && (
        <p className="font-ui text-[11px] text-copper tracking-wide">Low stock in {size}</p>
      )}

      <div className="flex items-center gap-4">
        <span className="font-ui text-xs tracking-[0.2em] capitalize text-pearl-muted">Qty</span>
        <div className="flex items-center gap-3 border border-[var(--divider)] px-3 py-2">
          <button
            type="button"
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={outOfStock}
            aria-label="Decrease quantity"
          >
            <IconMinus size={14} />
          </button>
          <span className="font-ui text-sm w-6 text-center">{qty}</span>
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

      <div className="flex items-baseline gap-3">
        <p className="font-display text-2xl text-copper">{formatPrice(price, currency)}</p>
        {compareAt && (
          <p className="font-ui text-sm text-pearl-muted line-through">
            {formatPrice(compareAt, currency)}
          </p>
        )}
      </div>

      <div className="product-actions-btns grid grid-cols-2 gap-2 sm:gap-3">
        <button
          type="button"
          className="btn-outline w-full min-w-0"
          onClick={handleAdd}
          disabled={outOfStock}
        >
          <IconBag size={16} />
          Add to Bag
        </button>
        <button
          type="button"
          className="btn-copper w-full min-w-0"
          onClick={handleBuyNow}
          disabled={outOfStock}
        >
          Buy Now
          <IconArrowRight size={14} />
        </button>
      </div>

      {product.material && (
        <p className="font-ui text-xs text-pearl-muted">
          <span className="text-pearl">Material:</span> {product.material}
        </p>
      )}
      {badge && <span className="badge-micro inline-block">{badge}</span>}
    </div>
  );
}

export function ProductMeta({ product }: { product: Product }) {
  return (
    <>
      {product.category && (
        <p className="font-ui text-[10px] tracking-[0.2em] capitalize text-pearl-muted mt-2">
          {product.category.name}
        </p>
      )}
      <h2 className="font-display text-3xl md:text-4xl text-pearl mt-2 leading-tight">
        {product.name}
      </h2>
      <p className="font-display text-base text-pearl-muted mt-2">{product.tagline}</p>
      <div className="flex items-center gap-2 mt-3">
        <div className="flex text-copper text-sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < Math.floor(product.rating) ? "opacity-100" : "opacity-30"}>
              ★
            </span>
          ))}
        </div>
        <span className="font-ui text-xs text-pearl-muted">
          {product.rating.toFixed(1)} ({product.reviewCount})
        </span>
      </div>
      <p className="font-ui text-sm text-pearl-muted mt-4 leading-relaxed">{product.description}</p>
    </>
  );
}
