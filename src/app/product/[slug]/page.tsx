import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";
import ProductCard from "@/components/store/ProductCard";
import ProductDetailView from "@/components/store/ProductDetailView";
import ProductReviews from "@/components/store/ProductReviews";
import { getProductBySlug, getProductReviews, getRelatedProducts } from "@/lib/queries";
import { getHeroUrl } from "@/lib/product-mapper";
import { getSiteSettings } from "@/lib/site-settings";
import { storeName } from "@/lib/utils";

export const revalidate = 300;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  const name = storeName();

  return {
    // absolute avoids layout template doubling the brand ("… | VIFACTIVE | VIFACTIVE")
    title: { absolute: `${product.name} · ${name}` },
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.tagline,
      images: getHeroUrl(product) ? [{ url: getHeroUrl(product) }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status !== "ACTIVE") notFound();

  const [related, reviews, settings] = await Promise.all([
    getRelatedProducts(product.id, product.categoryId, 4),
    getProductReviews(product.id),
    getSiteSettings(),
  ]);

  return (
    <div className="store-page pdp-page">
      <StoreHeader />
      <main className="pdp-main">
        <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/shop">Shop</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/shop?category=${product.category.slug}`}>
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="current">{product.name}</span>
        </nav>

        <ProductDetailView
          product={product}
          lowStockThreshold={settings.lowStockThreshold}
          showStickyAddToCart={settings.showStickyAddToCart}
        />

        <ProductReviews
          reviews={reviews}
          rating={product.rating}
          reviewCount={product.reviewCount}
        />

        {related.length > 0 && (
          <section className="pdp-related">
            <div className="peak-section-head">
              <div>
                <p className="peak-section-kicker">Complete the set</p>
                <h2 className="peak-section-title section-title text-pearl">You may also like</h2>
              </div>
              <Link href="/shop" className="nav-link text-sm">
                Shop all
              </Link>
            </div>
            <div className="product-grid">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  showRatings={settings.showRatingsOnCards}
                />
              ))}
            </div>
          </section>
        )}
      </main>
      <StoreFooter />
    </div>
  );
}
