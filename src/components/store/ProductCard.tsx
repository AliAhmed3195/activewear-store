"use client";

import Link from "next/link";
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
}

export default function ProductCard({ product, priority }: ProductCardProps) {
  const badge = badgeLabel(product.badge);
  const { addItem, toggleWishlist, isWishlisted, openCart, currency } = useCart();
  const wishlisted = isWishlisted(product.id);
  const defaultVariant = product.variants[0];
  if (!defaultVariant) return null;

  const price = getVariantPrice(defaultVariant, currency);
  const compareAt = getVariantCompareAt(defaultVariant, currency);
  const onSale = compareAt != null;
  const defaultSize =
    defaultVariant.sizes.find((s) => (defaultVariant.sizeStock?.[s] ?? 0) > 0) ??
    defaultVariant.sizes[0];
  const sizeLeft = defaultVariant.sizeStock?.[defaultSize] ?? 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (sizeLeft <= 0) return;
    addItem(product, defaultVariant, defaultSize, 1);
    openCart();
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <Link href={`/product/${product.slug}`} className="product-card group">
      <span className="product-card-corner" aria-hidden="true" />
      <div className="product-card-media">
        {(badge || onSale) && (
          <div className="product-card-badges">
            {badge && (
              <span className="product-card-badge product-card-badge--accent">{badge}</span>
            )}
            {onSale && <span className="product-card-badge product-card-badge--sale">Sale</span>}
          </div>
        )}
        <button
          type="button"
          className={cn("product-card-wishlist", wishlisted && "is-active")}
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
        >
          <IconHeart size={15} filled={wishlisted} />
        </button>
        <SafeImage
          src={getHeroUrl(product)}
          alt={product.name}
          fallbackLabel={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="product-image-contain transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          priority={priority}
        />
        <div className="product-card-actions">
          <button
            type="button"
            className="btn-copper product-card-add-btn w-full"
            onClick={handleQuickAdd}
            disabled={sizeLeft <= 0}
          >
            <IconBag size={14} />
            {sizeLeft <= 0 ? "Sold Out" : "Add to Bag"}
          </button>
        </div>
      </div>
      <div className="product-card-body">
        {product.category && (
          <p className="product-card-category">{product.category.name}</p>
        )}
        <h3 className="product-card-name mt-1.5 line-clamp-2">{product.name}</h3>
        {product.tagline && (
          <p className="product-card-tagline line-clamp-1">{product.tagline}</p>
        )}
        <div className="product-card-rating">
          <div className="product-card-stars" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <IconStar
                key={i}
                size={11}
                className={i < Math.floor(product.rating) ? "is-filled" : ""}
              />
            ))}
          </div>
          <span className="product-card-review-count">({product.reviewCount})</span>
        </div>
        {product.variants.length > 1 && (
          <div className="product-card-swatches" aria-label="Available colors">
            {product.variants.map((v) => (
              <span
                key={v.id}
                className="product-card-swatch"
                style={{ backgroundColor: v.colorHex ?? "#6b7280" }}
                title={v.colorName}
              />
            ))}
          </div>
        )}
        <div className="product-card-price-row">
          <p className="product-card-price">{formatPrice(price, currency)}</p>
          {onSale && (
            <p className="product-card-price-compare">{formatPrice(compareAt!, currency)}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
