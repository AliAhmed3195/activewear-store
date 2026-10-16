"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import ProductCard from "@/components/store/ProductCard";
import type { Product } from "@/types";

export default function WishlistView() {
  const { wishlist } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlist.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ ids: wishlist.join(",") });
    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data: unknown) => {
        if (cancelled) return;
        setProducts(Array.isArray(data) ? (data as Product[]) : []);
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
    return (
      <p className="font-ui text-sm text-pearl-muted text-center">Loading saved items…</p>
    );
  }

  if (wishlist.length === 0 || products.length === 0) {
    return (
      <div className="shop-empty">
        <p className="font-display text-2xl text-pearl">Your wishlist is empty</p>
        <p className="font-ui text-sm text-pearl-muted mt-2">
          Save pieces you like and they will stay here after refresh.
        </p>
        <Link href="/shop" className="btn-copper mt-6 inline-flex">
          Shop the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="product-row">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i === 0} />
      ))}
    </div>
  );
}
