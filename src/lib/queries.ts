import { cache } from "react";
import { unstable_cache } from "next/cache";
import { Prisma, ProductStatus } from "@prisma/client";
import { prisma, withDbRetry } from "@/lib/db";
import { mapProduct } from "@/lib/product-mapper";
import type { PaginatedProducts, Product, Review, ShopFilters, StoreCurrency } from "@/types";

const productInclude = {
  category: true,
  images: { orderBy: { position: "asc" as const } },
  variants: {
    orderBy: { position: "asc" as const },
    include: { images: { orderBy: { position: "asc" as const } } },
  },
};

const CATALOG_REVALIDATE = 120;

export const getCategories = unstable_cache(
  async () => withDbRetry(() => prisma.category.findMany({ orderBy: { position: "asc" } })),
  ["categories"],
  { tags: ["catalog", "categories"], revalidate: CATALOG_REVALIDATE }
);

export const getSizeProductCounts = unstable_cache(
  async (): Promise<Record<string, number>> => {
    const rows = await withDbRetry(() =>
      prisma.$queryRaw<Array<{ size: string; count: bigint }>>`
        SELECT size, COUNT(DISTINCT p.id)::bigint AS count
        FROM "ProductVariant" v
        JOIN "Product" p ON p.id = v."productId"
        CROSS JOIN UNNEST(v.sizes) AS size
        WHERE p.status = 'ACTIVE'::"ProductStatus"
        GROUP BY size
      `
    );
    const counts: Record<string, number> = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
    for (const row of rows) {
      counts[row.size] = Number(row.count);
    }
    return counts;
  },
  ["size-product-counts"],
  { tags: ["catalog", "products"], revalidate: CATALOG_REVALIDATE }
);

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return unstable_cache(
    async (): Promise<Product[]> => {
      const products = await withDbRetry(() =>
        prisma.product.findMany({
          where: { status: ProductStatus.ACTIVE, featured: true },
          include: productInclude,
          orderBy: { createdAt: "desc" },
          take: limit,
        })
      );
      return products.map(mapProduct);
    },
    ["featured-products", String(limit)],
    { tags: ["catalog", "products"], revalidate: CATALOG_REVALIDATE }
  )();
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  return unstable_cache(
    async (): Promise<Product[]> => {
      const products = await withDbRetry(() =>
        prisma.product.findMany({
          where: { status: ProductStatus.ACTIVE },
          include: productInclude,
          orderBy: { createdAt: "desc" },
          take: limit,
        })
      );
      return products.map(mapProduct);
    },
    ["new-arrivals", String(limit)],
    { tags: ["catalog", "products"], revalidate: CATALOG_REVALIDATE }
  )();
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  return unstable_cache(
    async (): Promise<Product[]> => {
      const products = await withDbRetry(() =>
        prisma.product.findMany({
          where: { status: ProductStatus.ACTIVE },
          include: productInclude,
          orderBy: [{ reviewCount: "desc" }, { rating: "desc" }],
          take: limit,
        })
      );
      return products.map(mapProduct);
    },
    ["best-sellers", String(limit)],
    { tags: ["catalog", "products"], revalidate: CATALOG_REVALIDATE }
  )();
}

export interface CategoryPreview {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  productCount: number;
  previewImage: string | null;
}

export const getCategoryPreviews = unstable_cache(
  async (): Promise<CategoryPreview[]> => {
    const categories = await prisma.category.findMany({
      orderBy: { position: "asc" },
      include: {
        _count: { select: { products: { where: { status: ProductStatus.ACTIVE } } } },
        products: {
          where: { status: ProductStatus.ACTIVE },
          take: 1,
          orderBy: { featured: "desc" },
          include: {
            variants: {
              take: 1,
              orderBy: { position: "asc" },
              include: { images: { orderBy: { position: "asc" }, take: 1 } },
            },
            images: { orderBy: { position: "asc" }, take: 1 },
          },
        },
      },
    });

    return categories.map((cat) => {
      const p = cat.products[0];
      const previewImage =
        p?.variants[0]?.images[0]?.url ?? p?.images[0]?.url ?? null;
      return {
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        productCount: cat._count.products,
        previewImage,
      };
    });
  },
  ["category-previews"],
  { tags: ["catalog", "categories"], revalidate: CATALOG_REVALIDATE }
);

export const getActiveProductCount = unstable_cache(
  async (): Promise<number> => prisma.product.count({ where: { status: ProductStatus.ACTIVE } }),
  ["active-product-count"],
  { tags: ["catalog", "products"], revalidate: CATALOG_REVALIDATE }
);

async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: productInclude,
  });
  return product ? mapProduct(product) : null;
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  return unstable_cache(
    () => fetchProductBySlug(slug),
    ["product-by-slug", slug],
    { tags: ["catalog", "products", `product-${slug}`], revalidate: 300 }
  )();
});

export async function getProductById(id: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
  return product ? mapProduct(product) : null;
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4
): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      status: ProductStatus.ACTIVE,
      id: { not: productId },
      ...(categoryId ? { categoryId } : {}),
    },
    include: productInclude,
    take: limit,
    orderBy: { rating: "desc" },
  });
  return products.map(mapProduct);
}

function priceField(currency: StoreCurrency): "priceCentsPkr" | "priceCentsUsd" {
  return currency === "pkr" ? "priceCentsPkr" : "priceCentsUsd";
}

export async function getProducts(filters: ShopFilters = {}): Promise<PaginatedProducts> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 24));
  const skip = (page - 1) * limit;
  const currency = filters.currency ?? "pkr";
  const priceKey = priceField(currency);

  const cacheKey = JSON.stringify({
    q: filters.q ?? "",
    category: filters.category ?? "",
    gender: filters.gender ?? "",
    size: filters.size ?? "",
    color: filters.color ?? "",
    sort: filters.sort ?? "newest",
    currency,
    page,
    limit,
  });

  return unstable_cache(
    async (): Promise<PaginatedProducts> => {
      const where: Prisma.ProductWhereInput = {
        status: ProductStatus.ACTIVE,
      };

      if (filters.q) {
        where.OR = [
          { name: { contains: filters.q, mode: "insensitive" } },
          { tagline: { contains: filters.q, mode: "insensitive" } },
          { description: { contains: filters.q, mode: "insensitive" } },
        ];
      }

      if (filters.category) {
        where.category = { slug: filters.category };
      }

      if (filters.gender) {
        where.gender = filters.gender as Prisma.EnumGenderFilter;
      }

      if (filters.size) {
        where.variants = { some: { sizes: { has: filters.size } } };
      }

      if (filters.color) {
        where.variants = {
          some: {
            ...(filters.size ? { sizes: { has: filters.size } } : {}),
            colorSlug: filters.color,
          },
        };
      }

      let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
      switch (filters.sort) {
        case "price-asc":
          orderBy = { [priceKey]: "asc" };
          break;
        case "price-desc":
          orderBy = { [priceKey]: "desc" };
          break;
        case "rating":
          orderBy = { rating: "desc" };
          break;
        default:
          orderBy = { createdAt: "desc" };
      }

      const [total, products] = await withDbRetry(() =>
        Promise.all([
          prisma.product.count({ where }),
          prisma.product.findMany({
            where,
            include: productInclude,
            orderBy,
            skip,
            take: limit,
          }),
        ])
      );

      return {
        products: products.map(mapProduct),
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      };
    },
    ["products", cacheKey],
    { tags: ["catalog", "products"], revalidate: CATALOG_REVALIDATE }
  )();
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, status: ProductStatus.ACTIVE },
    include: productInclude,
  });
  return products.map(mapProduct);
}

export async function getApprovedReviews(limit = 12): Promise<Review[]> {
  const rows = await prisma.review.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map((r) => ({
    id: r.id,
    productId: r.productId,
    authorName: r.authorName,
    rating: r.rating,
    title: r.title,
    body: r.body,
    createdAt: r.createdAt,
  }));
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  const rows = await prisma.review.findMany({
    where: { productId, approved: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    productId: r.productId,
    authorName: r.authorName,
    rating: r.rating,
    title: r.title,
    body: r.body,
    createdAt: r.createdAt,
  }));
}

export async function getAllOrders() {
  return prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
}

export async function getAllProductsAdmin() {
  return prisma.product.findMany({
    include: productInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getAllCategoriesAdmin() {
  return prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { position: "asc" },
  });
}

export async function getAllReviewsAdmin() {
  return prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true, slug: true } } },
  });
}
