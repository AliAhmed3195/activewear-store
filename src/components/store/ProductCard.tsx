"use client";

import Link from "next/link";
import { useState } from "react";
import SafeImage from "@/components/ui/SafeImage";
import {
  badgeLabel,
  formatPrice,
  getVariantCompareAt,
  getVariantPrice,
} from "@/lib/utils";
import { getHeroUrl } from "@/lib/product-mapper";
import { useCart } from "@/lib/cart-context";
import { IconHeart, IconBag, IconStar } from "@/components/ui/icons";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  showSizes?: boolean;
}

export default function ProductCard({ product, priority, showSizes = true }: ProductCardProps) {
  const badge = badgeLabel(product.badge);
  const { addItem, toggleWishlist, isWishlisted, openCart, currency } = useCart();
  const wishlisted = isWishlisted(product.id);
  const defaultVariant = product.variants[0];
  if (!defaultVariant) return null;

  const price = getVariantPrice(defaultVariant, currency);
  const compareAt = getVariantCompareAt(defaultVariant, currency);
  const onSale = compareAt != null;

  const availableSizes = defaultVariant.sizes.filter(
    (s) => (defaultVariant.sizeStock?.[s] ?? 0) > 0
  );
  const initialSize =
    availableSizes[0] ??
    defaultVariant.sizes.find((s) => (defaultVariant.sizeStock?.[s] ?? 0) > 0) ??
    defaultVariant.sizes[0];

  const [selectedSize, setSelectedSize] = useState(initialSize);
  const sizeLeft = defaultVariant.sizeStock?.[selectedSize] ?? 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (sizeLeft <= 0) return;
    addItem(product, defaultVariant, selectedSize, 1);
    openCart();
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const pickSize = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize(size);
  };

  return (
    <article className="product-card group">
      <Link href={`/product/${product.slug}`} className="product-card-link">
        <span className="product-card-corner" aria-hidden="true" />
        <div className="product-card-media">
          {badge && <span className="product-card-badge">{badge}</span>}
          {onSale && (
            <span className="product-card-badge" style={{ top: "auto", bottom: "0.75rem" }}>
              Sale
            </span>
          )}
          <button
            type="button"
            className="product-card-wishlist"
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <IconHeart size={15} filled={wishlisted} />
          </button>
          <SafeImage
            src={getHeroUrl(product)}
            alt={product.name}
            fallbackLabel={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="product-image-contain transition-transform duration-700 group-hover:scale-105"
            priority={priority}
          />
        </div>
      </Link>

      <div className="product-card-body">
        {product.category && <p className="product-card-category">{product.category.name}</p>}
        <Link href={`/product/${product.slug}`}>
          <h3 className="product-card-name text-pearl mt-1.5 group-hover:text-blush transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex text-copper">
            {Array.from({ length: 5 }).map((_, i) => (
              <IconStar
                key={i}
                size={11}
                className={i < Math.floor(product.rating) ? "opacity-100" : "opacity-25"}
              />
            ))}
          </div>
          <span className="font-ui text-[10px] text-pearl-muted">({product.reviewCount})</span>
        </div>

        {showSizes && defaultVariant.sizes.length > 0 && (
          <div className="product-card-sizes" aria-label="Available sizes">
            {defaultVariant.sizes.map((size) => {
              const stock = defaultVariant.sizeStock?.[size] ?? 0;
              const disabled = stock <= 0;
              return (
                <button
                  key={size}
                  type="button"
                  className={cn(
                    "product-card-size",
                    selectedSize === size && "is-active",
                    disabled && "is-disabled"
                  )}
                  disabled={disabled}
                  onClick={(e) => pickSize(e, size)}
                  aria-pressed={selectedSize === size}
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-baseline gap-2 mt-2.5">
          <p className="font-display text-lg text-pearl tracking-wide">
            {formatPrice(price, currency)}
          </p>
          {onSale && (
            <p className="font-ui text-xs text-pearl-muted line-through">
              {formatPrice(compareAt!, currency)}
            </p>
          )}
        </div>

        <button
          type="button"
          className="btn-copper product-card-add"
          onClick={handleQuickAdd}
          disabled={sizeLeft <= 0}
        >
          <IconBag size={14} />
          {sizeLeft <= 0 ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
