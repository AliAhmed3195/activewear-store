import { Suspense } from "react";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";
import ShopClient from "@/components/store/ShopClient";
import { getCategories, getProducts, getSizeProductCounts } from "@/lib/queries";
import { getSiteSettings } from "@/lib/site-settings";
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
    onSale?: string;
    inStock?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const name = storeName();
  const settings = await getSiteSettings();

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
        onSale: params.onSale === "1",
        inStock: params.inStock === "1",
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
      : params.onSale === "1"
        ? "On sale"
        : "All Products";

  const current = {
    q: params.q,
    category: params.category,
    gender: params.gender,
    size: params.size,
    sort: params.sort,
    onSale: params.onSale,
    inStock: params.inStock,
  };

  return (
    <div className="store-page">
      <StoreHeader />
      <main className="store-main shop-page-premium">
        <section className="shop-hero shop-hero-premium">
          <p className="peak-section-kicker">{name} · Collection</p>
          <h1 className="peak-section-title section-title text-pearl">{heading}</h1>
          {activeCategory?.description ? (
            <p className="peak-section-sub font-ui">{activeCategory.description}</p>
          ) : (
            <p className="peak-section-sub font-ui">
              Performance activewear for gym, run, and everyday — filter fast, checkout faster.
            </p>
          )}
        </section>

        <Suspense fallback={<div className="shop-layout shop-layout-premium" />}>
          <ShopClient
            categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
            sizeCounts={sizeCounts}
            products={result.products}
            total={result.total}
            page={result.page}
            totalPages={result.totalPages}
            current={current}
            showRatings={settings.showRatingsOnCards}
          />
        </Suspense>
      </main>
      <StoreFooter />
    </div>
  );
}
