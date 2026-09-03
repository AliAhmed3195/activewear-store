"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
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

  useEffect(() => {
    setCurrency(currencyForCountry(form.country));
  }, [form.country, setCurrency]);

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
      <div className="store-page store-page-ambient">
        <StoreHeader />
        <main className="store-main checkout-empty">
          <h1 className="font-display text-3xl text-pearl">Your bag is empty</h1>
          <Link href="/shop" className="btn-copper mt-6 inline-flex">
            Continue Shopping
          </Link>
        </main>
        <StoreFooter />
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
    <div className="store-page store-page-ambient">
      <StoreHeader />
      <main className="store-main checkout-main">
        <section className="page-hero" style={{ marginBottom: "2rem" }}>
          <span className="section-eyebrow">Secure Checkout</span>
          <h1 className="section-title mt-2">Checkout</h1>
          <div className="section-divider" />
        </section>

        <div className="checkout-grid">
          <div className="checkout-form-panel luxury-card p-6 md:p-8">
            {step === "details" ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <h2 className="font-display text-xl text-pearl mb-4">Shipping Details</h2>
                <CheckoutField label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <CheckoutField label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                <CheckoutField label="Phone (with country code)" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
                <CheckoutField label="Address" value={form.addressLine1} onChange={(v) => setForm({ ...form, addressLine1: v })} required />
                <CheckoutField label="Apartment / landmark" value={form.addressLine2} onChange={(v) => setForm({ ...form, addressLine2: v })} />
                <div className="grid grid-cols-2 gap-3">
                  <CheckoutField label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
                  <CheckoutField label="State / Region" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CheckoutField label="Postal Code" value={form.postalCode} onChange={(v) => setForm({ ...form, postalCode: v })} required />
                  <label className="form-field">
                    <span className="form-field-label">Country</span>
                    <select
                      className="form-field-input"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      required
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="pt-4">
                  <h3 className="font-ui text-[10px] tracking-[0.12em] capitalize text-pearl-muted mb-3">
                    Payment Method
                  </h3>
                  <div className="grid gap-2">
                    <PayOption
                      active={paymentMethod === "COD"}
                      title="Cash on Delivery"
                      desc="Pakistan only — pay when your order arrives"
                      onClick={() => setPaymentMethod("COD")}
                      disabled={!isPakistan(form.country)}
                    />
                    <PayOption
                      active={paymentMethod === "CARD"}
                      title="Card (Stripe)"
                      desc="Visa, Mastercard — Pakistan & international"
                      onClick={() => setPaymentMethod("CARD")}
                    />
                    <PayOption
                      active={paymentMethod === "JAZZCASH"}
                      title="JazzCash"
                      desc="Pakistan wallet — coming soon"
                      onClick={() => setPaymentMethod("JAZZCASH")}
                      disabled={!isPakistan(form.country)}
                    />
                    <PayOption
                      active={paymentMethod === "EASYPAISA"}
                      title="EasyPaisa"
                      desc="Pakistan wallet — coming soon"
                      onClick={() => setPaymentMethod("EASYPAISA")}
                      disabled={!isPakistan(form.country)}
                    />
                  </div>
                </div>

                {error && <p className="font-ui text-xs text-red-400">{error}</p>}
                <button type="submit" className="btn-copper w-full mt-4" disabled={loading}>
                  {loading
                    ? "Processing…"
                    : paymentMethod === "COD"
                      ? `Place COD Order · ${formatPrice(liveTotal)}`
                      : "Continue to Card Payment"}
                </button>
                <p className="font-ui text-[10px] text-pearl-muted text-center tracking-wide">
                  International shipping · Discreet packaging
                </p>
              </form>
            ) : clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "night",
                    variables: {
                      colorPrimary: "#a6652a",
                      colorBackground: "#0a0807",
                      colorText: "#f8f4ef",
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

          <aside className="checkout-summary luxury-card p-6 md:p-8">
            <h2 className="font-display text-xl text-pearl">Order Summary</h2>
            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={`${item.variantId}-${item.size}`} className="flex justify-between gap-4 font-ui text-sm">
                  <span className="text-pearl-muted">
                    {item.productName} · {item.colorName} · {item.size} × {item.quantity}
                  </span>
                  <span className="text-pearl">
                    {formatPrice(item.priceCents * item.quantity, currency)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="copper-line w-full my-4" />
            <div className="flex justify-between font-ui text-sm text-pearl-muted">
              <span>Subtotal</span>
              <span>{formatPrice(totals.subtotalCents || liveSubtotal)}</span>
            </div>
            <div className="flex justify-between font-ui text-sm text-pearl-muted mt-2">
              <span>Shipping</span>
              <span>
                {(totals.shippingCents || liveShipping) === 0
                  ? "Free"
                  : formatPrice(totals.shippingCents || liveShipping)}
              </span>
            </div>
            <div className="flex justify-between font-display text-xl text-copper mt-4">
              <span>Total</span>
              <span>{formatPrice(totals.totalCents || liveTotal)}</span>
            </div>
          </aside>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}

function PayOption({
  active,
  title,
  desc,
  onClick,
  disabled,
}: {
  active: boolean;
  title: string;
  desc: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`pay-option ${active ? "is-active" : ""} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      <span className="pay-option-title">{title}</span>
      <span className="pay-option-desc">{desc}</span>
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
    <form onSubmit={handlePay}>
      <h2 className="font-display text-xl text-pearl mb-4">Card Payment</h2>
      {orderNumber && (
        <p className="font-ui text-xs text-pearl-muted mb-4">
          Order <span className="text-pearl">{orderNumber}</span>
        </p>
      )}
      <PaymentElement />
      {error && <p className="font-ui text-xs text-red-400 mt-3">{error}</p>}
      <button type="submit" className="btn-copper w-full mt-6" disabled={!stripe || submitting}>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="form-field">
      <span className="form-field-label">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="form-field-input"
      />
    </label>
  );
}
