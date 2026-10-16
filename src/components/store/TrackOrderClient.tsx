"use client";

import { useRef, useState } from "react";
import PageHero from "@/components/store/PageHero";
import OrderTrackingResult, {
  type OrderLookupResult,
} from "@/components/store/OrderTrackingResult";

export default function TrackOrderClient() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<OrderLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setHasSearched(true);

    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          email: email.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Order not found");
        return;
      }
      setResult(data as OrderLookupResult);
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="store-main order-track-page">
      <PageHero
        eyebrow="Client Care"
        title="Track Your Order"
        description="Enter your order number and checkout email to see live status, delivery progress, and line items."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Track order" }]}
      />

      <div className="order-track-layout">
        <div className="luxury-card order-track-form-card">
          <div className="order-track-live-badge" role="status">
            <span className="order-track-live-badge-dot" aria-hidden="true" />
            <span>Live lookup — enter your details and tap Track order</span>
          </div>
          <form onSubmit={onSubmit} className="order-track-form" noValidate>
            <label className="order-track-field">
              <span>Order number</span>
              <input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
                autoComplete="off"
                placeholder="PA-1234567890"
                aria-describedby="track-order-hint"
              />
            </label>
            <label className="order-track-field">
              <span>Email used at checkout</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>
            <p id="track-order-hint" className="order-track-hint">
              Order numbers start with <strong>PA-</strong> and appear in your confirmation email.
            </p>

            {error && (
              <div className="order-track-error" role="alert">
                <p>{error}</p>
              </div>
            )}

            <button type="submit" className="btn-copper order-track-submit" disabled={loading}>
              {loading ? (
                <span className="order-track-submit-inner">
                  <span className="order-track-spinner" aria-hidden="true" />
                  Tracking…
                </span>
              ) : (
                "Track order"
              )}
            </button>
          </form>

          {hasSearched && !loading && !result && !error && (
            <p className="order-track-empty">Enter your details above to look up an order.</p>
          )}
        </div>

        <div ref={resultRef} className="order-track-result-wrap">
          {result ? (
            <div className="luxury-card order-track-result-card">
              <OrderTrackingResult order={result} />
            </div>
          ) : (
            <div className="order-track-placeholder" aria-hidden={!hasSearched || Boolean(error)}>
              <p className="order-track-placeholder-title">Your timeline will appear here</p>
              <p className="order-track-placeholder-desc">
                After a successful lookup you will see a progress bar and step-by-step delivery
                status tied to your real order state.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
