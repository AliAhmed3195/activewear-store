"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";

/** Clears bag after Stripe redirect return (confirmPayment redirect path). */
export default function ClearCartOnSuccess() {
  const { clearCart } = useCart();
  useEffect(() => {
    clearCart();
  }, [clearCart]);
  return null;
}
