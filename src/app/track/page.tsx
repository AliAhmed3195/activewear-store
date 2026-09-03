"use client";

import { useState } from "react";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import { formatPrice } from "@/lib/utils";

interface LookupResult {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  name: string;
  phone: string | null;
  city: string;
  country: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  items: Array<{
    productName: string;
    size: string;
    quantity: number;
    priceCents: number;
  }>;
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Order not found");
        return;
      }
      setResult(data);
    } catch {
      setError("Could not look up order. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="store-page">
      <StoreHeader />
      <main className="store-main">
        <section className="page-hero">
          <p className="section-eyebrow">Client Care</p>
          <h1 className="section-title mt-2">Track Your Order</h1>
          <div className="section-divider" />
          <p className="section-desc max-w-xl mx-auto">
            Enter your order number and the email used at checkout.
          </p>
        </section>

        <div className="luxury-card max-w-lg mx-auto p-6 md:p-8 mb-16">
          <form onSubmit={onSubmit} className="space-y-3">
            <label className="block">
              <span className="font-ui text-[10px] tracking-[0.12em] capitalize text-pearl-muted">
                Order Number
              </span>
              <input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
                placeholder="EN-…"
                className="w-full mt-1.5 bg-transparent border border-[var(--divider)] px-3 py-2.5 font-ui text-sm text-pearl outline-none"
              />
            </label>
            <label className="block">
              <span className="font-ui text-[10px] tracking-[0.12em] capitalize text-pearl-muted">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mt-1.5 bg-transparent border border-[var(--divider)] px-3 py-2.5 font-ui text-sm text-pearl outline-none"
              />
            </label>
            {error && <p className="font-ui text-xs text-red-400">{error}</p>}
            <button type="submit" className="btn-copper w-full mt-2" disabled={loading}>
              {loading ? "Searching…" : "Find Order"}
            </button>
          </form>

          {result && (
            <div className="mt-8 pt-6 border-t border-[var(--divider)] text-left">
              <p className="font-ui text-xs text-pearl-muted capitalize tracking-widest">Status</p>
              <p className="font-display text-2xl text-copper mt-1">{result.status}</p>
              <p className="font-ui text-sm text-pearl mt-3">
                {result.orderNumber} · {result.paymentMethod} · {formatPrice(result.totalCents)}
              </p>
              <p className="font-ui text-xs text-pearl-muted mt-1">
                {result.name} · {result.city}, {result.country}
              </p>
              <ul className="mt-4 space-y-2">
                {result.items.map((item, i) => (
                  <li key={i} className="flex justify-between font-ui text-sm text-pearl-muted">
                    <span>
                      {item.productName} · {item.size} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.priceCents * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
