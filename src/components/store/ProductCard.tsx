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
import { IconHeart, IconBag } from "@/components/ui/icons";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  /** Kept for compatibility; sizes stay on PDP for cleaner cards */
  showSizes?: boolean;
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
  const saveAmount = onSale ? compareAt! - price : 0;

  const defaultSize =
    defaultVariant.sizes.find((s) => (defaultVariant.sizeStock?.[s] ?? 0) > 0) ??
    defaultVariant.sizes[0];
  const sizeLeft = defaultVariant.sizeStock?.[defaultSize] ?? 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (sizeLeft <= 0 || !defaultSize) return;
    addItem(product, defaultVariant, defaultSize, 1);
    openCart();
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <article className="product-card product-card-clean group">
      <Link href={`/product/${product.slug}`} className="product-card-link">
        <div className="product-card-media">
          {onSale ? (
            <span className="product-card-badge product-card-badge-save">
              SAVE {formatPrice(saveAmount, currency)}
            </span>
          ) : (
            badge && <span className="product-card-badge">{badge}</span>
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
          <button
            type="button"
            className="product-card-quick-add"
            onClick={handleQuickAdd}
            disabled={sizeLeft <= 0}
            aria-label={sizeLeft <= 0 ? "Sold out" : "Add to cart"}
          >
            <IconBag size={16} />
          </button>
        </div>
      </Link>

      <div className="product-card-body">
        <Link href={`/product/${product.slug}`}>
          <h3 className="product-card-name text-pearl">{product.name}</h3>
        </Link>
        <div className="product-card-price-row">
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
          className="product-card-add-text"
          onClick={handleQuickAdd}
          disabled={sizeLeft <= 0}
        >
          {sizeLeft <= 0 ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
