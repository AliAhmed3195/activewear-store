import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import type { StoreCurrency } from "@/types";

export type SiteSettingsDTO = {
  id: string;
  announcementEnabled: boolean;
  announcementText: string;
  saleEnabled: boolean;
  saleBadgeLabel: string;
  saleBannerText: string;
  saleEndsAt: string | null;
  flatShippingPkr: number;
  flatShippingUsd: number;
  freeShippingThresholdPkr: number;
  freeShippingThresholdUsd: number;
  showRatingsOnCards: boolean;
  showStickyAddToCart: boolean;
  lowStockThreshold: number;
  updatedAt: string;
};

const DEFAULTS: Omit<SiteSettingsDTO, "updatedAt"> = {
  id: "default",
  announcementEnabled: true,
  announcementText:
    "Cash on Delivery · Pakistan|Free Shipping on Qualifying Orders|Custom Team Kits|Ships Across Pakistan",
  saleEnabled: false,
  saleBadgeLabel: "Season Sale",
  saleBannerText: "",
  saleEndsAt: null,
  flatShippingPkr: Number(process.env.SHIPPING_FLAT_RATE_CENTS_PKR ?? "50000"),
  flatShippingUsd: Number(process.env.SHIPPING_FLAT_RATE_CENTS_USD ?? "1500"),
  freeShippingThresholdPkr: Number(
    process.env.FREE_SHIPPING_THRESHOLD_CENTS_PKR ?? "15000000"
  ),
  freeShippingThresholdUsd: Number(
    process.env.FREE_SHIPPING_THRESHOLD_CENTS_USD ?? "7500"
  ),
  showRatingsOnCards: true,
  showStickyAddToCart: true,
  lowStockThreshold: 5,
};

function mapRow(row: {
  id: string;
  announcementEnabled: boolean;
  announcementText: string;
  saleEnabled: boolean;
  saleBadgeLabel: string;
  saleBannerText: string;
  saleEndsAt: Date | null;
  flatShippingPkr: number;
  flatShippingUsd: number;
  freeShippingThresholdPkr: number;
  freeShippingThresholdUsd: number;
  showRatingsOnCards: boolean;
  showStickyAddToCart: boolean;
  lowStockThreshold: number;
  updatedAt: Date;
}): SiteSettingsDTO {
  return {
    id: row.id,
    announcementEnabled: row.announcementEnabled,
    announcementText: row.announcementText,
    saleEnabled: row.saleEnabled,
    saleBadgeLabel: row.saleBadgeLabel,
    saleBannerText: row.saleBannerText,
    saleEndsAt: row.saleEndsAt ? row.saleEndsAt.toISOString() : null,
    flatShippingPkr: row.flatShippingPkr,
    flatShippingUsd: row.flatShippingUsd,
    freeShippingThresholdPkr: row.freeShippingThresholdPkr,
    freeShippingThresholdUsd: row.freeShippingThresholdUsd,
    showRatingsOnCards: row.showRatingsOnCards,
    showStickyAddToCart: row.showStickyAddToCart,
    lowStockThreshold: row.lowStockThreshold,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function ensureSiteSettings(): Promise<SiteSettingsDTO> {
  const existing = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (existing) return mapRow(existing);

  const created = await prisma.siteSettings.create({
    data: {
      id: "default",
      announcementEnabled: DEFAULTS.announcementEnabled,
      announcementText: DEFAULTS.announcementText,
      saleEnabled: DEFAULTS.saleEnabled,
      saleBadgeLabel: DEFAULTS.saleBadgeLabel,
      saleBannerText: DEFAULTS.saleBannerText,
      flatShippingPkr: DEFAULTS.flatShippingPkr,
      flatShippingUsd: DEFAULTS.flatShippingUsd,
      freeShippingThresholdPkr: DEFAULTS.freeShippingThresholdPkr,
      freeShippingThresholdUsd: DEFAULTS.freeShippingThresholdUsd,
      showRatingsOnCards: DEFAULTS.showRatingsOnCards,
      showStickyAddToCart: DEFAULTS.showStickyAddToCart,
      lowStockThreshold: DEFAULTS.lowStockThreshold,
    },
  });
  return mapRow(created);
}

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettingsDTO> => {
    try {
      return await ensureSiteSettings();
    } catch {
      return { ...DEFAULTS, updatedAt: new Date(0).toISOString() };
    }
  },
  ["site-settings"],
  { tags: ["site-settings"], revalidate: 60 }
);

export function announcementLines(settings: SiteSettingsDTO): string[] {
  if (!settings.announcementEnabled) return [];
  return settings.announcementText
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isSaleLive(settings: SiteSettingsDTO, now = new Date()): boolean {
  if (!settings.saleEnabled) return false;
  if (!settings.saleEndsAt) return true;
  return new Date(settings.saleEndsAt).getTime() > now.getTime();
}

export function shippingFromSettings(
  settings: SiteSettingsDTO,
  subtotalCents: number,
  currency: StoreCurrency
): number {
  const flat =
    currency === "pkr" ? settings.flatShippingPkr : settings.flatShippingUsd;
  const freeOver =
    currency === "pkr"
      ? settings.freeShippingThresholdPkr
      : settings.freeShippingThresholdUsd;
  return subtotalCents >= freeOver ? 0 : flat;
}

export { DEFAULTS as SITE_SETTINGS_DEFAULTS };
