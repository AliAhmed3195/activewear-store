"use client";

import { useState } from "react";
import ProductMediaStage from "@/components/store/ProductMediaStage";
import VariantProductActions, { ProductMeta } from "@/components/store/VariantProductActions";
import { useCart } from "@/lib/cart-context";
import { IconHeart, IconGlobe, IconLock, IconGem, IconHeadset } from "@/components/ui/icons";
import type { Product } from "@/types";

const ASSURANCES = [
  { icon: IconLock, text: "Cash on Delivery" },
  { icon: IconGem, text: "Quality Guaranteed" },
  { icon: IconHeadset, text: "Easy Returns" },
  { icon: IconGlobe, text: "Fast Dispatch" },
];

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const { toggleWishlist, isWishlisted } = useCart();
  const wishlisted = isWishlisted(product.id);
  const [variant, setVariant] = useState(product.variants[0]);

  if (!variant) {
    return <p className="text-pearl-muted">Product unavailable.</p>;
  }

  return (
    <div className="product-detail-grid">
      <section className="product-detail-media" aria-label="Product images">
        <ProductMediaStage product={product} variant={variant} />
      </section>

      <aside className="product-detail-panel pdp-buy-panel">
        <div className="flex items-center justify-between gap-4">
          <span className="font-ui text-xs text-pearl-muted uppercase tracking-[0.16em]">
            {product.gender.replace("_", " ")}
          </span>
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            className="pdp-wish-btn"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <IconHeart size={18} filled={wishlisted} />
          </button>
        </div>
        <ProductMeta product={product} />
        <VariantProductActions
          product={product}
          variant={variant}
          onVariantChange={setVariant}
        />
        <div className="product-assurances">
          {ASSURANCES.map((a) => (
            <div key={a.text} className="product-assurance">
              <a.icon size={16} className="text-copper flex-shrink-0 mt-0.5" />
              <span>{a.text}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
