"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import StoreHeader from "@/components/store/StoreHeader";
import { useCart } from "@/lib/cart-context";
import { formatPrice, getShippingCents, currencyForCountry, isPakistan } from "@/lib/utils";
import { COUNTRIES } from "@/lib/countries";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

interface ShippingForm {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const EMPTY_FORM: ShippingForm = {
  name: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "PK",
};

type PayMethod = "COD" | "CARD" | "JAZZCASH" | "EASYPAISA";

export default function CheckoutPage() {
  const { items, clearCart, currency, setCurrency } = useCart();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [totals, setTotals] = useState({ subtotalCents: 0, shippingCents: 0, totalCents: 0 });
  const [form, setForm] = useState<ShippingForm>(EMPTY_FORM);
  const [paymentMethod, setPaymentMethod] = useState<PayMethod>("COD");
  const [step, setStep] = useState<"details" | "card">("details");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const liveSubtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),
    [items]
  );
  const liveShipping = getShippingCents(liveSubtotal, currency);
  const liveTotal = liveSubtotal + liveShipping;
  const pk = isPakistan(form.country);

  useEffect(() => {
    setCurrency(currencyForCountry(form.country));
  }, [form.country, setCurrency]);

  useEffect(() => {
    if (!pk && paymentMethod !== "CARD") setPaymentMethod("CARD");
  }, [pk, paymentMethod]);

  useEffect(() => {
    if (totals.totalCents === 0 && liveTotal > 0) {
      setTotals({
        subtotalCents: liveSubtotal,
        shippingCents: liveShipping,
        totalCents: liveTotal,
      });
    }
  }, [liveSubtotal, liveShipping, liveTotal, totals.totalCents]);

  if (items.length === 0 && !clientSecret && !orderNumber) {
    return (
      <div className="store-page">
        <StoreHeader />
        <main className="checkout-shell checkout-empty">
          <h1 className="font-display text-2xl text-pearl">Your cart is empty</h1>
          <Link href="/shop" className="btn-copper mt-5 inline-flex">
            Continue Shopping
          </Link>
        </main>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            size: i.size,
            quantity: i.quantity,
          })),
          shipping: {
            ...form,
            addressLine2: form.addressLine2 || undefined,
            state: form.state || undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not place order");
        return;
      }

      setTotals({
        subtotalCents: data.subtotalCents,
        shippingCents: data.shippingCents,
        totalCents: data.totalCents,
      });
      setOrderNumber(data.orderNumber);

      if (data.mode === "COD") {
        clearCart();
        const q = new URLSearchParams({
          order: data.orderNumber,
          total: String(data.totalCents),
          method: "COD",
        });
        router.push(`/checkout/success?${q.toString()}`);
        return;
      }

      setClientSecret(data.clientSecret);
      setStep("card");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="store-page checkout-page">
      <StoreHeader />
      <main className="checkout-shell">
        <div className="checkout-heading">
          <div>
            <p className="checkout-kicker">Secure checkout</p>
            <h1>Checkout</h1>
          </div>
          <Link href="/shop" className="checkout-back">
            ← Keep shopping
          </Link>
        </div>

        <div className="checkout-layout">
          <div className="checkout-form-panel">
            {step === "details" ? (
              <form onSubmit={handleSubmit} className="checkout-form">
                <section className="checkout-block">
                  <h2>Contact</h2>
                  <div className="checkout-grid-3">
                    <CheckoutField
                      label="Full name"
                      value={form.name}
                      onChange={(v) => setForm({ ...form, name: v })}
                      required
                    />
                    <CheckoutField
                      label="Email"
                      type="email"
                      value={form.email}
                      onChange={(v) => setForm({ ...form, email: v })}
                      required
                    />
                    <CheckoutField
                      label="Phone"
                      type="tel"
                      value={form.phone}
                      onChange={(v) => setForm({ ...form, phone: v })}
                      required
                      placeholder="+92…"
                    />
                  </div>
                </section>

                <section className="checkout-block">
                  <h2>Shipping</h2>
                  <div className="checkout-grid-1">
                    <CheckoutField
                      label="Address"
                      value={form.addressLine1}
                      onChange={(v) => setForm({ ...form, addressLine1: v })}
                      required
                    />
                  </div>
                  <div className="checkout-grid-2">
                    <CheckoutField
                      label="Apartment / landmark"
                      value={form.addressLine2}
                      onChange={(v) => setForm({ ...form, addressLine2: v })}
                    />
                    <CheckoutField
                      label="City"
                      value={form.city}
                      onChange={(v) => setForm({ ...form, city: v })}
                      required
                    />
                  </div>
                  <div className="checkout-grid-3">
                    <CheckoutField
                      label="State"
                      value={form.state}
                      onChange={(v) => setForm({ ...form, state: v })}
                    />
                    <CheckoutField
                      label="Postal code"
                      value={form.postalCode}
                      onChange={(v) => setForm({ ...form, postalCode: v })}
                      required
                    />
                    <label className="checkout-field">
                      <span>Country</span>
                      <select
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        required
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </section>

                <section className="checkout-block">
                  <h2>Payment</h2>
                  <div className="pay-chips">
                    <PayChip
                      active={paymentMethod === "COD"}
                      title="COD"
                      onClick={() => setPaymentMethod("COD")}
                      disabled={!pk}
                    />
                    <PayChip
                      active={paymentMethod === "CARD"}
                      title="Card"
                      onClick={() => setPaymentMethod("CARD")}
                    />
                    <PayChip
                      active={paymentMethod === "JAZZCASH"}
                      title="JazzCash"
                      onClick={() => setPaymentMethod("JAZZCASH")}
                      disabled={!pk}
                    />
                    <PayChip
                      active={paymentMethod === "EASYPAISA"}
                      title="EasyPaisa"
                      onClick={() => setPaymentMethod("EASYPAISA")}
                      disabled={!pk}
                    />
                  </div>
                  <p className="pay-hint">
                    {paymentMethod === "COD" && "Pay in cash when your order arrives (Pakistan)."}
                    {paymentMethod === "CARD" && "Visa / Mastercard via Stripe — Pakistan & international."}
                    {paymentMethod === "JAZZCASH" && "Pakistan wallet — coming soon."}
                    {paymentMethod === "EASYPAISA" && "Pakistan wallet — coming soon."}
                  </p>
                </section>

                {error && <p className="checkout-error">{error}</p>}
                <button type="submit" className="btn-copper checkout-submit" disabled={loading}>
                  {loading
                    ? "Processing…"
                    : paymentMethod === "COD"
                      ? `Place COD order · ${formatPrice(liveTotal)}`
                      : "Continue to card payment"}
                </button>
              </form>
            ) : clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#111827",
                      colorBackground: "#ffffff",
                      colorText: "#101418",
                      colorDanger: "#dc2626",
                      borderRadius: "4px",
                    },
                  },
                }}
              >
                <PaymentForm
                  totals={totals}
                  orderNumber={orderNumber}
                  onError={setError}
                  error={error}
                />
              </Elements>
            ) : null}
          </div>

          <aside className="checkout-aside">
            <div className="checkout-summary-card">
              <h2>Order summary</h2>
              <ul className="checkout-items">
                {items.map((item) => (
                  <li key={`${item.variantId}-${item.size}`}>
                    <div>
                      <p className="checkout-item-name">{item.productName}</p>
                      <p className="checkout-item-meta">
                        {item.colorName} · {item.size} × {item.quantity}
                      </p>
                    </div>
                    <span>{formatPrice(item.priceCents * item.quantity, currency)}</span>
                  </li>
                ))}
              </ul>
              <div className="checkout-totals">
                <div>
                  <span>Subtotal</span>
                  <span>{formatPrice(totals.subtotalCents || liveSubtotal)}</span>
                </div>
                <div>
                  <span>Shipping</span>
                  <span>
                    {(totals.shippingCents || liveShipping) === 0
                      ? "Free"
                      : formatPrice(totals.shippingCents || liveShipping)}
                  </span>
                </div>
                <div className="checkout-total-row">
                  <span>Total</span>
                  <span>{formatPrice(totals.totalCents || liveTotal)}</span>
                </div>
              </div>
            </div>

            <div className="checkout-side-card">
              <h3>Why shop with us</h3>
              <ul>
                <li>COD available across Pakistan</li>
                <li>Secure card checkout worldwide</li>
                <li>Track every order in your inbox</li>
                <li>Easy returns on eligible items</li>
              </ul>
            </div>

            <div className="checkout-side-card">
              <h3>Need help?</h3>
              <p>
                Questions on sizing or delivery?{" "}
                <Link href="/contact">Contact support</Link>
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function PayChip({
  active,
  title,
  onClick,
  disabled,
}: {
  active: boolean;
  title: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`pay-chip ${active ? "is-active" : ""} ${disabled ? "is-disabled" : ""}`}
    >
      {title}
    </button>
  );
}

function PaymentForm({
  totals,
  orderNumber,
  onError,
  error,
}: {
  totals: { totalCents: number };
  orderNumber: string | null;
  onError: (msg: string | null) => void;
  error: string | null;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    onError(null);

    const returnUrl = new URL(`${window.location.origin}/checkout/success`);
    if (orderNumber) returnUrl.searchParams.set("order", orderNumber);
    returnUrl.searchParams.set("total", String(totals.totalCents));
    returnUrl.searchParams.set("method", "CARD");

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl.toString() },
      redirect: "if_required",
    });

    if (stripeError) {
      onError(stripeError.message ?? "Payment failed");
      setSubmitting(false);
      return;
    }

    clearCart();
    router.push(returnUrl.pathname + returnUrl.search);
  };

  return (
    <form onSubmit={handlePay} className="checkout-form">
      <section className="checkout-block">
        <h2>Card payment</h2>
        {orderNumber && (
          <p className="pay-hint mb-3">
            Order <strong>{orderNumber}</strong>
          </p>
        )}
        <PaymentElement />
      </section>
      {error && <p className="checkout-error">{error}</p>}
      <button type="submit" className="btn-copper checkout-submit" disabled={!stripe || submitting}>
        {submitting ? "Processing…" : `Pay ${formatPrice(totals.totalCents)}`}
      </button>
    </form>
  );
}

function CheckoutField({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="checkout-field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}
