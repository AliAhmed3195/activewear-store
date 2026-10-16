/**
 * Downloads demo product JPEGs into public/uploads/products and points DB + seed at local URLs.
 * Run: npx tsx prisma/sync-demo-images.ts
 */
import { PrismaClient } from "@prisma/client";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

/** Unsplash sources (verified HTTP 200) — saved locally so cards never depend on dead CDN links. */
export const DEMO_PRODUCT_FILES: Record<string, string> = {
  "performance-oversized-tee.jpg":
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=85",
  "split-running-shorts.jpg":
    "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=1200&q=85",
  "grt-performance-joggers.jpg":
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=85",
  "stealth-performance-tank.jpg":
    "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1200&q=85",
  "acid-wash-crop-top.jpg":
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=85",
  "nomad-knit-coord.jpg":
    "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=85",
  "alpha-roar-hoodie.jpg":
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=85",
  "ankle-length-legging.jpg":
    "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=1200&q=85",
};

const SLUG_TO_FILE: Record<string, string> = {
  "performance-oversized-tee": "performance-oversized-tee.jpg",
  "split-running-shorts": "split-running-shorts.jpg",
  "grt-performance-joggers": "grt-performance-joggers.jpg",
  "stealth-performance-tank": "stealth-performance-tank.jpg",
  "acid-wash-crop-top": "acid-wash-crop-top.jpg",
  "nomad-knit-coord": "nomad-knit-coord.jpg",
  "alpha-roar-hoodie": "alpha-roar-hoodie.jpg",
  "ankle-length-legging": "ankle-length-legging.jpg",
};

async function downloadDemos() {
  const dir = path.join(process.cwd(), "public/uploads/products");
  await mkdir(dir, { recursive: true });

  for (const [fileName, sourceUrl] of Object.entries(DEMO_PRODUCT_FILES)) {
    const res = await fetch(sourceUrl);
    if (!res.ok) {
      throw new Error(`Failed to download ${fileName}: HTTP ${res.status}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(path.join(dir, fileName), buf);
    console.log(`Saved ${fileName} (${buf.byteLength} bytes)`);
  }
}

async function updateDatabaseUrls() {
  const products = await prisma.product.findMany({
    select: { id: true, slug: true, variants: { select: { id: true } } },
  });

  for (const product of products) {
    const file = SLUG_TO_FILE[product.slug];
    if (!file) {
      console.warn(`No demo file mapping for slug: ${product.slug}`);
      continue;
    }
    const url = `/uploads/products/${file}`;
    await prisma.productImage.updateMany({
      where: { productId: product.id },
      data: { url },
    });
    console.log(`Updated images for ${product.slug} → ${url}`);
  }
}

async function main() {
  await downloadDemos();
  await updateDatabaseUrls();
  console.log("Done. Re-run db:seed to keep seed.ts in sync if you change mappings.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
