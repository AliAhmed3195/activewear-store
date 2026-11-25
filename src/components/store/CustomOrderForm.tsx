"use client";

import { useState } from "react";
import Link from "next/link";
import { FABRIC_OPTIONS } from "@/lib/fabric-catalog";

const PRODUCT_TYPES = [
  "Full sublimation t-shirt",
  "Training tee",
  "Jersey / match kit",
  "Trousers / joggers",
  "Shorts",
  "Set / co-ord",
  "Other",
];

const MIN_QTY = 6;

/** PDF: working 9-field quote form (core fields) + print options */
export default function CustomOrderForm() {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ reference: string } | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    productType: PRODUCT_TYPES[0],
    quantity: MIN_QTY,
    sizeBreakdown: "",
    fabricId: FABRIC_OPTIONS[0]?.id ?? "",
    printNames: true,
    printNumbers: true,
    printLogo: false,
    placement: "Chest + back",
    colorPreference: "",
    deadline: "",
    notes: "",
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const res = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Could not submit. Please check required fields."
        );
        return;
      }
      setDone({ reference: data.reference });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  };

  if (done) {
    return (
      <div className="custom-success">
        <p className="peak-section-kicker">Request received</p>
        <h2>Thanks — we&apos;ll quote you soon</h2>
        <p>
          Reference <strong>{done.reference}</strong>. Our team usually replies within 24–48 hours
          on WhatsApp / email with pricing and timeline.
        </p>
        <div className="custom-success-actions">
          <Link href="/shop" className="btn-pill btn-pill-dark">
            Continue shopping
          </Link>
          <button type="button" className="btn-pill btn-pill-outline" onClick={() => setDone(null)}>
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="custom-form custom-form-pro" onSubmit={onSubmit}>
      <p className="custom-form-step">1 · Contact</p>
      <div className="custom-form-grid">
        <label>
          <span>1. Full name *</span>
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
        </label>
        <label>
          <span>2. Email *</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
          />
        </label>
        <label>
          <span>3. Phone / WhatsApp *</span>
          <input
            required
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="03XX XXXXXXX"
            autoComplete="tel"
          />
        </label>
        <label>
          <span>4. Team / organization</span>
          <input
            value={form.organization}
            onChange={(e) => set("organization", e.target.value)}
            placeholder="Club, gym, company…"
          />
        </label>
      </div>

      <p className="custom-form-step">2 · Kit details</p>
      <div className="custom-form-grid">
        <label>
          <span>5. Product type *</span>
          <select
            value={form.productType}
            onChange={(e) => set("productType", e.target.value)}
            required
          >
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>6. Quantity * (min {MIN_QTY})</span>
          <input
            required
            type="number"
            min={MIN_QTY}
            value={form.quantity}
            onChange={(e) => set("quantity", Number(e.target.value) || MIN_QTY)}
          />
        </label>
        <label className="custom-span-2">
          <span>7. Size breakdown</span>
          <input
            value={form.sizeBreakdown}
            onChange={(e) => set("sizeBreakdown", e.target.value)}
            placeholder="e.g. S×2, M×4, L×6, XL×2"
          />
        </label>
        <label className="custom-span-2">
          <span>8. Preferred fabric</span>
          <select value={form.fabricId} onChange={(e) => set("fabricId", e.target.value)}>
            {FABRIC_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} · {f.gsm} · from PKR {f.ratePkr}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="custom-print">
        <legend>Print options</legend>
        <label className="custom-check">
          <input
            type="checkbox"
            checked={form.printNames}
            onChange={(e) => set("printNames", e.target.checked)}
          />
          Player / member names
        </label>
        <label className="custom-check">
          <input
            type="checkbox"
            checked={form.printNumbers}
            onChange={(e) => set("printNumbers", e.target.checked)}
          />
          Numbers
        </label>
        <label className="custom-check">
          <input
            type="checkbox"
            checked={form.printLogo}
            onChange={(e) => set("printLogo", e.target.checked)}
          />
          Team logo (share file after quote)
        </label>
        <label>
          <span>Placement</span>
          <input
            value={form.placement}
            onChange={(e) => set("placement", e.target.value)}
            placeholder="Chest, back, sleeve…"
          />
        </label>
      </fieldset>

      <p className="custom-form-step">3 · Timing & notes</p>
      <div className="custom-form-grid">
        <label>
          <span>Color preference</span>
          <input
            value={form.colorPreference}
            onChange={(e) => set("colorPreference", e.target.value)}
            placeholder="Black / navy / custom art"
          />
        </label>
        <label>
          <span>Needed by</span>
          <input
            value={form.deadline}
            onChange={(e) => set("deadline", e.target.value)}
            placeholder="e.g. before 15 Dec"
          />
        </label>
        <label className="custom-span-2">
          <span>9. Notes</span>
          <textarea
            rows={4}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Design ideas, roster notes, delivery city…"
          />
        </label>
      </div>

      {error && <p className="custom-error">{error}</p>}

      <button type="submit" className="btn-pill btn-pill-dark custom-submit" disabled={pending}>
        {pending ? "Sending…" : "Request quote"}
      </button>
      <p className="custom-fineprint">
        Minimum {MIN_QTY} pieces · 24–48h quote response. We confirm price before production.
      </p>
    </form>
  );
}
