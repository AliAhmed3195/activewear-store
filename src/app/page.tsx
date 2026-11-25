import Link from "next/link";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooter";
import ReviewsSection from "@/components/store/ReviewsSection";
import HomeSlider, { type HomeSlide } from "@/components/store/HomeSlider";
import GenderProductTabs from "@/components/store/GenderProductTabs";
import {
  getNewArrivalsExclusive,
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
  { icon: IconLock, title: "Secure pay", desc: "COD, JazzCash, EasyPaisa & cards" },
  { icon: IconGlobe, title: "Fast ship", desc: "Nationwide Pakistan · worldwide ready" },
  { icon: IconGem, title: "Pro fabrics", desc: "Verified GSM · sublimation-ready knits" },
  { icon: IconHeadset, title: "Real help", desc: "WhatsApp + order tracking" },
];

const SHOP_CATEGORIES = [
  {
    title: "Sports Kits",
    href: "/shop?category=mens-sets",
    image: "/vifactive/exquisite-camo-front.jpg",
  },
  {
    title: "Tracksuits & Sets",
    href: "/shop?category=mens-trousers",
    image: "/vifactive/tee-08.jpg",
  },
  {
    title: "Polo & Training",
    href: "/shop?category=mens-polo-shirts",
    image: "/vifactive/tee-06.jpg",
  },
  {
    title: "Custom Teamwear",
    href: "/custom",
    image: "/vifactive/exquisite-scratch.jpg",
  },
];

const TICKER = [
  "COD across Pakistan",
  "True-to-size fit",
  "Performance fabrics",
  "Custom team print",
  "Men · Women · Kids",
];

const SLIDES: HomeSlide[] = [
  {
    id: "1",
    eyebrow: "VIFACTIVE",
    title: "Move with intent.",
    subtitle: "Performance sportswear and team kits for every match and every move.",
    ctaLabel: "Shop Sportswear",
    ctaHref: "/shop",
    secondaryLabel: "Custom Teamwear",
    secondaryHref: "/custom",
    image: "/vifactive/exquisite-camo-front.jpg",
  },
  {
    id: "2",
    eyebrow: "New drop",
    title: "Train. Look sharp.",
    subtitle: "Fresh cuts for gym, run, and street — shop men and women essentials.",
    ctaLabel: "Shop New",
    ctaHref: "/shop?sort=newest",
    secondaryLabel: "Shop Men",
    secondaryHref: "/shop?gender=MEN",
    image: "/vifactive/exquisite-scratch.jpg",
  },
  {
    id: "3",
    eyebrow: "Women",
    title: "Built for every move.",
    subtitle: "Activewear that holds shape, breathes under pressure, and stays sharp.",
    ctaLabel: "Shop Women",
    ctaHref: "/shop?gender=WOMEN",
    secondaryLabel: "Shop All",
    secondaryHref: "/shop",
    image: "/vifactive/exquisite-gradient.jpg",
  },
  {
    id: "4",
    eyebrow: "Custom / Teams",
    title: "Names. Numbers. Logos.",
    subtitle: "Club and gym kits on pro fabrics — quote in minutes, 6-piece minimum.",
    ctaLabel: "Build Your Team Kit",
    ctaHref: "/custom",
    secondaryLabel: "Fabric Tech",
    secondaryHref: "/fabric",
    image: "/vifactive/exquisite-camo-back.jpg",
  },
];

export default async function HomePage() {
  const name = storeName();

  let newArrivals: Awaited<ReturnType<typeof getNewArrivalsExclusive>> = [];
  let productCount = 0;
  let reviews: Awaited<ReturnType<typeof getApprovedReviews>> = [];
  let bestSellers: Awaited<ReturnType<typeof getBestSellersPool>> = [];
  let settings: Awaited<ReturnType<typeof getSiteSettings>> | null = null;

  try {
    [bestSellers, productCount, reviews, settings] = await Promise.all([
      getBestSellersPool(24),
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

  const slides = SLIDES.map((s, i) =>
    i === 0
      ? {
          ...s,
          subtitle: `${s.subtitle} ${productCount > 0 ? `${productCount}+ styles.` : storeTagline()}`,
        }
      : s
  );

  return (
    <>
      <StoreHeader />
      <main className="home-premium">
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

        <section className="section-pad nike-cats" aria-labelledby="shop-by-category">
          <div className="container-luxury">
            <div className="peak-section-head">
              <div>
                <p className="peak-section-kicker">Shop by category</p>
                <h2 id="shop-by-category" className="peak-section-title section-title text-pearl">
                  Find your kit
                </h2>
              </div>
              <Link href="/shop" className="peak-text-link">
                View all <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="nike-cat-grid">
              {SHOP_CATEGORIES.map((cat) => (
                <Link
                  key={cat.title}
                  href={cat.href}
                  className="nike-cat-tile"
                  style={{ backgroundImage: `url(${cat.image})` }}
                >
                  <span className="nike-cat-shade" aria-hidden="true" />
                  <span className="nike-cat-label">{cat.title}</span>
                  <span className="nike-cat-go" aria-hidden="true">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

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

        <section className="peak-promise nike-promise" aria-label="Why shop with us">
          <div className="peak-promise-inner">
            {TRUST.map((t) => (
              <div key={t.title} className="peak-promise-item">
                <span className="peak-promise-icon">
                  <t.icon size={18} />
                </span>
                <div>
                  <h3>{t.title}</h3>
                  <p>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="peak-fabric-strip nike-fabric" aria-label="Fabric program">
          <div className="container-luxury peak-fabric-strip-inner">
            <div className="peak-fabric-strip-copy">
              <p className="peak-section-kicker">Fabric technology</p>
              <h2 className="peak-fabric-strip-title">Verified performance knits</h2>
              <p className="nike-fabric-sub font-ui">
                Real GSM weights from our fabric program — no invented tech claims.
              </p>
            </div>
            <div className="peak-fabric-pills">
              {FABRIC_OPTIONS.slice(0, 5).map((f) => (
                <Link key={f.id} href={`/fabric#${f.id}`} className="peak-fabric-pill is-link">
                  <strong>{f.name}</strong>
                  <em>{f.gsm}</em>
                </Link>
              ))}
              <Link href="/fabric" className="peak-fabric-pill is-link">
                Full fabric guide →
              </Link>
            </div>
          </div>
        </section>

        <section className="peak-lookband nike-lookband" aria-label="Custom teamwear">
          <div
            className="peak-lookband-media"
            role="img"
            aria-label="VIFACTIVE custom teamwear"
          />
          <div className="peak-lookband-copy">
            <p className="peak-section-kicker peak-kicker-on-dark">Custom teamwear</p>
            <h2>Build your team kit</h2>
            <p className="font-ui">
              Jerseys, names, numbers, and logos for clubs and gyms — 6-piece minimum with a
              fast quote response.
            </p>
            <div className="peak-lookband-actions">
              <Link href="/custom" className="btn-pill btn-pill-solid">
                Request a quote
              </Link>
              <Link href="/fabric" className="btn-pill btn-pill-ghost">
                See fabrics
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
