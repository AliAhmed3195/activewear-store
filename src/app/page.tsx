import Link from "next/link";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooterServer";
import ProductCard from "@/components/store/ProductCard";
import ReviewsSection from "@/components/store/ReviewsSection";
import {
  getNewArrivals,
  getCategoryPreviews,
  getActiveProductCount,
  getApprovedReviews,
} from "@/lib/queries";
import { storeName, storeTagline } from "@/lib/utils";
import {
  IconArrowRight,
  IconGem,
  IconGlobe,
  IconHeadset,
  IconLock,
  IconRuler,
  IconShield,
} from "@/components/ui/icons";

export const revalidate = 120;

const TRUST = [
  { icon: IconLock, title: "Secure Checkout", desc: "COD, JazzCash, EasyPaisa & cards" },
  { icon: IconGlobe, title: "Ship Nationwide", desc: "Pakistan first · worldwide ready" },
  { icon: IconGem, title: "Performance Fit", desc: "Breathable fabrics built to move" },
  { icon: IconHeadset, title: "Order Support", desc: "Track, update, and get help fast" },
];

const STORY = [
  {
    icon: IconGem,
    title: "Train-ready fabrics",
    body: "Lightweight, flexible materials that stay comfortable through heavy sessions and daily wear.",
  },
  {
    icon: IconRuler,
    title: "Cut for movement",
    body: "Athletic silhouettes engineered for gym, run, and street — no stiff costume feel.",
  },
  {
    icon: IconShield,
    title: "Built to last",
    body: "Durable construction and clean finishing so your rotation stays sharp wash after wash.",
  },
];

const CAT_IMAGES: Record<string, string> = {
  "mens-tops":
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=85",
  "mens-bottoms":
    "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1000&q=85",
  "womens-tops":
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=85",
  "sets-coords":
    "https://images.unsplash.com/photo-1517836357463-d6dfe875ebe0?auto=format&fit=crop&w=1000&q=85",
};

const CAT_IMAGE_FALLBACKS = [
  "photo-1571902943202-507ec2618e8f",
  "photo-1544367567-0f2fcb009e0b",
  "photo-1571019614242-c5c5dee9f50b",
  "photo-1594381898411-5e2c99501087",
];

function categoryImageUrl(slug: string) {
  const mapped = CAT_IMAGES[slug];
  if (mapped) return mapped;
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  const id = CAT_IMAGE_FALLBACKS[hash % CAT_IMAGE_FALLBACKS.length];
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=85`;
}

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

        <section className="section-pad peak-cat-section">
          <div className="container-luxury">
            <div className="peak-section-head peak-cat-head">
              <div>
                <p className="peak-section-kicker">Shop by category</p>
                <h2 className="peak-cat-title font-display">Find your gear</h2>
              </div>
              <Link href="/shop" className="peak-cat-viewall font-ui">
                View all
                <IconArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <div
              className="peak-cat-grid"
              data-count={categories.length > 8 ? 8 : categories.length}
            >
              {categories.slice(0, 8).map((cat, i) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className={`peak-cat-card${i === 0 ? " peak-cat-card--lead" : ""}`}
                  style={{
                    ["--cat-image" as string]: `url(${categoryImageUrl(cat.slug)})`,
                  }}
                >
                  <span className="peak-cat-card-media" aria-hidden="true" />
                  <span className="peak-cat-card-scrim" aria-hidden="true" />
                  <div className="peak-cat-card-body">
                    <span className="peak-cat-card-eyebrow font-ui">Explore</span>
                    <h3>{cat.name}</h3>
                    <p className="font-ui">
                      {cat.productCount} {cat.productCount === 1 ? "product" : "products"}
                    </p>
                  </div>
                  <span className="peak-cat-card-cta font-ui" aria-hidden="true">
                    Shop
                    <IconArrowRight size={14} />
                  </span>
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

        <section className="section-pad peak-story-section border-t border-[var(--divider)]">
          <div className="container-luxury peak-story">
            <div className="peak-story-media">
              <div
                className="peak-story-visual"
                role="img"
                aria-label="Athlete training in performance wear"
              />
              <span className="peak-story-media-tag font-ui">Peak standard</span>
            </div>
            <div className="peak-story-copy">
              <p className="peak-section-kicker">Why Peak</p>
              <h2 className="peak-story-title font-display">Gear that keeps up</h2>
              <p className="peak-story-lead font-ui">
                We design activewear for people who train with intent — clean lines, serious comfort,
                and performance details you feel the moment you move.
              </p>
              <ul className="peak-story-points">
                {STORY.map((item, i) => (
                  <li key={item.title} className="peak-story-point">
                    <span className="peak-story-index" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="peak-story-point-icon" aria-hidden="true">
                      <item.icon size={18} />
                    </span>
                    <div className="peak-story-point-body">
                      <strong>{item.title}</strong>
                      <p className="font-ui">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/about" className="peak-story-cta font-ui">
                Read our story
                <IconArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <ReviewsSection reviews={reviews} title="Athlete feedback" />
      </main>
      <StoreFooter />
    </>
  );
}
