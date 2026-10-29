import type { StoreCurrency } from "@/types";

export function storeName(): string {
  return process.env.NEXT_PUBLIC_STORE_NAME ?? "VIFACTIVE";
}

export function storeTagline(): string {
  return process.env.NEXT_PUBLIC_STORE_TAGLINE ?? "Move Sharp. Stay Active.";
}

export function storeUrl(): string {
  const raw = process.env.NEXT_PUBLIC_STORE_URL?.trim();
  if (!raw) return "http://localhost:3000";
  try {
    // Accept bare hostnames from Vercel env mistakes
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(withProtocol).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export function defaultCurrency(): StoreCurrency {
  const c = (process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "pkr").toLowerCase();
  return c === "usd" ? "usd" : "pkr";
}

export function pkrToUsdRate(): number {
  const rate = Number(process.env.PKR_TO_USD_RATE ?? "280");
  return rate > 0 ? rate : 280;
}

/** Resolve checkout currency from shipping country */
export function currencyForCountry(countryCode: string): StoreCurrency {
  return countryCode.toUpperCase() === "PK" ? "pkr" : "usd";
}

export function formatPrice(priceCents: number, currency?: string): string {
  const code = (currency ?? defaultCurrency()).toLowerCase();
  if (code === "pkr") {
    const rupees = priceCents / 100;
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(rupees);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(priceCents / 100);
}

export function getVariantPrice(
  variant: { priceCentsPkr: number; priceCentsUsd: number },
  currency: StoreCurrency
): number {
  return currency === "pkr" ? variant.priceCentsPkr : variant.priceCentsUsd;
}

export function getVariantCompareAt(
  variant: {
    compareAtCentsPkr: number | null;
    compareAtCentsUsd: number | null;
    priceCentsPkr: number;
    priceCentsUsd: number;
  },
  currency: StoreCurrency
): number | null {
  const compare = currency === "pkr" ? variant.compareAtCentsPkr : variant.compareAtCentsUsd;
  const price = getVariantPrice(variant, currency);
  if (compare != null && compare > price) return compare;
  return null;
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber(): string {
  const rand = Math.floor(Math.random() * 900) + 100;
  return `PA-${Date.now().toString().slice(-7)}${rand}`;
}

export function getShippingCents(subtotalCents: number, currency: StoreCurrency): number {
  const isPkr = currency === "pkr";
  const flatRate = Number(
    isPkr
      ? (process.env.SHIPPING_FLAT_RATE_CENTS_PKR ?? "50000")
      : (process.env.SHIPPING_FLAT_RATE_CENTS_USD ?? "1500")
  );
  const freeThreshold = Number(
    isPkr
      ? (process.env.FREE_SHIPPING_THRESHOLD_CENTS_PKR ?? "15000000")
      : (process.env.FREE_SHIPPING_THRESHOLD_CENTS_USD ?? "7500")
  );
  return subtotalCents >= freeThreshold ? 0 : flatRate;
}

export function badgeLabel(badge: string | null | undefined): string | undefined {
  if (!badge) return undefined;
  return badge.replace(/_/g, " ");
}

export function isPakistan(countryCode: string): boolean {
  return countryCode.toUpperCase() === "PK";
}
