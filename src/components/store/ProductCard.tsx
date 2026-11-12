"use client";

import { useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import {
  badgeLabel,
  badgeTone,
  formatPrice,
  getVariantCompareAt,
  getVariantPrice,
  cn,
} from "@/lib/utils";
import { getHeroUrl } from "@/lib/product-mapper";
import { useCart } from "@/lib/cart-context";
import { IconHeart, IconBag, IconStar } from "@/components/ui/icons";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  showSizes?: boolean;
  showRatings?: boolean;
}

export default function ProductCard({
  product,
  priority,
  showRatings = true,
}: ProductCardProps) {
  const badge = badgeLabel(product.badge);
  const tone = badgeTone(product.badge);
  const { addItem, toggleWishlist, isWishlisted, openCart, currency } = useCart();
  const wishlisted = isWishlisted(product.id);
  const defaultVariant = product.variants[0];
  const [pickedSize, setPickedSize] = useState<string | null>(null);
  const [sizeOpen, setSizeOpen] = useState(false);

  if (!defaultVariant) return null;

  const price = getVariantPrice(defaultVariant, currency);
  const compareAt = getVariantCompareAt(defaultVariant, currency);
  const onSale = compareAt != null;
  const saveAmount = onSale ? compareAt! - price : 0;
  const sizes = defaultVariant.sizes;
  const availableSizes = sizes.filter((s) => (defaultVariant.sizeStock?.[s] ?? 0) > 0);

  const handleQuickAdd = (e: React.MouseEvent, size?: string) => {
    e.preventDefault();
    e.stopPropagation();
    const chosen =
      size ??
      pickedSize ??
      availableSizes.find((s) => s === "M") ??
      availableSizes[0];
    if (!chosen) return;
    const left = defaultVariant.sizeStock?.[chosen] ?? 0;
    if (left <= 0) return;
    addItem(product, defaultVariant, chosen, 1);
    openCart();
    setSizeOpen(false);
    setPickedSize(chosen);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const startAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (availableSizes.length === 0) return;
    if (availableSizes.length === 1) {
      handleQuickAdd(e, availableSizes[0]);
      return;
    }
    setSizeOpen((v) => !v);
  };

  return (
    <article className="product-card product-card-premium group">
      <Link href={`/product/${product.slug}`} className="product-card-link">
        <div className="product-card-media">
          {onSale ? (
            <span className="product-chip product-chip-save">
              Save {formatPrice(saveAmount, currency)}
            </span>
          ) : (
            badge && (
              <span className={cn("product-chip", `product-chip-${tone}`)}>{badge}</span>
            )
          )}
          <button
            type="button"
            className="product-card-wishlist"
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <IconHeart size={14} filled={wishlisted} />
          </button>
          <SafeImage
            src={getHeroUrl(product)}
            alt={product.name}
            fallbackLabel={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="product-image-contain transition-transform duration-700 group-hover:scale-[1.04]"
            priority={priority}
          />
          <div className="product-card-media-shade" aria-hidden="true" />
          <div className={cn("product-card-quick", sizeOpen && "is-open")}>
            {sizeOpen ? (
              <div className="product-card-size-picker" role="group" aria-label="Choose size">
                {sizes.map((s) => {
                  const left = defaultVariant.sizeStock?.[s] ?? 0;
                  const sold = left <= 0;
                  return (
                    <button
                      key={s}
                      type="button"
                      className={cn("product-card-size", sold && "is-sold")}
                      disabled={sold}
                      onClick={(e) => handleQuickAdd(e, s)}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            ) : (
              <button
                type="button"
                className="product-card-quick-btn"
                onClick={startAdd}
                disabled={availableSizes.length === 0}
              >
                <IconBag size={14} />
                {availableSizes.length === 0 ? "Sold out" : "Quick add"}
              </button>
            )}
          </div>
        </div>
      </Link>

      <div className="product-card-body">
        {product.category && (
          <p className="product-card-category">{product.category.name}</p>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="product-card-name text-pearl">{product.name}</h3>
        </Link>
        {showRatings && product.reviewCount > 0 && (
          <div
            className="product-card-rating"
            aria-label={`${product.rating.toFixed(1)} out of 5 from ${product.reviewCount} reviews`}
          >
            <span className="product-card-stars" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <IconStar
                  key={i}
                  size={11}
                  className={i < Math.round(product.rating) ? "opacity-100" : "opacity-25"}
                />
              ))}
            </span>
            <span className="product-card-rating-score">{product.rating.toFixed(1)}</span>
            <span className="product-card-rating-count">({product.reviewCount})</span>
          </div>
        )}
        <div className="product-card-price-row">
          <p className={cn("product-card-price", onSale && "is-sale")}>
            {formatPrice(price, currency)}
          </p>
          {onSale && (
            <p className="product-card-compare">{formatPrice(compareAt!, currency)}</p>
          )}
        </div>
        <button
          type="button"
          className="product-card-cta"
          onClick={startAdd}
          disabled={availableSizes.length === 0}
        >
          <IconBag size={14} />
          {availableSizes.length === 0 ? "Sold Out" : sizeOpen ? "Pick a size" : "Add to Cart"}
        </button>
        {sizeOpen && (
          <div className="product-card-size-picker is-inline" role="group" aria-label="Choose size">
            {sizes.map((s) => {
              const left = defaultVariant.sizeStock?.[s] ?? 0;
              const sold = left <= 0;
              return (
                <button
                  key={s}
                  type="button"
                  className={cn("product-card-size", sold && "is-sold")}
                  disabled={sold}
                  onClick={(e) => handleQuickAdd(e, s)}
                >
                  {s}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}
