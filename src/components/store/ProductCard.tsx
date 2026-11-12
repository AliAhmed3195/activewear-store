"use client";

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
import { IconHeart, IconBag } from "@/components/ui/icons";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  showSizes?: boolean;
}

export default function ProductCard({ product, priority }: ProductCardProps) {
  const badge = badgeLabel(product.badge);
  const tone = badgeTone(product.badge);
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
        </div>
      </Link>

      <div className="product-card-body">
        {product.category && (
          <p className="product-card-category">{product.category.name}</p>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="product-card-name text-pearl">{product.name}</h3>
        </Link>
        <div className="product-card-price-row">
          <p className="product-card-price">{formatPrice(price, currency)}</p>
          {onSale && (
            <p className="product-card-compare">{formatPrice(compareAt!, currency)}</p>
          )}
        </div>
        <button
          type="button"
          className="product-card-cta"
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
