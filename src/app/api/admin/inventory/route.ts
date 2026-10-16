import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  normalizeSizeStock,
  pickSizeStock,
  totalFromSizeStock,
  type SizeStockMap,
} from "@/lib/size-stock";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const variants = await prisma.productVariant.findMany({
    orderBy: [{ stock: "asc" }, { product: { name: "asc" } }],
    select: {
      id: true,
      colorName: true,
      colorSlug: true,
      stock: true,
      sizes: true,
      sizeStock: true,
      priceCentsPkr: true,
      priceCentsUsd: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          category: { select: { name: true } },
          images: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
        },
      },
      images: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
    },
  });

  return NextResponse.json(
    variants.map((v) => {
      const sizeStock = normalizeSizeStock(v.sizeStock, v.sizes, v.stock);
      const heroUrl = v.images[0]?.url ?? v.product.images[0]?.url ?? null;
      return {
        id: v.id,
        productId: v.product.id,
        productName: v.product.name,
        productSlug: v.product.slug,
        colorName: v.colorName,
        colorSlug: v.colorSlug,
        stock: totalFromSizeStock(sizeStock) || v.stock,
        sizes: v.sizes,
        sizeStock,
        status: v.product.status,
        priceCentsPkr: v.priceCentsPkr,
        priceCentsUsd: v.priceCentsUsd,
        category: v.product.category,
        imageUrl: heroUrl,
      };
    })
  );
}

const patchSchema = z.object({
  variantId: z.string().min(1),
  sizeStock: z.record(z.string(), z.number().int().min(0)),
  sizes: z.array(z.string()).min(1).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.productVariant.findUnique({
    where: { id: parsed.data.variantId },
    select: { sizes: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sizes = parsed.data.sizes ?? existing.sizes;
  const sizeStock = pickSizeStock(sizes, parsed.data.sizeStock as SizeStockMap);
  const stock = totalFromSizeStock(sizeStock);

  const variant = await prisma.productVariant.update({
    where: { id: parsed.data.variantId },
    data: { stock, sizeStock, sizes },
    select: {
      id: true,
      productId: true,
      colorName: true,
      colorSlug: true,
      stock: true,
      sizeStock: true,
      sizes: true,
      product: { select: { slug: true } },
    },
  });

  const slug = variant.product?.slug;
  const { product: _product, ...payload } = variant;

  const { invalidateCatalogCache } = await import("@/lib/cache");
  invalidateCatalogCache({ productSlugs: slug ? [slug] : [] });
  return NextResponse.json(payload);
}
