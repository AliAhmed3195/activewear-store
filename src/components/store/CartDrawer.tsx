"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatPrice, getVariantPrice } from "@/lib/utils";
import { getHeroUrl } from "@/lib/product-mapper";
import { IconBag, IconClose, IconMinus, IconPlus } from "@/components/ui/icons";
import type { Product } from "@/types";

export default function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    addItem,
    openCart,
    totalItems,
    totalPriceCents,
    currency,
  } = useCart();
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || items.length === 0) {
      setSuggestions([]);
      return;
    }
    const exclude = items.map((i) => i.productId).join(",");
    let cancelled = false;
    fetch(`/api/recommendations?exclude=${encodeURIComponent(exclude)}&limit=3`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSuggestions(Array.isArray(data.products) ? data.products : []);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, items]);

  const handleCheckout = () => {
    if (items.length === 0) return;
    closeCart();
    router.push("/checkout");
  };

  const addSuggestion = (product: Product) => {
    const variant = product.variants[0];
    if (!variant) return;
    const size =
      variant.sizes.find((s) => (variant.sizeStock?.[s] ?? 0) > 0) ?? variant.sizes[0];
    if (!size) return;
    addItem(product, variant, size, 1);
    openCart();
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />
      <aside
        className={`cart-drawer fixed top-0 right-0 z-[70] h-dvh w-full max-w-md bg-white border-l border-[var(--divider)] shadow-[-24px_0_48px_rgba(16,20,24,0.18)] flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping bag"
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[var(--divider)]">
          <div>
            <h2 className="font-display text-lg text-pearl">Your Cart</h2>
            <p className="font-ui text-xs text-pearl-muted mt-1 tracking-wide uppercase">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
          </div>
          <button type="button" onClick={closeCart} className="icon-btn" aria-label="Close bag">
            <IconClose />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <IconBag size={28} className="text-pearl-muted opacity-40" />
              <p className="font-ui text-pearl-muted text-sm">Your bag is empty.</p>
              <Link href="/shop" className="peak-text-link" onClick={closeCart}>
                Continue shopping →
              </Link>
            </div>
          ) : (
            <>
              <ul className="space-y-4">
                {items.map((item) => (
                  <li
                    key={`${item.variantId}-${item.size}`}
                    className="flex gap-3 pb-4 border-b border-[var(--divider)] last:border-b-0"
                  >
                    <div className="relative w-16 h-20 bg-surface border border-[var(--divider)] overflow-hidden flex-shrink-0">
                      <SafeImage
                        src={item.imageUrl}
                        alt={item.productName}
                        fallbackLabel={item.productName}
                        fill
                        sizes="64px"
                        className="product-image-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-pearl text-sm truncate">{item.productName}</p>
                      <p className="font-ui text-xs text-pearl-muted mt-1">
                        {item.colorName} · Size {item.size}
                      </p>
                      <p className="font-ui text-sm text-copper mt-1">
                        {formatPrice(item.priceCents, item.currency)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.variantId, item.size, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          aria-label="Decrease"
                        >
                          <IconMinus size={12} />
                        </button>
                        <span className="font-ui text-xs w-5 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.variantId, item.size, item.quantity + 1)
                          }
                          disabled={item.quantity >= 10}
                          aria-label="Increase"
                        >
                          <IconPlus size={12} />
                        </button>
                        <button
                          type="button"
                          className="ml-auto font-ui text-xs text-pearl-muted hover:text-pearl"
                          onClick={() => removeItem(item.variantId, item.size)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {suggestions.length > 0 && (
                <div className="cart-upsell">
                  <p className="cart-upsell-title">You may like this</p>
                  <ul className="cart-upsell-list">
                    {suggestions.map((product) => {
                      const variant = product.variants[0];
                      if (!variant) return null;
                      const price = getVariantPrice(variant, currency);
                      return (
                        <li key={product.id} className="cart-upsell-item">
                          <Link
                            href={`/product/${product.slug}`}
                            className="cart-upsell-media"
                            onClick={closeCart}
                          >
                            <SafeImage
                              src={getHeroUrl(product)}
                              alt={product.name}
                              fallbackLabel={product.name}
                              fill
                              sizes="56px"
                              className="product-image-contain"
                            />
                          </Link>
                          <div className="cart-upsell-copy">
                            <Link href={`/product/${product.slug}`} onClick={closeCart}>
                              <strong>{product.name}</strong>
                            </Link>
                            <span>{formatPrice(price, currency)}</span>
                            <button
                              type="button"
                              className="cart-upsell-add"
                              onClick={() => addSuggestion(product)}
                            >
                              Add
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-[var(--divider)] space-y-3">
            <div className="flex justify-between font-ui text-sm">
              <span className="text-pearl-muted">Subtotal</span>
              <span className="text-pearl">{formatPrice(totalPriceCents, currency)}</span>
            </div>
            <button type="button" className="btn-copper w-full" onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
