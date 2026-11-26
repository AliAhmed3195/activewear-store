"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/store/ProductCard";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/types";

export default function WishlistClient({ showRatings }: { showRatings: boolean }) {
  const { wishlist, toggleWishlist } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (wishlist.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/wishlist/products?ids=${encodeURIComponent(wishlist.join(","))}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setProducts(Array.isArray(data.products) ? data.products : []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [wishlist]);

  if (loading) {
    return <p className="peak-section-sub font-ui">Loading saved items…</p>;
  }

  if (products.length === 0) {
    return (
      <div className="shop-empty">
        <p className="font-display text-2xl text-pearl">Your wishlist is empty</p>
        <p className="font-ui text-sm text-pearl-muted mt-2">
          Tap the heart on any product to save it here.
        </p>
        <Link href="/shop" className="btn-pill btn-pill-dark mt-6 inline-flex">
          Shop sportswear
        </Link>
      </div>
    );
  }

  return (
    <div className="wishlist-grid">
      <div className="product-row product-row-premium">
        {products.map((product, i) => (
          <div key={product.id} className="wishlist-item">
            <ProductCard product={product} priority={i < 4} showRatings={showRatings} />
            <button
              type="button"
              className="wishlist-remove peak-text-link"
              onClick={() => toggleWishlist(product.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
