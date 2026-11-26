import { Suspense } from "react";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";
import ShopClient from "@/components/store/ShopClient";
import {
  getCategories,
  getColorFacets,
  getProducts,
  getSizeProductCounts,
} from "@/lib/queries";
import { getSiteSettings } from "@/lib/site-settings";
import { storeName } from "@/lib/utils";
import type { Metadata } from "next";

export const revalidate = 120;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; onSale?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const name = storeName();
  if (params.q) {
    return {
      title: `Search “${params.q}”`,
      description: `Search results for ${params.q} at ${name}.`,
    };
  }
  if (params.onSale === "1") {
    return {
      title: "Sale",
      description: `On-sale sportswear and activewear at ${name}.`,
    };
  }
  return {
    title: "Shop",
    description: `Explore ${name} sportswear — tees, joggers, shorts, kits, and co-ord sets.`,
  };
}

interface ShopPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    gender?: string;
    size?: string;
    color?: string;
    fabric?: string;
    fit?: string;
    activity?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    onSale?: string;
    inStock?: string;
  }>;
}

function parsePrice(raw?: string): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const name = storeName();
  const settings = await getSiteSettings();
  const minPrice = parsePrice(params.minPrice);
  const maxPrice = parsePrice(params.maxPrice);

  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let colors: Awaited<ReturnType<typeof getColorFacets>> = [];
  let sizeCounts: Record<string, number> = {};
  let result: Awaited<ReturnType<typeof getProducts>> = {
    products: [],
    total: 0,
    page: 1,
    totalPages: 1,
  };

  try {
    [categories, result, sizeCounts, colors] = await Promise.all([
      getCategories(),
      getProducts({
        q: params.q,
        category: params.category,
        gender: params.gender,
        size: params.size,
        color: params.color,
        fabric: params.fabric,
        fit: params.fit,
        activity: params.activity,
        minPrice,
        maxPrice,
        sort: (params.sort as "newest" | "price-asc" | "price-desc" | "rating") ?? "newest",
        onSale: params.onSale === "1",
        inStock: params.inStock === "1",
        page,
        limit: 24,
      }),
      getSizeProductCounts(),
      getColorFacets(),
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
    color: params.color,
    fabric: params.fabric,
    fit: params.fit,
    activity: params.activity,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
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
            colors={colors}
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
