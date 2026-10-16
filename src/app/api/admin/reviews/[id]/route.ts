import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { reviewFormSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function syncProductReviewStats(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId, approved: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: agg._avg.rating ?? 0,
      reviewCount: agg._count,
    },
  });
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = reviewFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  if (data.productId) {
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
  }

  const review = await prisma.review.update({
    where: { id },
    data: {
      productId: data.productId,
      authorName: data.authorName,
      rating: data.rating,
      title: data.title,
      body: data.body,
      approved: data.approved,
    },
    include: { product: { select: { name: true, slug: true } } },
  });

  const productIds = new Set<string>();
  if (existing.productId) productIds.add(existing.productId);
  if (data.productId) productIds.add(data.productId);

  for (const productId of productIds) {
    await syncProductReviewStats(productId);
  }

  if (productIds.size > 0) {
    const { invalidateCatalogCache } = await import("@/lib/cache");
    const slugs = await prisma.product.findMany({
      where: { id: { in: [...productIds] } },
      select: { slug: true },
    });
    invalidateCatalogCache({ productSlugs: slugs.map((p) => p.slug) });
  }

  return NextResponse.json(review);
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.review.findUnique({
    where: { id },
    include: { product: { select: { slug: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  if (typeof body.approved !== "boolean") {
    return NextResponse.json({ error: "approved (boolean) is required" }, { status: 400 });
  }

  const review = await prisma.review.update({
    where: { id },
    data: { approved: body.approved },
    include: { product: { select: { name: true, slug: true } } },
  });

  if (existing.productId) {
    await syncProductReviewStats(existing.productId);
    const { invalidateCatalogCache } = await import("@/lib/cache");
    const slugs = review.product?.slug ? [review.product.slug] : [];
    invalidateCatalogCache({ productSlugs: slugs });
  }

  return NextResponse.json(review);
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.review.delete({ where: { id } });

  if (existing.productId) {
    await syncProductReviewStats(existing.productId);
    const { invalidateCatalogCache } = await import("@/lib/cache");
    const product = await prisma.product.findUnique({
      where: { id: existing.productId },
      select: { slug: true },
    });
    invalidateCatalogCache({ productSlugs: product?.slug ? [product.slug] : [] });
  }

  return NextResponse.json({ success: true });
}
