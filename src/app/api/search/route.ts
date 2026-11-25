import { NextRequest, NextResponse } from "next/server";
import { ProductStatus } from "@prisma/client";
import { prisma, withDbFallback } from "@/lib/db";
import { getHeroUrl } from "@/lib/product-mapper";
import { mapProduct } from "@/lib/product-mapper";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ products: [] });
  }

  const products = await withDbFallback(async () => {
    const rows = await prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { tagline: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { category: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      include: {
        category: true,
        images: { orderBy: { position: "asc" }, take: 2 },
        variants: {
          orderBy: { position: "asc" },
          take: 2,
          include: { images: { orderBy: { position: "asc" }, take: 1 } },
        },
      },
      orderBy: [{ featured: "desc" }, { rating: "desc" }],
      take: 8,
    });
    return rows.map((p) => {
      const product = mapProduct(p);
      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        tagline: product.tagline,
        category: product.category?.name ?? null,
        image: getHeroUrl(product),
        priceCentsPkr: product.priceCentsPkr,
        priceCentsUsd: product.priceCentsUsd,
      };
    });
  }, []);

  return NextResponse.json({ products });
}
