"use client";

import { useState } from "react";
import ProductMediaStage from "@/components/store/ProductMediaStage";
import VariantProductActions, { ProductMeta } from "@/components/store/VariantProductActions";
import { useCart } from "@/lib/cart-context";
import { IconHeart, IconGlobe, IconLock, IconGem } from "@/components/ui/icons";
import type { Product } from "@/types";

const ASSURANCES = [
  { icon: IconGlobe, text: "Worldwide shipping — PKR & USD" },
  { icon: IconLock, text: "Secure checkout — Card, COD & wallets" },
  { icon: IconGem, text: "Performance fabrics built for movement" },
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

      <aside className="product-detail-panel luxury-card p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <span className="font-ui text-xs text-pearl-muted uppercase tracking-widest">
            {product.gender.replace("_", " ")}
          </span>
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            className="p-1 -mr-1 text-pearl-muted hover:text-copper transition-colors"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <IconHeart size={18} filled={wishlisted} />
          </button>
        </div>
        <ProductMeta product={product} />
        <div className="copper-line w-full my-5" />
        <VariantProductActions
          product={product}
          variant={variant}
          onVariantChange={setVariant}
        />
        <div className="product-assurances mt-6">
          {ASSURANCES.map((a) => (
            <div key={a.text} className="product-assurance">
              <a.icon size={16} className="text-copper flex-shrink-0" />
              <span>{a.text}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
