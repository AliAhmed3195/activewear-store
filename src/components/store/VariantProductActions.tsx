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
import { IconBag, IconMinus, IconPlus, IconHeart } from "@/components/ui/icons";

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
  const { addItem, openCart, currency, toggleWishlist, isWishlisted } = useCart();
  const wishlisted = isWishlisted(product.id);
  const availableSizes = variant.sizes.filter((s) => (variant.sizeStock?.[s] ?? 0) > 0);
  const fallbackSize = availableSizes.find((s) => s === "M") ?? availableSizes[0] ?? variant.sizes[0];
  const [size, setSize] = useState(fallbackSize);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const sizes = variant.sizes.filter((s) => (variant.sizeStock?.[s] ?? 0) > 0);
    setSize(sizes.find((s) => s === "M") ?? sizes[0] ?? variant.sizes[0]);
    setQty(1);
  }, [variant.id, variant.sizes, variant.sizeStock]);

  const sizeLeft = variant.sizeStock?.[size] ?? 0;
  const outOfStock = sizeLeft === 0;
  const maxQty = Math.max(1, Math.min(10, sizeLeft || 1));
  const price = getVariantPrice(variant, currency);
  const compareAt = getVariantCompareAt(variant, currency);
  const badge = badgeLabel(product.badge);
  const stockPct = Math.max(8, Math.min(100, (sizeLeft / 12) * 100));

  const handleAdd = () => {
    if (outOfStock || qty > sizeLeft) return;
    addItem(product, variant, size, qty);
    openCart();
  };

  return (
    <div className="pdp-actions">
      <div className="pdp-price-row">
        <p className="pdp-price">{formatPrice(price, currency)}</p>
        {compareAt && <p className="pdp-compare">{formatPrice(compareAt, currency)}</p>}
        {badge && <span className="pdp-badge">{badge}</span>}
      </div>

      {!outOfStock && sizeLeft <= 8 && (
        <div className="pdp-stock">
          <p className="pdp-low-stock">
            {sizeLeft <= 5
              ? `Hurry — only ${sizeLeft} left in ${size}`
              : `${sizeLeft} left in ${size}`}
          </p>
          <div className="pdp-stock-bar" aria-hidden="true">
            <span style={{ width: `${stockPct}%` }} />
          </div>
        </div>
      )}

      {product.variants.length > 1 && (
        <div className="pdp-block">
          <div className="pdp-label-row">
            <span className="pdp-label">Color</span>
            <span className="pdp-label-value">{variant.colorName}</span>
          </div>
          <div className="pdp-swatches">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onVariantChange(v)}
                className={`pdp-swatch ${variant.id === v.id ? "is-active" : ""}`}
                title={v.colorName}
                aria-label={v.colorName}
              >
                <span style={{ backgroundColor: v.colorHex ?? "#666" }} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pdp-block">
        <div className="pdp-label-row">
          <span className="pdp-label">Size</span>
          <span className="pdp-label-value">True to size</span>
        </div>
        <div className="pdp-sizes">
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
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pdp-qty-row">
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

      <div className="pdp-cta-row">
        <button
          type="button"
          className="btn-copper pdp-add-btn"
          onClick={handleAdd}
          disabled={outOfStock}
        >
          <IconBag size={16} />
          {outOfStock ? "Sold Out" : "Add to Cart"}
        </button>
        <button
          type="button"
          className={`pdp-wish-cta ${wishlisted ? "is-on" : ""}`}
          onClick={() => toggleWishlist(product.id)}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <IconHeart size={18} filled={wishlisted} />
        </button>
      </div>
    </div>
  );
}

export function ProductMeta({ product }: { product: Product }) {
  return (
    <div className="pdp-meta">
      <h1 className="pdp-title">{product.name}</h1>
      {product.tagline && <p className="pdp-tagline">{product.tagline}</p>}
      <div className="pdp-rating">
        <div className="pdp-stars" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < Math.floor(product.rating) ? "on" : ""}>
              ★
            </span>
          ))}
        </div>
        <span>
          {product.rating.toFixed(1)} · {product.reviewCount} reviews
        </span>
      </div>
    </div>
  );
}
