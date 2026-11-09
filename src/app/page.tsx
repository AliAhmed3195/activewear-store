import Link from "next/link";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";
import ProductCard from "@/components/store/ProductCard";
import ReviewsSection from "@/components/store/ReviewsSection";
import HomeSlider, { type HomeSlide } from "@/components/store/HomeSlider";
import BestSellersSection from "@/components/store/BestSellersSection";
import {
  getNewArrivals,
  getCategoryPreviews,
  getActiveProductCount,
  getApprovedReviews,
  getBestSellers,
} from "@/lib/queries";
import { storeName, storeTagline } from "@/lib/utils";
import { FABRIC_OPTIONS } from "@/lib/fabric-catalog";
import { getHeroUrl } from "@/lib/product-mapper";
import { IconLock, IconGlobe, IconGem, IconHeadset } from "@/components/ui/icons";

export const revalidate = 60;

const TRUST = [
  { icon: IconLock, n: "01", title: "Secure pay", desc: "COD, JazzCash, EasyPaisa & cards" },
  { icon: IconGlobe, n: "02", title: "Fast ship", desc: "Nationwide Pakistan · worldwide ready" },
  { icon: IconGem, n: "03", title: "Pro fabrics", desc: "Sublimation-ready performance knits" },
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
  "mens-polo-shirts": "url(/vifactive/exquisite-camo-front.jpg)",
  "mens-trousers":
    "url(https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80)",
  "mens-casual-wear": "url(/vifactive/exquisite-gradient.jpg)",
  "mens-sets":
    "url(https://images.unsplash.com/photo-1583454110551-21d2eb27fc31?auto=format&fit=crop&w=1200&q=80)",
  "womens-polo-shirts": "url(/vifactive/pro-tee-04.jpg)",
  "womens-shirts": "url(/vifactive/tee-06.jpg)",
  "womens-sets": "url(/vifactive/exquisite-scratch.jpg)",
  "womens-activewear": "url(/vifactive/exquisite-gradient.jpg)",
  "kids-bottoms": "url(/vifactive/tee-08.jpg)",
  "kids-shirts": "url(/vifactive/tee-04.jpg)",
  "kids-coords": "url(/vifactive/pro-tee-green.jpg)",
  "kids-other": "url(/vifactive/pro-tee-02.jpg)",
  accessories: "url(/vifactive/pro-tee-03.jpg)",
};

const TICKER = [
  "Performance fabrics",
  "True-to-size fit",
  "COD across Pakistan",
  "Custom team print",
  "Gym · Run · Street",
];

function productLabel(count: number) {
  return `${count} ${count === 1 ? "product" : "products"}`;
}

const SLIDES: HomeSlide[] = [
  {
    id: "1",
    eyebrow: "New season edit",
    title: "Performance Activewear",
    subtitle:
      "Engineered for real training — breathable fabrics, sharp fit, studio to street.",
    ctaLabel: "Shop Collection",
    ctaHref: "/shop",
    secondaryLabel: "Custom / Teams",
    secondaryHref: "/custom",
    image:
      "https://images.unsplash.com/photo-1583454110551-21d2eb27fc31?auto=format&fit=crop&w=2000&q=80",
  },
  {
    id: "2",
    eyebrow: "Best sellers",
    title: "Train-ready essentials",
    subtitle: "Men, women, and kids gear with clear sizes and fast add-to-cart.",
    ctaLabel: "Shop Best Sellers",
    ctaHref: "/shop?sort=rating",
    secondaryLabel: "Shop Men",
    secondaryHref: "/shop?gender=MEN",
    image: "/vifactive/exquisite-camo-front.jpg",
  },
  {
    id: "3",
    eyebrow: "Custom kits",
    title: "Names, numbers, logos",
    subtitle: "Team merch on pro fabrics — request a quote in minutes.",
    ctaLabel: "Start Custom Order",
    ctaHref: "/custom",
    secondaryLabel: "View Fabrics",
    secondaryHref: "/custom#fabrics",
    image: "/vifactive/exquisite-gradient.jpg",
  },
];

export default async function HomePage() {
  const name = storeName();

  let newArrivals: Awaited<ReturnType<typeof getNewArrivals>> = [];
  let categories: Awaited<ReturnType<typeof getCategoryPreviews>> = [];
  let productCount = 0;
  let reviews: Awaited<ReturnType<typeof getApprovedReviews>> = [];
  let bestSellers: Awaited<ReturnType<typeof getBestSellers>> = [];

  try {
    [newArrivals, categories, productCount, reviews, bestSellers] = await Promise.all([
      getNewArrivals(8),
      getCategoryPreviews(),
      getActiveProductCount(),
      getApprovedReviews(6),
      getBestSellers(8),
    ]);
  } catch (error) {
    console.error("[homepage] failed to load catalog", error);
  }

  const shopCategories = categories.filter((c) => !c.name.toLowerCase().includes("legacy"));
  const featured = shopCategories[0];
  const rest = shopCategories.slice(1, 5);
  const spotlight = newArrivals.slice(0, 1)[0];
  const arrivalGrid = spotlight ? newArrivals.slice(1) : newArrivals;

  const slides = SLIDES.map((s, i) =>
    i === 0
      ? {
          ...s,
          subtitle: `${storeTagline()} ${s.subtitle} ${productCount}+ styles · PKR & USD · COD.`,
        }
      : s
  );

  return (
    <>
      <StoreHeader />
      <main>
        <HomeSlider slides={slides} brandName={name} />

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

        <section className="peak-fabric-strip" aria-label="Fabric program">
          <div className="container-luxury peak-fabric-strip-inner">
            <div className="peak-fabric-strip-copy">
              <p className="peak-section-kicker">Fabric program</p>
              <h2 className="peak-fabric-strip-title">Built on performance knits</h2>
            </div>
            <div className="peak-fabric-pills">
              {FABRIC_OPTIONS.slice(0, 5).map((f) => (
                <span key={f.id} className="peak-fabric-pill">
                  <strong>{f.name}</strong>
                  <em>{f.gsm}</em>
                </span>
              ))}
              <Link href="/custom" className="peak-fabric-pill is-link">
                Custom kits →
              </Link>
            </div>
          </div>
        </section>

        <BestSellersSection products={bestSellers} />

        <section className="section-pad peak-sec-cats">
          <div className="container-luxury">
            <div className="peak-section-head">
              <div>
                <p className="peak-section-kicker">Shop by category</p>
                <h2 className="peak-section-title section-title text-pearl">Find your gear</h2>
                <p className="peak-section-sub font-ui">
                  Men, women, kids, and accessories — clear menus, quick shopping.
                </p>
              </div>
              <Link href="/shop" className="peak-text-link">
                View all <span aria-hidden="true">→</span>
              </Link>
            </div>

            {shopCategories.length > 0 && (
              <div className="peak-bento">
                {featured && (
                  <Link
                    href={`/shop?category=${featured.slug}`}
                    className="peak-bento-main"
                    style={{
                      ["--cat-image" as string]:
                        CAT_IMAGES[featured.slug] ?? CAT_IMAGES["mens-casual-wear"],
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
                          CAT_IMAGES[cat.slug] ?? CAT_IMAGES["mens-casual-wear"],
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

        <section className="section-pad peak-sec-arrivals">
          <div className="container-luxury">
            <div className="peak-section-head">
              <div>
                <p className="peak-section-kicker">Just dropped</p>
                <h2 className="peak-section-title section-title text-pearl">New arrivals</h2>
                <p className="peak-section-sub font-ui">
                  Fresh cuts for your next session — pick a size and add to cart.
                </p>
              </div>
              <Link href="/shop?sort=newest" className="peak-text-link">
                Shop new <span aria-hidden="true">→</span>
              </Link>
            </div>

            {spotlight && (
              <Link href={`/product/${spotlight.slug}`} className="peak-spotlight">
                <div className="peak-spotlight-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getHeroUrl(spotlight) || "/vifactive/exquisite-camo-front.jpg"}
                    alt={spotlight.name}
                  />
                </div>
                <div className="peak-spotlight-copy">
                  <p className="peak-section-kicker">Editor’s pick</p>
                  <h3>{spotlight.name}</h3>
                  <p>{spotlight.tagline}</p>
                  <span className="peak-bento-go">View product →</span>
                </div>
              </Link>
            )}

            <div className="product-grid">
              {arrivalGrid.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} showSizes />
              ))}
            </div>
          </div>
        </section>

        <section className="peak-lookband" aria-label="Training look">
          <div
            className="peak-lookband-media"
            role="img"
            aria-label="Athlete in VIFACTIVE activewear"
          />
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
                <Link href="/account" className="peak-text-link">
                  Sign In / My Account →
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
