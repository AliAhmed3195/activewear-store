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

export const revalidate = 60;

const TRUST = [
  { icon: IconLock, n: "01", title: "Secure pay", desc: "COD, JazzCash, EasyPaisa & cards" },
  { icon: IconGlobe, n: "02", title: "Fast ship", desc: "Nationwide Pakistan · worldwide ready" },
  { icon: IconGem, n: "03", title: "Pro fit", desc: "Breathable fabrics built to move" },
  { icon: IconHeadset, n: "04", title: "Real help", desc: "Track, update, get support fast" },
];

const STORY = [
  {
    title: "Train-ready fabrics",
    body: "Lightweight, flexible materials that stay comfortable through heavy sessions and daily wear.",
  },
  {
    title: "Cut for movement",
    body: "Athletic silhouettes for gym, run, and street — no stiff costume feel.",
  },
  {
    title: "Built to last",
    body: "Durable construction and clean finishing so your rotation stays sharp wash after wash.",
  },
];

const CAT_IMAGES: Record<string, string> = {
  "mens-tops":
    "url(https://images.unsplash.com/photo-1583454110551-21d2eb27fc31?auto=format&fit=crop&w=1400&q=80)",
  "mens-bottoms":
    "url(https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80)",
  "womens-tops":
    "url(https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80)",
  "sets-coords":
    "url(https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80)",
};

const TICKER = [
  "Performance fabrics",
  "True-to-size fit",
  "COD across Pakistan",
  "New drops weekly",
  "Gym · Run · Street",
];

function productLabel(count: number) {
  return `${count} ${count === 1 ? "product" : "products"}`;
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

  const featured = categories[0];
  const rest = categories.slice(1);

  return (
    <>
      <StoreHeader />
      <main>
        <section className="peak-hero">
          <div className="peak-hero-media" aria-hidden="true" />
          <div className="peak-hero-grain" aria-hidden="true" />
          <div className="peak-hero-inner">
            <h1 className="peak-brand-mark">
              {name}
              <span>Performance Activewear</span>
            </h1>
            <p className="peak-hero-copy font-ui">
              {storeTagline()} Engineered for real training — breathable fabrics, sharp fit, studio
              to street.
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
              {productCount}+ styles · PKR & USD · Cash on delivery
            </p>
          </div>
          <div className="peak-hero-scroll" aria-hidden="true">
            <span>Scroll</span>
            <i />
          </div>
        </section>

        <div className="peak-ticker" aria-hidden="true">
          <div className="peak-ticker-track">
            {[...TICKER, ...TICKER].map((item, i) => (
              <span key={`${item}-${i}`}>
                {item}
                <em>·</em>
              </span>
            ))}
          </div>
        </div>

        {/* Categories — editorial bento (not 4 equal cards) */}
        <section className="section-pad peak-sec-cats">
          <div className="container-luxury">
            <div className="peak-section-head">
              <div>
                <p className="peak-section-kicker">Shop by category</p>
                <h2 className="peak-section-title section-title text-pearl">Find your gear</h2>
                <p className="peak-section-sub font-ui">
                  Tops, bottoms, and co-ords cut for training — pick your lane.
                </p>
              </div>
              <Link href="/shop" className="peak-text-link">
                View all <span aria-hidden="true">→</span>
              </Link>
            </div>

            {categories.length > 0 && (
              <div className="peak-bento">
                {featured && (
                  <Link
                    href={`/shop?category=${featured.slug}`}
                    className="peak-bento-main"
                    style={{
                      ["--cat-image" as string]:
                        CAT_IMAGES[featured.slug] ?? CAT_IMAGES["mens-tops"],
                    }}
                  >
                    <div className="peak-bento-shade" />
                    <div className="peak-bento-copy">
                      <span className="peak-bento-tag">Featured</span>
                      <h3>{featured.name}</h3>
                      <p>{productLabel(featured.productCount)}</p>
                      <span className="peak-bento-go">Shop now →</span>
                    </div>
                  </Link>
                )}
                <div className="peak-bento-side">
                  {rest.map((cat, i) => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${cat.slug}`}
                      className="peak-bento-tile"
                      style={{
                        ["--cat-image" as string]:
                          CAT_IMAGES[cat.slug] ?? CAT_IMAGES["mens-tops"],
                      }}
                    >
                      <div className="peak-bento-shade" />
                      <div className="peak-bento-copy">
                        <span className="peak-bento-tag">0{i + 2}</span>
                        <h3>{cat.name}</h3>
                        <p>
                          {productLabel(cat.productCount)}
                          <em>Shop →</em>
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Trust — dark promise band (not basic icon row) */}
        <section className="peak-promise" aria-label="Why shop with us">
          <div className="peak-promise-inner">
            {TRUST.map((t) => (
              <div key={t.title} className="peak-promise-item">
                <span className="peak-promise-n">{t.n}</span>
                <div className="peak-promise-body">
                  <span className="peak-promise-icon">
                    <t.icon size={18} />
                  </span>
                  <div>
                    <h3>{t.title}</h3>
                    <p>{t.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* New arrivals */}
        <section className="section-pad peak-sec-arrivals">
          <div className="container-luxury">
            <div className="peak-section-head">
              <div>
                <p className="peak-section-kicker">Just dropped</p>
                <h2 className="peak-section-title section-title text-pearl">New arrivals</h2>
                <p className="peak-section-sub font-ui">
                  Fresh cuts for your next session — limited sizes move fast.
                </p>
              </div>
              <Link href="/shop?sort=newest" className="peak-text-link">
                Shop new <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="product-grid">
              {newArrivals.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </div>
          </div>
        </section>

        {/* Lookband */}
        <section className="peak-lookband" aria-label="Training look">
          <div className="peak-lookband-media" role="img" aria-label="Athlete in VIFACTIVE activewear" />
          <div className="peak-lookband-copy">
            <p className="peak-section-kicker peak-kicker-on-dark">Train harder</p>
            <h2>Move with intent</h2>
            <p className="font-ui">
              From warm-up to cool-down — VIFACTIVE pieces hold their shape, breathe when you push,
              and look sharp enough for the street.
            </p>
            <div className="peak-lookband-actions">
              <Link href="/shop" className="btn-copper">
                Explore collection
              </Link>
              <Link href="/about" className="peak-ghost-link">
                Our story
              </Link>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="section-pad peak-sec-story">
          <div className="container-luxury peak-story">
            <div
              className="peak-story-visual"
              role="img"
              aria-label="Athlete training in performance wear"
            >
              <span className="peak-story-badge">Engineered for reps</span>
            </div>
            <div>
              <p className="peak-section-kicker">Why VIFACTIVE</p>
              <h2 className="peak-section-title section-title text-pearl">Gear that keeps up</h2>
              <p className="peak-section-sub font-ui" style={{ maxWidth: "28rem" }}>
                Activewear for people who train with intent — performance fabrics, clean lines, and
                custom team kits when you need names and logos.
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
              <div className="peak-story-cta-row">
                <Link href="/shop" className="btn-copper peak-story-cta">
                  Shop VIFACTIVE
                </Link>
                <Link href="/custom" className="peak-text-link">
                  Custom / Teams →
                </Link>
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
