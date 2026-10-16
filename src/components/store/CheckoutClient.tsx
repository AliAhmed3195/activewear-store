"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { IconCheck, IconLock, IconShield, IconTruck } from "@/components/ui/icons";
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

const PAYMENT_OPTIONS: {
  method: PayMethod;
  title: string;
  short: string;
  subtitle: string;
  pkOnly?: boolean;
}[] = [
  {
    method: "COD",
    title: "Cash on delivery",
    short: "COD",
    subtitle: "Pay when your parcel arrives",
    pkOnly: true,
  },
  { method: "CARD", title: "Credit / debit card", short: "Card", subtitle: "Visa & Mastercard via Stripe" },
  { method: "JAZZCASH", title: "JazzCash", short: "JazzCash", subtitle: "Wallet — coming soon", pkOnly: true },
  { method: "EASYPAISA", title: "EasyPaisa", short: "EasyPaisa", subtitle: "Wallet — coming soon", pkOnly: true },
];

export default function CheckoutClient() {
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
      <main className="checkout-shell checkout-empty">
        <h1 className="font-display text-2xl text-pearl">Your cart is empty</h1>
        <Link href="/shop" className="btn-copper mt-5 inline-flex">
          Continue Shopping
        </Link>
      </main>
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
    <main className="checkout-shell">
        <div className="checkout-heading">
          <div>
            <p className="checkout-kicker font-ui">Secure checkout</p>
            <h1 className="font-display">Checkout</h1>
            <p className="checkout-secure font-ui">
              <IconLock size={14} aria-hidden="true" />
              Encrypted details · PCI-ready card payments
            </p>
          </div>
          <Link href="/shop" className="checkout-back font-ui">
            ← Keep shopping
          </Link>
        </div>

        <ol className="checkout-steps font-ui" aria-label="Checkout progress">
          <li className={step === "details" ? "is-active" : "is-done"}>
            <span>1</span> Details
          </li>
          <li className={step === "card" ? "is-active" : ""}>
            <span>2</span> Payment
          </li>
        </ol>

        <div className="checkout-layout">
          <div className="checkout-form-panel">
            <div className="checkout-form-accent" aria-hidden="true" />
            {step === "details" ? (
              <form onSubmit={handleSubmit} className="checkout-form">
                <div className="checkout-form-sheet">
                  <section className="checkout-section" aria-labelledby="checkout-delivery-heading">
                    <header className="checkout-section-header">
                      <span className="checkout-section-icon" aria-hidden="true">
                        <IconTruck size={16} />
                      </span>
                      <div>
                        <h2 id="checkout-delivery-heading">Delivery details</h2>
                        <p className="checkout-section-lead font-ui">
                          Where should we send your order?
                        </p>
                      </div>
                    </header>

                    <div className="checkout-subsection">
                      <p className="checkout-subsection-label font-ui">Contact</p>
                      <div className="checkout-fields checkout-grid-3">
                        <CheckoutField
                          label="Full name"
                          value={form.name}
                          onChange={(v) => setForm({ ...form, name: v })}
                          required
                          autoComplete="name"
                        />
                        <CheckoutField
                          label="Email"
                          type="email"
                          value={form.email}
                          onChange={(v) => setForm({ ...form, email: v })}
                          required
                          autoComplete="email"
                        />
                        <CheckoutField
                          label="Phone"
                          type="tel"
                          value={form.phone}
                          onChange={(v) => setForm({ ...form, phone: v })}
                          required
                          placeholder="+92…"
                          autoComplete="tel"
                        />
                      </div>
                    </div>

                    <div className="checkout-subsection">
                      <p className="checkout-subsection-label font-ui">Address</p>
                      <div className="checkout-fields checkout-grid-1">
                        <CheckoutField
                          label="Street address"
                          value={form.addressLine1}
                          onChange={(v) => setForm({ ...form, addressLine1: v })}
                          required
                          autoComplete="address-line1"
                        />
                      </div>
                      <div className="checkout-fields checkout-grid-2 checkout-fields--tight">
                        <CheckoutField
                          label="Landmark"
                          value={form.addressLine2}
                          onChange={(v) => setForm({ ...form, addressLine2: v })}
                          autoComplete="address-line2"
                        />
                        <CheckoutField
                          label="City"
                          value={form.city}
                          onChange={(v) => setForm({ ...form, city: v })}
                          required
                          autoComplete="address-level2"
                        />
                      </div>
                      <div className="checkout-fields checkout-grid-3 checkout-fields--tight">
                        <CheckoutField
                          label="State"
                          value={form.state}
                          onChange={(v) => setForm({ ...form, state: v })}
                          autoComplete="address-level1"
                        />
                        <CheckoutField
                          label="Postal"
                          value={form.postalCode}
                          onChange={(v) => setForm({ ...form, postalCode: v })}
                          required
                          autoComplete="postal-code"
                        />
                        <label className="checkout-field font-ui">
                          <span className="checkout-field-label">
                            Country<span className="checkout-required" aria-hidden="true">*</span>
                          </span>
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
                    </div>
                  </section>

                  <div className="checkout-section-rule" role="presentation" />

                  <section
                    className="checkout-section checkout-section--payment"
                    aria-labelledby="checkout-payment-heading"
                  >
                    <header className="checkout-section-header checkout-section-header--compact">
                      <span className="checkout-section-icon" aria-hidden="true">
                        <IconLock size={16} />
                      </span>
                      <div>
                        <h2 id="checkout-payment-heading">Payment</h2>
                        <p className="checkout-section-lead font-ui">Choose how you want to pay</p>
                      </div>
                    </header>
                    <div className="pay-methods" role="radiogroup" aria-label="Payment method">
                      {PAYMENT_OPTIONS.map((opt) => (
                        <PayMethodOption
                          key={opt.method}
                          active={paymentMethod === opt.method}
                          title={opt.title}
                          short={opt.short}
                          subtitle={opt.subtitle}
                          badge={opt.method === "COD" ? "Popular" : undefined}
                          onClick={() => setPaymentMethod(opt.method)}
                          disabled={opt.pkOnly ? !pk : false}
                        />
                      ))}
                    </div>
                    <p className="pay-hint font-ui">
                      {paymentMethod === "COD" && "Pay in cash when your order arrives (Pakistan)."}
                      {paymentMethod === "CARD" && "Visa / Mastercard via Stripe — Pakistan & international."}
                      {paymentMethod === "JAZZCASH" && "Pakistan wallet — coming soon."}
                      {paymentMethod === "EASYPAISA" && "Pakistan wallet — coming soon."}
                    </p>
                  </section>
                </div>

                {error && <p className="checkout-error font-ui">{error}</p>}
                <div className="checkout-submit-bar">
                  <div className="checkout-submit-total font-ui">
                    <span>Total due</span>
                    <strong>{formatPrice(liveTotal)}</strong>
                  </div>
                  <button type="submit" className="checkout-submit-btn font-ui" disabled={loading}>
                    {loading
                      ? "Processing…"
                      : paymentMethod === "COD"
                        ? "Place COD order"
                        : "Continue to card payment"}
                  </button>
                </div>
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
              <div className="checkout-summary-head">
                <h2>Order summary</h2>
                <span className="checkout-summary-count font-ui">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>
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

            <div className="checkout-side-card checkout-trust-card">
              <h3>
                <IconShield size={16} aria-hidden="true" />
                Why shop with us
              </h3>
              <ul className="checkout-trust-list font-ui">
                <li><IconCheck size={14} aria-hidden="true" /> COD across Pakistan</li>
                <li><IconCheck size={14} aria-hidden="true" /> Secure card worldwide</li>
                <li><IconCheck size={14} aria-hidden="true" /> Order tracking by email</li>
                <li><IconCheck size={14} aria-hidden="true" /> Easy returns policy</li>
              </ul>
            </div>

            <div className="checkout-side-card checkout-help-card">
              <h3>Need help?</h3>
              <p className="font-ui">
                Questions on sizing or delivery?{" "}
                <Link href="/contact">Contact support</Link>
              </p>
            </div>
          </aside>
        </div>
    </main>
  );
}

function PayMethodOption({
  active,
  title,
  short,
  subtitle,
  badge,
  onClick,
  disabled,
}: {
  active: boolean;
  title: string;
  short: string;
  subtitle: string;
  badge?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      disabled={disabled}
      className={`pay-method ${active ? "is-active" : ""} ${disabled ? "is-disabled" : ""}`}
    >
      <span className="pay-method-radio" aria-hidden="true" />
      <span className="pay-method-copy">
        <span className="pay-method-title-row">
          <strong>
            <span className="pay-method-long">{title}</span>
            <span className="pay-method-short">{short}</span>
          </strong>
          {badge && <span className="pay-method-badge">{badge}</span>}
        </span>
        <span className="pay-method-sub">{subtitle}</span>
      </span>
      {active && <IconCheck size={14} className="pay-method-check" aria-hidden="true" />}
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
      <div className="checkout-form-sheet">
        <section className="checkout-section" aria-labelledby="checkout-card-heading">
          <header className="checkout-section-header">
            <span className="checkout-section-icon" aria-hidden="true">
              <IconLock size={16} />
            </span>
            <div>
              <h2 id="checkout-card-heading">Card payment</h2>
              {orderNumber ? (
                <p className="checkout-section-lead font-ui">
                  Order <strong>{orderNumber}</strong>
                </p>
              ) : (
                <p className="checkout-section-lead font-ui">Enter your card details securely</p>
              )}
            </div>
          </header>
          <div className="checkout-stripe-wrap">
            <PaymentElement />
          </div>
        </section>
      </div>
      {error && <p className="checkout-error font-ui">{error}</p>}
      <div className="checkout-submit-bar checkout-submit-bar--solo">
        <button type="submit" className="checkout-submit-btn font-ui" disabled={!stripe || submitting}>
          {submitting ? "Processing…" : `Pay ${formatPrice(totals.totalCents)}`}
        </button>
      </div>
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
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="checkout-field font-ui">
      <span className="checkout-field-label">
        {label}
        {required && <span className="checkout-required" aria-hidden="true">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
    </label>
  );
}
