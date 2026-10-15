import Link from "next/link";
import { Suspense } from "react";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";
import ProductCard from "@/components/store/ProductCard";
import ShopSidebar from "@/components/store/ShopSidebar";
import Pagination from "@/components/store/Pagination";
import { getCategories, getProducts, getSizeProductCounts } from "@/lib/queries";
import { storeName } from "@/lib/utils";
import type { Metadata } from "next";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Shop",
  description: "Explore premium activewear — tees, joggers, shorts, and co-ord sets.",
};

interface ShopPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    gender?: string;
    size?: string;
    sort?: string;
    page?: string;
  }>;
}

const SORT_LABELS: Record<string, string> = {
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Top Rated",
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const name = storeName();

  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let sizeCounts: Record<string, number> = {};
  let result: Awaited<ReturnType<typeof getProducts>> = {
    products: [],
    total: 0,
    page: 1,
    totalPages: 1,
  };

  try {
    [categories, result, sizeCounts] = await Promise.all([
      getCategories(),
      getProducts({
        q: params.q,
        category: params.category,
        gender: params.gender,
        size: params.size,
        sort: (params.sort as "newest" | "price-asc" | "price-desc" | "rating") ?? "newest",
        page,
        limit: 24,
      }),
      getSizeProductCounts(),
    ]);
  } catch (error) {
    console.error("[shop] failed to load catalog", error);
  }

  const activeCategory = categories.find((c) => c.slug === params.category);
  const heading = activeCategory
    ? activeCategory.name
    : params.q
      ? `Results for “${params.q}”`
      : "All Products";

  return (
    <div className="store-page store-page-ambient">
      <StoreHeader />
      <main className="store-main">
        <section className="shop-hero">
          <p className="peak-section-kicker">{name} · Collection</p>
          <h1 className="peak-section-title section-title text-pearl">{heading}</h1>
          {activeCategory?.description ? (
            <p className="peak-section-sub font-ui">{activeCategory.description}</p>
          ) : (
            <p className="peak-section-sub font-ui">
              Performance activewear for gym, run, and everyday — filter by fit and find your gear.
            </p>
          )}
        </section>

        <div className="shop-layout">
          <Suspense fallback={<div />}>
            <ShopSidebar
              categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
              sizeCounts={sizeCounts}
              current={{
                q: params.q,
                category: params.category,
                gender: params.gender,
                size: params.size,
                sort: params.sort,
              }}
            />
          </Suspense>

          <div>
            <div className="shop-toolbar">
              <p className="font-ui text-xs text-pearl-muted tracking-widest capitalize">
                {result.total} {result.total === 1 ? "Product" : "Products"}
              </p>
              <p className="font-ui text-xs text-pearl-muted tracking-widest capitalize">
                Sorted by {SORT_LABELS[params.sort ?? "newest"]}
              </p>
            </div>

            {result.products.length === 0 ? (
              <div className="shop-empty">
                <p className="font-display text-2xl text-pearl">No products found</p>
                <p className="font-ui text-sm text-pearl-muted mt-2">Try adjusting your filters.</p>
                <Link href="/shop" className="btn-copper mt-6 inline-flex">View All</Link>
              </div>
            ) : (
              <div className="product-row">
                {result.products.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i === 0} />
                ))}
              </div>
            )}

            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              searchParams={{
                q: params.q,
                category: params.category,
                gender: params.gender,
                size: params.size,
                sort: params.sort,
              }}
            />
          </div>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
