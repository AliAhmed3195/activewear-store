import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { ProductBadge } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureSiteSettings } from "@/lib/site-settings";
import { siteSettingsSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await ensureSiteSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = siteSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const saleEndsAt = data.saleEndsAt ? new Date(data.saleEndsAt) : null;

  const updated = await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      announcementEnabled: data.announcementEnabled,
      announcementText: data.announcementText,
      saleEnabled: data.saleEnabled,
      saleBadgeLabel: data.saleBadgeLabel,
      saleBannerText: data.saleBannerText ?? "",
      saleEndsAt,
      flatShippingPkr: data.flatShippingPkr,
      flatShippingUsd: data.flatShippingUsd,
      freeShippingThresholdPkr: data.freeShippingThresholdPkr,
      freeShippingThresholdUsd: data.freeShippingThresholdUsd,
      showRatingsOnCards: data.showRatingsOnCards,
      showStickyAddToCart: data.showStickyAddToCart,
      lowStockThreshold: data.lowStockThreshold,
    },
    update: {
      announcementEnabled: data.announcementEnabled,
      announcementText: data.announcementText,
      saleEnabled: data.saleEnabled,
      saleBadgeLabel: data.saleBadgeLabel,
      saleBannerText: data.saleBannerText ?? "",
      saleEndsAt,
      flatShippingPkr: data.flatShippingPkr,
      flatShippingUsd: data.flatShippingUsd,
      freeShippingThresholdPkr: data.freeShippingThresholdPkr,
      freeShippingThresholdUsd: data.freeShippingThresholdUsd,
      showRatingsOnCards: data.showRatingsOnCards,
      showStickyAddToCart: data.showStickyAddToCart,
      lowStockThreshold: data.lowStockThreshold,
    },
  });

  let badgesUpdated = 0;
  if (data.syncSaleBadges) {
    const discounted = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        variants: {
          some: {
            OR: [
              { compareAtCentsPkr: { not: null } },
              { compareAtCentsUsd: { not: null } },
            ],
          },
        },
      },
      include: { variants: true },
    });

    const saleIds = discounted
      .filter((p) =>
        p.variants.some(
          (v) =>
            (v.compareAtCentsPkr != null && v.compareAtCentsPkr > v.priceCentsPkr) ||
            (v.compareAtCentsUsd != null && v.compareAtCentsUsd > v.priceCentsUsd)
        )
      )
      .map((p) => p.id);

    if (saleIds.length > 0) {
      const result = await prisma.product.updateMany({
        where: { id: { in: saleIds } },
        data: { badge: ProductBadge.SALE },
      });
      badgesUpdated = result.count;
      revalidateTag("catalog", { expire: 0 });
      revalidateTag("products", { expire: 0 });
    }
  }

  revalidateTag("site-settings", { expire: 0 });

  return NextResponse.json({
    ...updated,
    saleEndsAt: updated.saleEndsAt?.toISOString() ?? null,
    updatedAt: updated.updatedAt.toISOString(),
    badgesUpdated,
  });
}
