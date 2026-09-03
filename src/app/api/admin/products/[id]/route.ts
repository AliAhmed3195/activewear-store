import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { productFormSchema, type ProductFormInput } from "@/lib/validations";
import { pickSizeStock, totalFromSizeStock } from "@/lib/size-stock";
import { invalidateCatalogCache } from "@/lib/cache";
import { computeProductPriceCache } from "@/lib/product-mapper";
import type { ProductVariant } from "@/types";
import { attachVariantImages, buildVariantCreates } from "@/lib/variant-admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

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

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = productFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const priceCache = computeProductPriceCache(variantsForPriceCache(data.variants));

  await prisma.productImage.deleteMany({ where: { productId: id } });
  await prisma.productVariant.deleteMany({ where: { productId: id } });

  const updated = await prisma.product.update({
    where: { id },
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

  await attachVariantImages(updated.id, data.variants, updated.variants);

  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });

  invalidateCatalogCache();
  return NextResponse.json(product);
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  invalidateCatalogCache();
  return NextResponse.json({ success: true });
}
