"use client";

import { useEffect } from "react";
import SafeImage from "@/components/ui/SafeImage";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { IconBag, IconClose, IconMinus, IconPlus } from "@/components/ui/icons";

export default function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalItems,
    totalPriceCents,
    currency,
  } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const handleCheckout = () => {
    if (items.length === 0) return;
    closeCart();
    router.push("/checkout");
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
        className={`cart-drawer fixed top-0 right-0 z-[70] h-dvh w-full max-w-md bg-surface-luxury border-l border-[var(--divider)] shadow-[-32px_0_64px_rgba(0,0,0,0.5)] flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping bag"
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[var(--divider)]">
          <div>
            <h2 className="font-display text-lg text-pearl">Your Bag</h2>
            <p className="badge-micro mt-1 opacity-70">
              {totalItems} {totalItems === 1 ? "Item" : "Items"}
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
            </div>
          ) : (
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
