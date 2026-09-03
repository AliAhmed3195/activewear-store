import Link from "next/link";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";
import ProductCard from "@/components/store/ProductCard";
import ReviewsSection from "@/components/store/ReviewsSection";
import {
  getNewArrivals,
  getCategoryPreviews,
  getActiveProductCount,
  getApprovedReviews,
} from "@/lib/queries";
import { storeName, storeTagline } from "@/lib/utils";
import { IconLock, IconGlobe, IconGem, IconHeadset } from "@/components/ui/icons";

export const revalidate = 120;

const TRUST = [
  { icon: IconLock, title: "Secure Checkout", desc: "Card, COD, JazzCash & EasyPaisa" },
  { icon: IconGlobe, title: "PKR & International", desc: "Ships across Pakistan and worldwide" },
  { icon: IconGem, title: "Performance Fabrics", desc: "Built for gym, run, and everyday" },
  { icon: IconHeadset, title: "Order Support", desc: "Track orders and get help fast" },
];

export default async function HomePage() {
  const name = storeName();

  let newArrivals: Awaited<ReturnType<typeof getNewArrivals>> = [];
  let categories: Awaited<ReturnType<typeof getCategoryPreviews>> = [];
  let productCount = 0;
  let reviews: Awaited<ReturnType<typeof getApprovedReviews>> = [];

  try {
    [newArrivals, categories, productCount, reviews] = await Promise.all([
      getNewArrivals(8),
      getCategoryPreviews(),
      getActiveProductCount(),
      getApprovedReviews(6),
    ]);
  } catch (error) {
    console.error("[homepage] failed to load catalog", error);
  }

  return (
    <>
      <StoreHeader />
      <main>
        <section className="hero-section relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0b] via-[#141416] to-[#0a0a0b]" />
          <div className="container-luxury relative z-10 py-20 md:py-28 lg:py-32">
            <p className="hero-eyebrow text-copper">{name}</p>
            <h1 className="hero-title text-pearl mt-4 max-w-3xl">
              {storeTagline()}
            </h1>
            <p className="font-ui text-pearl-muted text-lg mt-6 max-w-xl">
              Premium activewear designed for real movement — gym sessions, street style, and
              everything between. Performance fabrics. Professional fit.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/shop" className="btn-copper">Shop Collection</Link>
              <Link href="/shop?sort=newest" className="btn-outline">New Arrivals</Link>
            </div>
            <p className="font-ui text-xs text-pearl-muted mt-6">
              {productCount}+ products · PKR & USD · COD available in Pakistan
            </p>
          </div>
        </section>

        <section className="section-pad">
          <div className="container-luxury">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="section-title text-pearl">New Arrivals</h2>
                <p className="section-eyebrow mt-2">Latest drops from the collection</p>
              </div>
              <Link href="/shop?sort=newest" className="nav-link text-sm">View all</Link>
            </div>
            <div className="product-grid">
              {newArrivals.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad border-t border-[var(--divider)]">
          <div className="container-luxury">
            <h2 className="section-title text-pearl">Shop by Category</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="luxury-card p-6 hover:border-copper/40 transition-colors group"
                >
                  <h3 className="font-display text-lg text-pearl group-hover:text-copper transition-colors">
                    {cat.name}
                  </h3>
                  <p className="font-ui text-xs text-pearl-muted mt-2">
                    {cat.productCount} products
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad border-t border-[var(--divider)]">
          <div className="container-luxury grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((t) => (
              <div key={t.title} className="luxury-card p-5">
                <t.icon size={22} className="text-copper" />
                <h3 className="font-display text-pearl mt-3">{t.title}</h3>
                <p className="font-ui text-sm text-pearl-muted mt-2">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <ReviewsSection reviews={reviews} />
      </main>
      <StoreFooter />
    </>
  );
}
