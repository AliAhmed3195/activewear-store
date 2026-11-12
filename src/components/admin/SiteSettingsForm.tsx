"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { SiteSettingsDTO } from "@/lib/site-settings";
import { formatPrice } from "@/lib/utils";

interface SiteSettingsFormProps {
  initial: SiteSettingsDTO;
  integrations: {
    whatsapp: string;
    supportEmail: string;
    resendConfigured: boolean;
    stripeConfigured: boolean;
    signedInAs: string;
  };
}

function rupeesToCents(value: string): number {
  const n = Number(value.replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

function centsToRupees(cents: number): string {
  return String(Math.round(cents / 100));
}

function dollarsToCents(value: string): number {
  const n = Number(value.replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

export default function SiteSettingsForm({ initial, integrations }: SiteSettingsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [announcementEnabled, setAnnouncementEnabled] = useState(initial.announcementEnabled);
  const [announcementText, setAnnouncementText] = useState(initial.announcementText);
  const [saleEnabled, setSaleEnabled] = useState(initial.saleEnabled);
  const [saleBadgeLabel, setSaleBadgeLabel] = useState(initial.saleBadgeLabel);
  const [saleBannerText, setSaleBannerText] = useState(initial.saleBannerText);
  const [saleEndsAt, setSaleEndsAt] = useState(
    initial.saleEndsAt ? initial.saleEndsAt.slice(0, 16) : ""
  );
  const [flatPkr, setFlatPkr] = useState(centsToRupees(initial.flatShippingPkr));
  const [flatUsd, setFlatUsd] = useState(centsToDollars(initial.flatShippingUsd));
  const [freePkr, setFreePkr] = useState(centsToRupees(initial.freeShippingThresholdPkr));
  const [freeUsd, setFreeUsd] = useState(centsToDollars(initial.freeShippingThresholdUsd));
  const [showRatingsOnCards, setShowRatingsOnCards] = useState(initial.showRatingsOnCards);
  const [showStickyAddToCart, setShowStickyAddToCart] = useState(initial.showStickyAddToCart);
  const [lowStockThreshold, setLowStockThreshold] = useState(String(initial.lowStockThreshold));
  const [syncSaleBadges, setSyncSaleBadges] = useState(false);

  const save = () => {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            announcementEnabled,
            announcementText,
            saleEnabled,
            saleBadgeLabel,
            saleBannerText,
            saleEndsAt: saleEndsAt ? new Date(saleEndsAt).toISOString() : null,
            flatShippingPkr: rupeesToCents(flatPkr),
            flatShippingUsd: dollarsToCents(flatUsd),
            freeShippingThresholdPkr: rupeesToCents(freePkr),
            freeShippingThresholdUsd: dollarsToCents(freeUsd),
            showRatingsOnCards,
            showStickyAddToCart,
            lowStockThreshold: Math.max(1, Number(lowStockThreshold) || 5),
            syncSaleBadges,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError("Could not save settings. Check the fields and try again.");
          return;
        }
        const extra =
          typeof data.badgesUpdated === "number" && data.badgesUpdated > 0
            ? ` · ${data.badgesUpdated} products marked SALE`
            : "";
        setMessage(`Saved${extra}`);
        setSyncSaleBadges(false);
        router.refresh();
      } catch {
        setError("Network error — try again.");
      }
    });
  };

  return (
    <div className="space-y-8 mt-8">
      <section className="luxury-card p-5 space-y-4">
        <div>
          <h2 className="font-display text-lg text-pearl">Sale campaign</h2>
          <p className="font-ui text-sm text-pearl-muted mt-1">
            Store-wide sale banner. Per-product discounts still use Compare-at price on each product.
          </p>
        </div>
        <label className="flex items-center gap-3 font-ui text-sm text-pearl">
          <input
            type="checkbox"
            checked={saleEnabled}
            onChange={(e) => setSaleEnabled(e.target.checked)}
          />
          Enable sale banner
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block font-ui text-xs text-pearl-muted uppercase tracking-wider">
            Badge label
            <input
              className="mt-1 w-full admin-input"
              value={saleBadgeLabel}
              onChange={(e) => setSaleBadgeLabel(e.target.value)}
              maxLength={60}
            />
          </label>
          <label className="block font-ui text-xs text-pearl-muted uppercase tracking-wider">
            Ends at (optional)
            <input
              type="datetime-local"
              className="mt-1 w-full admin-input"
              value={saleEndsAt}
              onChange={(e) => setSaleEndsAt(e.target.value)}
            />
          </label>
        </div>
        <label className="block font-ui text-xs text-pearl-muted uppercase tracking-wider">
          Banner text
          <input
            className="mt-1 w-full admin-input"
            value={saleBannerText}
            onChange={(e) => setSaleBannerText(e.target.value)}
            placeholder="e.g. Up to 30% off select performance tees"
            maxLength={280}
          />
        </label>
        <label className="flex items-center gap-3 font-ui text-sm text-pearl">
          <input
            type="checkbox"
            checked={syncSaleBadges}
            onChange={(e) => setSyncSaleBadges(e.target.checked)}
          />
          On save, mark products with compare-at discount as SALE badge
        </label>
      </section>

      <section className="luxury-card p-5 space-y-4">
        <div>
          <h2 className="font-display text-lg text-pearl">Announcement bar</h2>
          <p className="font-ui text-sm text-pearl-muted mt-1">
            Separate lines with <code>|</code> — shown in the top marquee.
          </p>
        </div>
        <label className="flex items-center gap-3 font-ui text-sm text-pearl">
          <input
            type="checkbox"
            checked={announcementEnabled}
            onChange={(e) => setAnnouncementEnabled(e.target.checked)}
          />
          Show announcement bar
        </label>
        <textarea
          className="w-full admin-input min-h-[88px]"
          value={announcementText}
          onChange={(e) => setAnnouncementText(e.target.value)}
        />
      </section>

      <section className="luxury-card p-5 space-y-4">
        <div>
          <h2 className="font-display text-lg text-pearl">Shipping</h2>
          <p className="font-ui text-sm text-pearl-muted mt-1">
            Checkout uses these values (overrides env defaults once saved).
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block font-ui text-xs text-pearl-muted uppercase tracking-wider">
            Flat shipping (PKR)
            <input
              className="mt-1 w-full admin-input"
              value={flatPkr}
              onChange={(e) => setFlatPkr(e.target.value)}
              inputMode="numeric"
            />
            <span className="normal-case tracking-normal text-pearl-muted mt-1 block">
              Preview: {formatPrice(rupeesToCents(flatPkr), "pkr")}
            </span>
          </label>
          <label className="block font-ui text-xs text-pearl-muted uppercase tracking-wider">
            Free shipping over (PKR)
            <input
              className="mt-1 w-full admin-input"
              value={freePkr}
              onChange={(e) => setFreePkr(e.target.value)}
              inputMode="numeric"
            />
            <span className="normal-case tracking-normal text-pearl-muted mt-1 block">
              Preview: {formatPrice(rupeesToCents(freePkr), "pkr")}
            </span>
          </label>
          <label className="block font-ui text-xs text-pearl-muted uppercase tracking-wider">
            Flat shipping (USD)
            <input
              className="mt-1 w-full admin-input"
              value={flatUsd}
              onChange={(e) => setFlatUsd(e.target.value)}
              inputMode="decimal"
            />
          </label>
          <label className="block font-ui text-xs text-pearl-muted uppercase tracking-wider">
            Free shipping over (USD)
            <input
              className="mt-1 w-full admin-input"
              value={freeUsd}
              onChange={(e) => setFreeUsd(e.target.value)}
              inputMode="decimal"
            />
          </label>
        </div>
      </section>

      <section className="luxury-card p-5 space-y-4">
        <div>
          <h2 className="font-display text-lg text-pearl">Storefront UX</h2>
        </div>
        <label className="flex items-center gap-3 font-ui text-sm text-pearl">
          <input
            type="checkbox"
            checked={showRatingsOnCards}
            onChange={(e) => setShowRatingsOnCards(e.target.checked)}
          />
          Show star ratings on product cards
        </label>
        <label className="flex items-center gap-3 font-ui text-sm text-pearl">
          <input
            type="checkbox"
            checked={showStickyAddToCart}
            onChange={(e) => setShowStickyAddToCart(e.target.checked)}
          />
          Sticky Add to Cart on mobile product pages
        </label>
        <label className="block font-ui text-xs text-pearl-muted uppercase tracking-wider max-w-xs">
          Low-stock warning threshold
          <input
            className="mt-1 w-full admin-input"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
            inputMode="numeric"
          />
        </label>
      </section>

      <section className="luxury-card p-5">
        <h2 className="font-display text-lg text-pearl">Integrations (env)</h2>
        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 font-ui text-sm">
          <div>
            <dt className="text-pearl-muted">WhatsApp</dt>
            <dd className="text-pearl">{integrations.whatsapp}</dd>
          </div>
          <div>
            <dt className="text-pearl-muted">Support email</dt>
            <dd className="text-pearl">{integrations.supportEmail}</dd>
          </div>
          <div>
            <dt className="text-pearl-muted">Resend</dt>
            <dd className="text-pearl">
              {integrations.resendConfigured ? "Configured" : "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-pearl-muted">Stripe</dt>
            <dd className="text-pearl">
              {integrations.stripeConfigured ? "Configured" : "Not set (COD still works)"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-pearl-muted">Signed in</dt>
            <dd className="text-pearl">{integrations.signedInAs}</dd>
          </div>
        </dl>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button type="button" className="btn-copper" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </button>
        {message && <p className="font-ui text-sm text-emerald-400">{message}</p>}
        {error && <p className="font-ui text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
