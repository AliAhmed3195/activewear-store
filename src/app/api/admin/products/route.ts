import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { productFormSchema } from "@/lib/validations";
import { invalidateCatalogCache } from "@/lib/cache";
import { computeProductPriceCache } from "@/lib/product-mapper";
import type { ProductVariant } from "@/types";
import { attachVariantImages, buildVariantCreates } from "@/lib/variant-admin";
import { pickSizeStock, totalFromSizeStock } from "@/lib/size-stock";
import type { ProductFormInput } from "@/lib/validations";

const productInclude = {
  category: true,
  images: { orderBy: { position: "asc" as const } },
  variants: {
    orderBy: { position: "asc" as const },
    include: { images: { orderBy: { position: "asc" as const } } },
  },
};

function variantsForPriceCache(variants: ProductFormInput["variants"]): ProductVariant[] {
  return variants.map((v, i) => {
    const sizeStock = pickSizeStock(v.sizes, v.sizeStock ?? {});
    return {
      id: `temp-${i}`,
      colorName: v.colorName,
      colorSlug: v.colorSlug,
      colorHex: v.colorHex ?? null,
      sku: v.sku ?? null,
      priceCentsPkr: v.priceCentsPkr,
      priceCentsUsd: v.priceCentsUsd,
      compareAtCentsPkr: v.compareAtCentsPkr ?? null,
      compareAtCentsUsd: v.compareAtCentsUsd ?? null,
      sizes: v.sizes,
      sizeStock,
      stock: totalFromSizeStock(sizeStock),
      position: v.position ?? i,
      images: [],
    };
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    include: productInclude,
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = productFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const priceCache = computeProductPriceCache(variantsForPriceCache(data.variants));

  const created = await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      tagline: data.tagline,
      description: data.description,
      material: data.material,
      gender: data.gender,
      categoryId: data.categoryId,
      badge: data.badge,
      featured: data.featured,
      status: data.status,
      priceCentsPkr: priceCache.priceCentsPkr,
      priceCentsUsd: priceCache.priceCentsUsd,
      images: data.images?.length
        ? {
            create: data.images.map((img, i) => ({
              url: img.url,
              label: img.label,
              position: img.position ?? i,
            })),
          }
        : undefined,
      variants: { create: buildVariantCreates(data.variants) },
    },
    include: { variants: { select: { id: true, position: true } } },
  });

  await attachVariantImages(created.id, data.variants, created.variants);

  const product = await prisma.product.findUnique({
    where: { id: created.id },
    include: productInclude,
  });

  invalidateCatalogCache();
  return NextResponse.json(product, { status: 201 });
}
