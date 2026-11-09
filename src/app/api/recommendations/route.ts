import { NextResponse } from "next/server";
import { ProductStatus } from "@prisma/client";
import { prisma, withDbFallback } from "@/lib/db";
import { mapProduct } from "@/lib/product-mapper";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const exclude = (searchParams.get("exclude") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const limit = Math.min(6, Math.max(1, Number(searchParams.get("limit") || 4)));

  const products = await withDbFallback(async () => {
    const rows = await prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        ...(exclude.length ? { id: { notIn: exclude } } : {}),
      },
      include: {
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: {
          orderBy: { position: "asc" },
          include: { images: { orderBy: { position: "asc" } } },
        },
      },
      orderBy: [{ reviewCount: "desc" }, { rating: "desc" }],
      take: limit,
    });
    return rows.map(mapProduct);
  }, []);

  return NextResponse.json({ products });
}
