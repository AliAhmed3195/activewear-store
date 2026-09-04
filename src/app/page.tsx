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
  { icon: IconLock, title: "Secure Checkout", desc: "COD, JazzCash, EasyPaisa & cards" },
  { icon: IconGlobe, title: "Ship Nationwide", desc: "Pakistan first · worldwide ready" },
  { icon: IconGem, title: "Performance Fit", desc: "Breathable fabrics built to move" },
  { icon: IconHeadset, title: "Order Support", desc: "Track, update, and get help fast" },
];

const STORY = [
  {
    title: "Train-ready fabrics",
    body: "Lightweight, flexible materials that stay comfortable through heavy sessions and daily wear.",
  },
  {
    title: "Cut for movement",
    body: "Athletic silhouettes engineered for gym, run, and street — no stiff costume feel.",
  },
  {
    title: "Built to last",
    body: "Durable construction and clean finishing so your rotation stays sharp wash after wash.",
  },
];

const CAT_IMAGES: Record<string, string> = {
  "mens-tops":
    "url(https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80)",
  "mens-bottoms":
    "url(https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=900&q=80)",
  "womens-tops":
    "url(https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80)",
  "sets-coords":
    "url(https://images.unsplash.com/photo-1599058945522-28d584b6f14f?auto=format&fit=crop&w=900&q=80)",
};

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
        <section className="peak-hero">
          <div className="peak-hero-media" aria-hidden="true" />
          <div className="peak-hero-inner">
            <h1 className="peak-brand-mark">
              {name}
              <span>Performance Activewear</span>
            </h1>
            <p className="peak-hero-copy font-ui">
              {storeTagline()} Premium gym wear engineered for real training — breathable fabrics,
              sharp fit, and everyday confidence from studio to street.
            </p>
            <div className="peak-hero-actions">
              <Link href="/shop" className="btn-copper">
                Shop Collection
              </Link>
              <Link href="/shop?sort=newest" className="btn-outline">
                New Arrivals
              </Link>
            </div>
            <p className="peak-hero-meta font-ui">
              {productCount}+ styles · PKR & USD · COD across Pakistan
            </p>
          </div>
        </section>

        <section className="section-pad">
          <div className="container-luxury">
            <div className="peak-section-head">
              <div>
                <p className="peak-section-kicker">Shop by category</p>
                <h2 className="peak-section-title section-title text-pearl">Find your gear</h2>
              </div>
              <Link href="/shop" className="nav-link text-sm">
                View all
              </Link>
            </div>
            <div className="peak-cat-grid">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="peak-cat-card"
                  style={{
                    ["--cat-image" as string]: CAT_IMAGES[cat.slug] ?? CAT_IMAGES["mens-tops"],
                  }}
                >
                  <div className="peak-cat-card-body">
                    <h3>{cat.name}</h3>
                    <p className="font-ui">{cat.productCount} products</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="peak-trust">
          {TRUST.map((t) => (
            <div key={t.title} className="peak-trust-item">
              <t.icon size={20} className="text-copper mx-auto" />
              <h3 className="text-pearl">{t.title}</h3>
              <p className="font-ui">{t.desc}</p>
            </div>
          ))}
        </section>

        <section className="section-pad">
          <div className="container-luxury">
            <div className="peak-section-head">
              <div>
                <p className="peak-section-kicker">Just dropped</p>
                <h2 className="peak-section-title section-title text-pearl">New arrivals</h2>
              </div>
              <Link href="/shop?sort=newest" className="nav-link text-sm">
                Shop new
              </Link>
            </div>
            <div className="product-grid">
              {newArrivals.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad border-t border-[var(--divider)]">
          <div className="container-luxury peak-story">
            <div className="peak-story-visual" role="img" aria-label="Athlete training in performance wear" />
            <div>
              <p className="peak-section-kicker">Why Peak</p>
              <h2 className="peak-section-title section-title text-pearl">
                Gear that keeps up
              </h2>
              <p className="font-ui text-pearl-muted mt-4 max-w-md leading-relaxed">
                We design activewear for people who train with intent — clean lines, serious comfort,
                and performance details you feel the moment you move.
              </p>
              <div className="peak-story-points">
                {STORY.map((item, i) => (
                  <div key={item.title} className="peak-story-point">
                    <span className="peak-story-index">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <strong className="text-pearl">{item.title}</strong>
                      <span className="font-ui">{item.body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <ReviewsSection reviews={reviews} title="Athlete feedback" />
      </main>
      <StoreFooter />
    </>
  );
}
