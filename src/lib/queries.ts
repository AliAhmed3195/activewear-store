import { cache } from "react";
import { unstable_cache } from "next/cache";
import { Gender, Prisma, ProductBadge, ProductStatus } from "@prisma/client";
import { prisma, withDbFallback } from "@/lib/db";
import { mapProduct } from "@/lib/product-mapper";
import type {
  ColorFacet,
  PaginatedProducts,
  Product,
  Review,
  ShopFilters,
  StoreCurrency,
} from "@/types";
import { FABRIC_OPTIONS } from "@/lib/fabric-catalog";

const productInclude = {
  category: true,
  images: { orderBy: { position: "asc" as const } },
  variants: {
    orderBy: { position: "asc" as const },
    include: { images: { orderBy: { position: "asc" as const } } },
  },
};

const CATALOG_REVALIDATE = 120;
const EMPTY_SIZE_COUNTS: Record<string, number> = {
  XS: 0,
  S: 0,
  M: 0,
  L: 0,
  XL: 0,
  XXL: 0,
};

export const getCategories = unstable_cache(
  async () =>
    withDbFallback(() => prisma.category.findMany({ orderBy: { position: "asc" } }), []),
  ["categories"],
  { tags: ["catalog", "categories"], revalidate: CATALOG_REVALIDATE }
);

export const getSizeProductCounts = unstable_cache(
  async (): Promise<Record<string, number>> =>
    withDbFallback(async () => {
      const rows = await prisma.$queryRaw<Array<{ size: string; count: bigint }>>`
        SELECT size, COUNT(DISTINCT p.id)::bigint AS count
        FROM "ProductVariant" v
        JOIN "Product" p ON p.id = v."productId"
        CROSS JOIN UNNEST(v.sizes) AS size
        WHERE p.status = 'ACTIVE'::"ProductStatus"
        GROUP BY size
      `;
      const counts: Record<string, number> = { ...EMPTY_SIZE_COUNTS };
      for (const row of rows) {
        counts[row.size] = Number(row.count);
      }
      return counts;
    }, { ...EMPTY_SIZE_COUNTS }),
  ["size-product-counts"],
  { tags: ["catalog", "products"], revalidate: CATALOG_REVALIDATE }
);

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return unstable_cache(
    async (): Promise<Product[]> =>
      withDbFallback(async () => {
        const products = await prisma.product.findMany({
          where: { status: ProductStatus.ACTIVE, featured: true },
          include: productInclude,
          orderBy: { createdAt: "desc" },
          take: limit,
        });
        return products.map(mapProduct);
      }, []),
    ["featured-products", String(limit)],
    { tags: ["catalog", "products"], revalidate: CATALOG_REVALIDATE }
  )();
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  return unstable_cache(
    async (): Promise<Product[]> =>
      withDbFallback(async () => {
        const products = await prisma.product.findMany({
          where: { status: ProductStatus.ACTIVE },
          include: productInclude,
          orderBy: { createdAt: "desc" },
          take: limit,
        });
        return products.map(mapProduct);
      }, []),
    ["new-arrivals", String(limit)],
    { tags: ["catalog", "products"], revalidate: CATALOG_REVALIDATE }
  )();
}

/** Larger pool for Men/Women homepage toggles */
export async function getNewArrivalsPool(limit = 24): Promise<Product[]> {
  return getNewArrivals(limit);
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  return unstable_cache(
    async (): Promise<Product[]> =>
      withDbFallback(async () => {
        const products = await prisma.product.findMany({
          where: { status: ProductStatus.ACTIVE },
          include: productInclude,
          orderBy: [{ reviewCount: "desc" }, { rating: "desc" }, { featured: "desc" }],
          take: limit,
        });
        return products.map(mapProduct);
      }, []),
    ["best-sellers", String(limit)],
    { tags: ["catalog", "products"], revalidate: CATALOG_REVALIDATE }
  )();
}

export async function getBestSellersPool(limit = 24): Promise<Product[]> {
  return getBestSellers(limit);
}

/** New arrivals excluding best-seller IDs so home sections don't overlap. */
export async function getNewArrivalsExclusive(
  limit = 24,
  excludeIds: string[] = []
): Promise<Product[]> {
  if (excludeIds.length === 0) return getNewArrivals(limit);
  return withDbFallback(async () => {
    const products = await prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        id: { notIn: excludeIds },
      },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return products.map(mapProduct);
  }, []);
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
  async (): Promise<CategoryPreview[]> =>
    withDbFallback(async () => {
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
    }, []),
  ["category-previews"],
  { tags: ["catalog", "categories"], revalidate: CATALOG_REVALIDATE }
);

export const getActiveProductCount = unstable_cache(
  async (): Promise<number> =>
    withDbFallback(
      () => prisma.product.count({ where: { status: ProductStatus.ACTIVE } }),
      0
    ),
  ["active-product-count"],
  { tags: ["catalog", "products"], revalidate: CATALOG_REVALIDATE }
);

async function fetchProductBySlug(slug: string): Promise<Product | null> {
  return withDbFallback(async () => {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: productInclude,
    });
    return product ? mapProduct(product) : null;
  }, null);
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  return unstable_cache(
    () => fetchProductBySlug(slug),
    ["product-by-slug", slug],
    { tags: ["catalog", "products", `product-${slug}`], revalidate: 300 }
  )();
});

export async function getProductById(id: string): Promise<Product | null> {
  return withDbFallback(async () => {
    const product = await prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
    return product ? mapProduct(product) : null;
  }, null);
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4
): Promise<Product[]> {
  return withDbFallback(async () => {
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
  }, []);
}

function priceField(currency: StoreCurrency): "priceCentsPkr" | "priceCentsUsd" {
  return currency === "pkr" ? "priceCentsPkr" : "priceCentsUsd";
}

export async function getColorFacets(): Promise<ColorFacet[]> {
  return unstable_cache(
    async (): Promise<ColorFacet[]> =>
      withDbFallback(async () => {
        const rows = await prisma.productVariant.groupBy({
          by: ["colorSlug", "colorName", "colorHex"],
          where: { product: { status: ProductStatus.ACTIVE } },
          _count: { _all: true },
          orderBy: { _count: { colorSlug: "desc" } },
        });
        const seen = new Set<string>();
        const facets: ColorFacet[] = [];
        for (const row of rows) {
          if (seen.has(row.colorSlug)) continue;
          seen.add(row.colorSlug);
          facets.push({
            slug: row.colorSlug,
            name: row.colorName,
            hex: row.colorHex,
            count: row._count._all,
          });
        }
        return facets;
      }, []),
    ["color-facets"],
    { tags: ["catalog", "products"], revalidate: CATALOG_REVALIDATE }
  )();
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
    fabric: filters.fabric ?? "",
    fit: filters.fit ?? "",
    activity: filters.activity ?? "",
    minPrice: filters.minPrice ?? "",
    maxPrice: filters.maxPrice ?? "",
    sort: filters.sort ?? "newest",
    onSale: Boolean(filters.onSale),
    inStock: Boolean(filters.inStock),
    currency,
    page,
    limit,
  });

  return unstable_cache(
    async (): Promise<PaginatedProducts> =>
      withDbFallback(async () => {
        const where: Prisma.ProductWhereInput = {
          status: ProductStatus.ACTIVE,
        };
        const and: Prisma.ProductWhereInput[] = [];

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
          where.gender = filters.gender as Gender;
        }

        if (filters.fit) {
          where.fit = filters.fit;
        }

        if (filters.activity) {
          where.activity = filters.activity;
        }

        if (filters.fabric) {
          const fab = FABRIC_OPTIONS.find((f) => f.id === filters.fabric);
          if (fab) {
            and.push({
              OR: [
                { material: { contains: fab.name, mode: "insensitive" } },
                { material: { contains: fab.id, mode: "insensitive" } },
                ...(fab.id === "mesh-chawaldana"
                  ? [
                      { material: { contains: "mesh", mode: "insensitive" as const } },
                      { material: { contains: "chawaldana", mode: "insensitive" as const } },
                    ]
                  : []),
                ...(fab.id === "pk-dot"
                  ? [
                      { material: { contains: "p.k", mode: "insensitive" as const } },
                      { material: { contains: "pk dot", mode: "insensitive" as const } },
                    ]
                  : []),
              ],
            });
          }
        }

        if (filters.minPrice != null || filters.maxPrice != null) {
          const priceFilter: Prisma.IntFilter = {};
          if (filters.minPrice != null && Number.isFinite(filters.minPrice)) {
            priceFilter.gte = Math.round(filters.minPrice * 100);
          }
          if (filters.maxPrice != null && Number.isFinite(filters.maxPrice)) {
            priceFilter.lte = Math.round(filters.maxPrice * 100);
          }
          where[priceKey] = priceFilter;
        }

        if (filters.size || filters.color || filters.inStock) {
          where.variants = {
            some: {
              ...(filters.size ? { sizes: { has: filters.size } } : {}),
              ...(filters.color ? { colorSlug: filters.color } : {}),
              ...(filters.inStock ? { stock: { gt: 0 } } : {}),
            },
          };
        }

        if (filters.onSale) {
          and.push({
            OR: [
              { badge: ProductBadge.SALE },
              {
                variants: {
                  some: {
                    OR: [
                      { compareAtCentsPkr: { gt: 0 } },
                      { compareAtCentsUsd: { gt: 0 } },
                    ],
                  },
                },
              },
            ],
          });
        }

        if (and.length) where.AND = and;

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

        const [total, products] = await Promise.all([
          prisma.product.count({ where }),
          prisma.product.findMany({
            where,
            include: productInclude,
            orderBy,
            skip,
            take: limit,
          }),
        ]);

        return {
          products: products.map(mapProduct),
          total,
          page,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        };
      }, {
        products: [],
        total: 0,
        page,
        totalPages: 1,
      }),
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
  return withDbFallback(async () => {
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
  }, []);
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
