import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/site-settings";

/** Public storefront settings (safe fields only). */
export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({
    announcementEnabled: settings.announcementEnabled,
    announcementText: settings.announcementText,
    saleEnabled: settings.saleEnabled,
    saleBadgeLabel: settings.saleBadgeLabel,
    saleBannerText: settings.saleBannerText,
    saleEndsAt: settings.saleEndsAt,
    flatShippingPkr: settings.flatShippingPkr,
    flatShippingUsd: settings.flatShippingUsd,
    freeShippingThresholdPkr: settings.freeShippingThresholdPkr,
    freeShippingThresholdUsd: settings.freeShippingThresholdUsd,
    showRatingsOnCards: settings.showRatingsOnCards,
    showStickyAddToCart: settings.showStickyAddToCart,
    lowStockThreshold: settings.lowStockThreshold,
  });
}
