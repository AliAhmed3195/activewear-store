import Link from "next/link";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";
import ReviewsSection from "@/components/store/ReviewsSection";
import HomeSlider, { type HomeSlide } from "@/components/store/HomeSlider";
import GenderProductTabs from "@/components/store/GenderProductTabs";
import {
  getNewArrivalsExclusive,
  getCategoryPreviews,
  getActiveProductCount,
  getApprovedReviews,
  getBestSellersPool,
} from "@/lib/queries";
import { storeName, storeTagline } from "@/lib/utils";
import { FABRIC_OPTIONS } from "@/lib/fabric-catalog";
import { IconLock, IconGlobe, IconGem, IconHeadset } from "@/components/ui/icons";
import { getSiteSettings, isSaleLive } from "@/lib/site-settings";

export const revalidate = 60;

const TRUST = [
  { icon: IconLock, n: "01", title: "Secure pay", desc: "COD, JazzCash, EasyPaisa & cards" },
  { icon: IconGlobe, n: "02", title: "Fast ship", desc: "Nationwide Pakistan · worldwide ready" },
  { icon: IconGem, n: "03", title: "Pro fabrics", desc: "Sublimation-ready performance knits" },
  { icon: IconHeadset, n: "04", title: "Real help", desc: "WhatsApp + order tracking" },
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
  "mens-trousers": "url(/vifactive/tee-08.jpg)",
  "mens-casual-wear": "url(/vifactive/exquisite-gradient.jpg)",
  "mens-sets": "url(/vifactive/exquisite-scratch.jpg)",
  "womens-polo-shirts": "url(/vifactive/tee-06.jpg)",
  "womens-shirts": "url(/vifactive/tee-04.jpg)",
  "womens-sets": "url(/vifactive/exquisite-scratch.jpg)",
  "womens-activewear": "url(/vifactive/exquisite-gradient.jpg)",
  "kids-bottoms": "url(/vifactive/tee-08.jpg)",
  "kids-shirts": "url(/vifactive/tee-04.jpg)",
  "kids-coords": "url(/vifactive/exquisite-camo-front.jpg)",
  "kids-other": "url(/vifactive/tee-07.jpg)",
  accessories: "url(/vifactive/tee-07.jpg)",
};

const TICKER = [
  "COD across Pakistan",
  "True-to-size fit",
  "Performance fabrics",
  "Custom team print",
  "Gym · Run · Street",
];

function productLabel(count: number) {
  return `${count} ${count === 1 ? "product" : "products"}`;
}

const SLIDES: HomeSlide[] = [
  {
    id: "1",
    eyebrow: "VIFACTIVE",
    title: "Train. Look sharp.",
    subtitle: "Performance activewear for gym, run, and everyday — COD nationwide.",
    ctaLabel: "Shop Now",
    ctaHref: "/shop",
    image: "/vifactive/exquisite-camo-front.jpg",
  },
  {
    id: "2",
    eyebrow: "New arrivals",
    title: "Fresh cuts this week",
    subtitle: "Men and women essentials — shop the latest drop.",
    ctaLabel: "Shop New",
    ctaHref: "/shop?sort=newest",
    image: "/vifactive/exquisite-gradient.jpg",
  },
  {
    id: "3",
    eyebrow: "Custom / Teams",
    title: "Names, numbers, logos",
    subtitle: "Team kits on pro fabrics — request a quote in minutes.",
    ctaLabel: "Custom Order",
    ctaHref: "/custom",
    image: "/vifactive/exquisite-scratch.jpg",
  },
];

export default async function HomePage() {
  const name = storeName();

  let newArrivals: Awaited<ReturnType<typeof getNewArrivalsExclusive>> = [];
  let categories: Awaited<ReturnType<typeof getCategoryPreviews>> = [];
  let productCount = 0;
  let reviews: Awaited<ReturnType<typeof getApprovedReviews>> = [];
  let bestSellers: Awaited<ReturnType<typeof getBestSellersPool>> = [];
  let settings: Awaited<ReturnType<typeof getSiteSettings>> | null = null;

  try {
    [bestSellers, categories, productCount, reviews, settings] = await Promise.all([
      getBestSellersPool(24),
      getCategoryPreviews(),
      getActiveProductCount(),
      getApprovedReviews(6),
      getSiteSettings(),
    ]);
    const exclude = bestSellers.slice(0, 12).map((p) => p.id);
    newArrivals = await getNewArrivalsExclusive(24, exclude);
  } catch (error) {
    console.error("[homepage] failed to load catalog", error);
  }

  const saleLive = settings ? isSaleLive(settings) : false;

  const shopCategories = categories
    .filter((c) => !c.name.toLowerCase().includes("legacy") && c.productCount > 0)
    .slice(0, 5);
  const featured = shopCategories[0];
  const rest = shopCategories.slice(1);

  const slides = SLIDES.map((s, i) =>
    i === 0
      ? {
          ...s,
          subtitle: `${storeTagline()} ${s.subtitle} ${productCount}+ styles.`,
        }
      : s
  );

  return (
    <>
      <StoreHeader />
      <main>
        <HomeSlider slides={slides} brandName={name} />

        {saleLive && settings && (
          <div className="sale-banner" role="status">
            <div className="sale-banner-inner">
              <strong>{settings.saleBadgeLabel}</strong>
              <span>
                {settings.saleBannerText ||
                  "Limited-time savings on select performance pieces."}
              </span>
              <Link href="/shop?onSale=1">Shop sale →</Link>
            </div>
          </div>
        )}

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

        <GenderProductTabs
          kicker="Most loved"
          title="Best Sellers"
          subtitle="Top picks — switch Men / Women and shop fast."
          products={bestSellers}
          viewAllHref="/shop?sort=rating"
          viewAllLabel="Shop best sellers"
        />

        <GenderProductTabs
          kicker="Just dropped"
          title="New Arrivals"
          subtitle="Fresh styles this week — pick your lane."
          products={newArrivals}
          viewAllHref="/shop?sort=newest"
          viewAllLabel="Shop new"
        />

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

        <section className="section-pad peak-sec-cats">
          <div className="container-luxury">
            <div className="peak-section-head">
              <div>
                <p className="peak-section-kicker">Shop by category</p>
                <h2 className="peak-section-title section-title text-pearl">Find your gear</h2>
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
                        <span className="peak-bento-tag">Shop</span>
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
              <p className="peak-section-kicker">Why {name}</p>
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
                  Shop {name}
                </Link>
                <Link href="/contact" className="peak-text-link">
                  Contact us →
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
