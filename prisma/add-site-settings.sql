CREATE TABLE IF NOT EXISTS "SiteSettings" (
  "id" TEXT NOT NULL,
  "announcementEnabled" BOOLEAN NOT NULL DEFAULT true,
  "announcementText" TEXT NOT NULL DEFAULT 'Cash on Delivery · Pakistan|Free Shipping on Qualifying Orders|Custom Team Kits|Ships Across Pakistan',
  "saleEnabled" BOOLEAN NOT NULL DEFAULT false,
  "saleBadgeLabel" TEXT NOT NULL DEFAULT 'Season Sale',
  "saleBannerText" TEXT NOT NULL DEFAULT '',
  "saleEndsAt" TIMESTAMP(3),
  "flatShippingPkr" INTEGER NOT NULL DEFAULT 50000,
  "flatShippingUsd" INTEGER NOT NULL DEFAULT 1500,
  "freeShippingThresholdPkr" INTEGER NOT NULL DEFAULT 15000000,
  "freeShippingThresholdUsd" INTEGER NOT NULL DEFAULT 7500,
  "showRatingsOnCards" BOOLEAN NOT NULL DEFAULT true,
  "showStickyAddToCart" BOOLEAN NOT NULL DEFAULT true,
  "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "SiteSettings" ("id", "updatedAt")
VALUES ('default', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
